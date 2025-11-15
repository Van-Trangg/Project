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
from app.schemas.checkin_schema import CheckinRequest, CheckinReceipt
from app.crud import map_crud, checkin_crud
from app.core.security import get_current_user

router = APIRouter(prefix="/map", tags=["map"])

# --- Helpers ---
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Tính khoảng cách giữa 2 điểm (lat, lon) theo mét (Haversine formula)."""
    R = 6371_000.0  # bán kính Trái Đất tính theo mét
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

GPS_RADIUS_M = 120.0  # bán kính hợp lệ để check-in (mét)


# --- Map routes ---

@router.get("/list", response_model=List[MapOut])
def get_maps(db: Session = Depends(get_db)):
    """Lấy danh sách bản đồ."""
    return map_crud.list_maps(db)


@router.get("/{map_id}/pois", response_model=List[PoiOut])
def get_pois(
    map_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Lấy danh sách các POI trong map.
    Nếu user đã check-in ở POI nào → đánh dấu `visited = True`
    """
    pois = map_crud.list_pois_by_map(db, map_id)

    visited_ids = set(
        [cid for (cid,) in db.query(Checkin.poi_id).filter(Checkin.user_id == user.id).all()]
    )

    result = []
    for p in pois:
        item = PoiOut.from_orm(p)
        item.visited = p.id in visited_ids
        result.append(item)

    return result


@router.get("/nearest", response_model=MapOut)
def get_nearest_map(
    lat: float = Query(...),
    lng: float = Query(...),
    db: Session = Depends(get_db)
):
    """Lấy bản đồ có tâm gần nhất với tọa độ hiện tại."""
    maps = map_crud.list_maps(db)
    if not maps:
        raise HTTPException(status_code=404, detail="No maps found")

    best = min(maps, key=lambda m: haversine_m(lat, lng, m.center_lat, m.center_lng))
    return MapOut.from_orm(best)


# --- Check-in routes ---
@router.post("/checkin", response_model=CheckinReceipt)
def checkin(
    payload: CheckinRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Xử lý check-in tại một POI (xác thực GPS + chống trùng)."""
    # --- Kiểm tra POI tồn tại ---
    poi = db.get(POI, payload.poi_id)
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")

    # --- Kiểm tra khoảng cách GPS ---
    dist = haversine_m(payload.user_lat, payload.user_lng, poi.lat, poi.lng)
    if dist > GPS_RADIUS_M:
        raise HTTPException(status_code=400, detail=f"Too far from POI ({dist:.1f}m)")

    # --- Chống check-in trùng ---
    if checkin_crud.user_has_checked(db, user.id, payload.poi_id):
        raise HTTPException(status_code=400, detail="Already checked in")

    # --- Tạo mã biên nhận ---
    receipt_no = f"RC-{uuid.uuid4().hex[:10].upper()}"

    # --- Ghi nhận check-in (đã bao gồm cập nhật điểm & checked_users) ---
    check, total = checkin_crud.create_checkin(
        db, user.id, payload.poi_id, dist, poi.score, receipt_no
    )

    # --- Trả về kết quả ---
    return CheckinReceipt(
        checkin_id=check.id,
        poi_name=poi.name,
        distance_m=round(dist, 1),
        earned_points=poi.score,
        total_points=total,
        receipt_no=receipt_no,
    )



@router.get("/poi/{poi_id}/checked", response_model=dict)
def check_poi_status(
    poi_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    """
    Kiểm tra user hiện tại đã check-in tại POI này chưa.
    Trả về: {"checked": true/false}
    """
    checked = checkin_crud.user_has_checked(db, user.id, poi_id)
    return {"checked": checked}


@router.get("/poi/{poi_id}/checked/percent", response_model=dict)
def check_poi_percentage(
    poi_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)  # yêu cầu đăng nhập để xem thống kê
):
    """
    Tính % người dùng đã check-in tại POI này trên tổng số người dùng.
    Trả về: { "poi_id", "checked_users", "total_users", "percent" }
    """
    total_users = checkin_crud.count_total_users(db)
    checked_users = checkin_crud.count_checked_users_for_poi(db, poi_id)

    if total_users == 0:
        percent = 0.0
    else:
        percent = round(checked_users * 100.0 / total_users, 2)

    return {
        "poi_id": poi_id,
        "checked_users": checked_users,
        "total_users": total_users,
        "percent": percent
    }
