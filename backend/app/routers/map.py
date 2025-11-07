from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2
from typing import List
import uuid

from app.db.database import get_db
from app.models.poi import POI
from app.models.map import Map
from app.models.checkin import Checkin
from app.models.user import User
from app.schemas.map_schema import MapOut, PoiOut
from app.schemas.checkin_schema import CheckinRequest, CheckinReceipt, VehicleConfirmRequest
from app.crud import map_crud, checkin_crud

router = APIRouter(prefix="/map", tags=["map"])

# --- Helpers ---
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Tính khoảng cách giữa 2 điểm (lat, lon) theo mét (Haversine formula)
    """
    R = 6371_000.0  # bán kính Trái Đất tính theo mét
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

GPS_RADIUS_M = 120.0  # bán kính hợp lệ để check-in (tùy chỉnh)


# --- Interactive Map endpoints ---

@router.get("/list", response_model=List[MapOut])
def get_maps(db: Session = Depends(get_db)):
    """
    Lấy danh sách bản đồ
    """
    return map_crud.list_maps(db)


@router.get("/{map_id}/pois", response_model=List[PoiOut])
def get_pois(
    map_id: int,
    user_id: int | None = None,
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách các POI thuộc bản đồ
    Nếu có user_id → đánh dấu các điểm đã check-in
    """
    pois = map_crud.list_pois_by_map(db, map_id)

    if user_id:
        visited_ids = set(
            [cid for (cid,) in db.query(Checkin.poi_id).filter(Checkin.user_id == user_id).all()]
        )
        out = []
        for p in pois:
            item = PoiOut.from_orm(p)
            item.visited = p.id in visited_ids
            out.append(item)
        return out

    return [PoiOut.from_orm(p) for p in pois]


@router.get("/nearest", response_model=MapOut)
def get_nearest_map(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db)
):
    """
    Lấy bản đồ có center gần nhất với tọa độ hiện tại
    """
    maps = map_crud.list_maps(db)
    if not maps:
        raise HTTPException(status_code=404, detail="No maps found")

    best = min(maps, key=lambda m: haversine_m(lat, lng, m.center_lat, m.center_lng))
    return MapOut.from_orm(best)


# --- Check-in flow ---

@router.post("/checkin", response_model=CheckinReceipt)
def checkin(payload: CheckinRequest, db: Session = Depends(get_db)):
    """
    Xử lý check-in tại một POI (xác thực GPS)
    """
    user = db.get(User, payload.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    poi = db.get(POI, payload.poi_id)
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")

    # Kiểm tra khoảng cách GPS
    dist = haversine_m(payload.user_lat, payload.user_lng, poi.lat, poi.lng)
    if dist > GPS_RADIUS_M:
        raise HTTPException(status_code=400, detail=f"Too far from POI ({dist:.1f}m)")

    # Chống check-in trùng
    if checkin_crud.user_has_checked(db, payload.user_id, payload.poi_id):
        raise HTTPException(status_code=400, detail="Already checked in")

    receipt_no = f"RC-{uuid.uuid4().hex[:10].upper()}"

    check, total = checkin_crud.create_checkin(
        db, payload.user_id, payload.poi_id, dist, poi.score, receipt_no
    )

    return CheckinReceipt(
        checkin_id=check.id,
        poi_name=poi.name,
        distance_m=round(dist, 1),
        earned_points=poi.score,
        vehicle_bonus=0,
        total_points=total,
        receipt_no=receipt_no,
    )


@router.post("/checkin/{checkin_id}/vehicle", response_model=CheckinReceipt)
def confirm_vehicle(
    checkin_id: int,
    body: VehicleConfirmRequest,
    db: Session = Depends(get_db)
):
    """
    Người dùng xác nhận phương tiện → cộng điểm thưởng tương ứng
    """
    check = db.get(Checkin, checkin_id)
    if not check:
        raise HTTPException(status_code=404, detail="Check-in not found")

    poi = db.get(POI, check.poi_id)
    user = db.get(User, check.user_id)

    bonus_map = {
        "walk": 10,
        "bike": 8,
        "bus": 5,
        "ev_scooter": 6,
        "car": 0,
    }

    bonus = bonus_map.get(body.vehicle_type, 0)
    check, total = checkin_crud.add_vehicle_bonus(db, checkin_id, body.vehicle_type, bonus)

    return CheckinReceipt(
        checkin_id=check.id,
        poi_name=poi.name,
        distance_m=round(check.distance_m, 1),
        earned_points=check.earned_points,
        vehicle_bonus=check.vehicle_bonus,
        total_points=total,
        receipt_no=check.receipt_no,
    )
