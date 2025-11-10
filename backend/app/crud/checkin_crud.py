from sqlmodel import Session, select
from app.models.checkin import Checkin
from app.models.user import User

def user_has_checked(session: Session, user_id: int, poi_id: int) -> bool:
    exists = session.exec(select(Checkin.id).where(Checkin.user_id==user_id, Checkin.poi_id==poi_id)).first()
    return exists is not None

def create_checkin(session: Session, user_id: int, poi_id: int, distance_m: float, earned_points: int, receipt_no: str) -> Checkin:
    check = Checkin(user_id=user_id, poi_id=poi_id, distance_m=distance_m, earned_points=earned_points, receipt_no=receipt_no)
    session.add(check)
    user = session.get(User, user_id)
    user.total_points += earned_points
    session.commit()
    session.refresh(check)
    session.refresh(user)
    return check, user.total_points

def add_vehicle_bonus(session: Session, checkin_id: int, vehicle_type: str, bonus: int):
    check = session.get(Checkin, checkin_id)
    check.vehicle_type = vehicle_type
    check.vehicle_bonus = bonus
    user = session.get(User, check.user_id)
    user.total_points += bonus
    session.commit()
    session.refresh(check)
    session.refresh(user)
    return check, user.total_points
