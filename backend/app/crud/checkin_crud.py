from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.checkin import Checkin
from app.models.user import User

def user_has_checked(session: Session, user_id: int, poi_id: int) -> bool:
    """Kiểm tra xem user đã check-in tại POI chưa"""
    stmt = select(Checkin.id).where(
        Checkin.user_id == user_id,
        Checkin.poi_id == poi_id
    )
    result = session.execute(stmt).first()
    return result is not None


def create_checkin(session: Session, user_id: int, poi_id: int, distance_m: float, earned_points: int, receipt_no: str):
    """Tạo check-in mới và cập nhật tổng điểm"""
    checkin = Checkin(
        user_id=user_id,
        poi_id=poi_id,
        distance_m=distance_m,
        earned_points=earned_points,
        vehicle_bonus=0,
        receipt_no=receipt_no
    )
    session.add(checkin)

    user = session.get(User, user_id)
    total_points = (user.points if hasattr(user, "points") else 0) + earned_points
    if hasattr(user, "points"):
        user.points = total_points

    session.commit()
    session.refresh(checkin)
    return checkin, total_points


def add_vehicle_bonus(session: Session, checkin_id: int, vehicle_type: str, bonus: int):
    """Cộng điểm thưởng phương tiện"""
    checkin = session.get(Checkin, checkin_id)
    checkin.vehicle_type = vehicle_type
    checkin.vehicle_bonus = bonus

    user = session.get(User, checkin.user_id)
    total_points = (user.points if hasattr(user, "points") else 0) + bonus
    if hasattr(user, "points"):
        user.points = total_points

    session.commit()
    session.refresh(checkin)
    return checkin, total_points
