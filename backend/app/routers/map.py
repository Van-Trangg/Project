from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from math import radians, sin, cos, sqrt, atan2
from typing import List
from app.db.database import get_session
from app.models.poi import POI
from app.models.map import Map
from app.models.checkin import Checkin
from app.models.user import User
from app.schemas.map_schema import MapOut, PoiOut
from app.schemas.checkin_schema import CheckinRequest, CheckinReceipt, VehicleConfirmRequest
from app.crud import map_crud, checkin_crud
import uuid

router = APIRouter(prefix="/map", tags=["map"])

# --- helpers ---
def haversine_m(lat1, lon1, lat2, lon2):
    R = 6371_000.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1))*cos(radians(lat2))*sin(dlon/2)**2
    return R * 2 * atan2(sqrt(a), sqrt(1-a))

GPS_RADIUS_M = 120.0  # bán kính hợp lệ để check-in (tùy chỉnh)

# --- Interactive Map endpoints ---

@router.get("/list", response_model=List[MapOut])
def get_maps(session: Session = Depends(get_session)):
    return map_crud.list_maps(session)

@router.get("/{map_id}/pois", response_model=List[PoiOut])
def get_pois(map_id: int, user_id: int | None = None, session: Session = Depends(get_session)):
    pois = map_crud.list_pois_by_map(session, map_id)
    # gắn cờ visited nếu cung cấp user_id
    if user_id:
        visited_ids = set([cid for (cid,) in session.exec(
            select(Checkin.poi_id).where(Checkin.user_id == user_id)
        ).all()])
        out = []
        for p in pois:
            item = PoiOut.model_validate(p)
            item.visited = p.id in visited_ids
            out.append(item)
        return out
    return [PoiOut.model_validate(p) for p in pois]

@router.get("/nearest", response_model=MapOut)
def get_nearest_map(lat: float = Query(...), lng: float = Query(...), session: Session = Depends(get_session)):
    maps = map_crud.list_maps(session)
    if not maps:
        raise HTTPException(404, "No maps")
    # map nào có center gần nhất
    best = min(maps, key=lambda m: haversine_m(lat, lng, m.center_lat, m.center_lng))
    return MapOut.model_validate(best)

# --- Check-in flow ---

@router.post("/checkin", response_model=CheckinReceipt)
def checkin(payload: CheckinRequest, session: Session = Depends(get_session)):
    user = session.get(User, payload.user_id)
    if not user:
        raise HTTPException(404, "User not found")
    poi = session.get(POI, payload.poi_id)
    if not poi:
        raise HTTPException(404, "POI not found")

    # GPS validation
    dist = haversine_m(payload.user_lat, payload.user_lng, poi.lat, poi.lng)
    if dist > GPS_RADIUS_M:
        raise HTTPException(400, detail=f"Too far from POI ({dist:.1f}m)")

    # chống check-in trùng
    if checkin_crud.user_has_checked(session, payload.user_id, payload.poi_id):
        raise HTTPException(400, "Already checked in")

    receipt_no = f"RC-{uuid.uuid4().hex[:10].upper()}"
    check, total = checkin_crud.create_checkin(
        session, payload.user_id, payload.poi_id, dist, poi.score, receipt_no
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
def confirm_vehicle(checkin_id: int, body: VehicleConfirmRequest, session: Session = Depends(get_session)):
    check = session.get(Checkin, checkin_id)
    if not check:
        raise HTTPException(404, "Checkin not found")
    poi = session.get(POI, check.poi_id)
    user = session.get(User, check.user_id)

    # map loại phương tiện -> điểm thưởng
    bonus_map = {
        "walk": 10,
        "bike": 8,
        "bus": 5,
        "ev_scooter": 6,
        "car": 0,  # không thưởng
    }
    bonus = bonus_map.get(body.vehicle_type, 0)

    check, total = checkin_crud.add_vehicle_bonus(session, checkin_id, body.vehicle_type, bonus)
    return CheckinReceipt(
        checkin_id=check.id,
        poi_name=poi.name,
        distance_m=round(check.distance_m, 1),
        earned_points=check.earned_points,
        vehicle_bonus=check.vehicle_bonus,
        total_points=total,
        receipt_no=check.receipt_no,
    )
