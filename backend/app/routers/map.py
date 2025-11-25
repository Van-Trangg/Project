from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from math import radians, sin, cos, sqrt, atan2
from typing import List
import uuid
import random 

from app.db.database import get_db
from app.models.poi import POI
from app.models.map import Map
from app.models.checkin import Checkin
from app.models.user import User
from app.models.transaction import Transaction 

from app.schemas.map_schema import MapOut, PoiOut
from app.schemas.checkin_schema import CheckinRequest, CheckinReceipt
from app.crud import map_crud, checkin_crud
from app.core.security import get_current_user

router = APIRouter(prefix="/map", tags=["map"])

# --- Helpers ---
def haversine_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371_000.0
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))

def generate_trans_code():
    return str(random.randint(100000, 999999))

GPS_RADIUS_M = 1200000.0 

# --- Map routes ---
@router.get("/list", response_model=List[MapOut])
def get_maps(db: Session = Depends(get_db)):
    return map_crud.list_maps(db)

@router.get("/{map_id}/pois", response_model=List[PoiOut])
def get_pois(
    map_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
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
    # 1. Kiểm tra POI
    poi = db.get(POI, payload.poi_id)
    if not poi:
        raise HTTPException(status_code=404, detail="POI not found")

    # 2. Kiểm tra GPS
    dist = haversine_m(payload.user_lat, payload.user_lng, poi.lat, poi.lng)
    if dist > GPS_RADIUS_M:
        raise HTTPException(status_code=400, detail=f"Too far from POI ({dist:.1f}m)")

    # 3. Chống trùng
    if checkin_crud.user_has_checked(db, user.id, payload.poi_id):
        raise HTTPException(status_code=400, detail="Already checked in")

    # 4. Mã receipt
    receipt_no = f"RC-{uuid.uuid4().hex[:10].upper()}"

    # 5. Lưu Check-in
    check, total = checkin_crud.create_checkin(
        db, user.id, payload.poi_id, dist, poi.score, receipt_no
    )

    
    # A. Tăng số lượt Check-in Map (Đây mới đúng là nơi tăng biến này!)
    #user.check_ins += 1 

    # B. Cộng điểm vào Tổng tích lũy (để thanh Level tăng)
    if user.total_eco_points is None:
        user.total_eco_points = 0
    user.total_eco_points += poi.score

    # C. Lưu Lịch sử giao dịch (Transaction)
    new_trans = Transaction(
        user_id=user.id,
        code=generate_trans_code(),
        title=f"Check-in: {poi.name}",
        amount=poi.score,
        type="positive" 
    )
    db.add(new_trans)
    
    # D. Lưu DB
    db.commit()
    db.refresh(user)

    return CheckinReceipt(
        checkin_id=check.id,
        poi_name=poi.name,
        distance_m=round(dist, 1),
        earned_points=poi.score,
        total_points=user.eco_points,
        receipt_no=receipt_no,
    )

@router.get("/poi/{poi_id}/checked", response_model=dict)
def check_poi_status(
    poi_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    checked = checkin_crud.user_has_checked(db, user.id, poi_id)
    return {"checked": checked}

@router.get("/poi/{poi_id}/checked/percent", response_model=dict)
def check_poi_percentage(
    poi_id: int,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
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