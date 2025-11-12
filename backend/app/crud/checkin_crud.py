from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.checkin import Checkin
from app.models.user import User
from sqlalchemy import update
from app.models.poi import POI

def user_has_checked(session: Session, user_id: int, poi_id: int) -> bool:
    """Kiểm tra xem user đã check-in tại POI chưa"""
    stmt = select(Checkin.id).where(
        Checkin.user_id == user_id,
        Checkin.poi_id == poi_id
    )
    result = session.execute(stmt).first()
    return result is not None

def create_checkin(
    session: Session,
    user_id: int,
    poi_id: int,
    distance_m: float,
    earned_points: int,
    receipt_no: str,
):
    """Tạo check-in mới, cộng điểm user & tăng checked_users (atomic & concurrency-safe)."""

    try:
        # --- 1️⃣ Tạo bản ghi check-in ---
        checkin = Checkin(
            user_id=user_id,
            poi_id=poi_id,
            distance_m=distance_m,
            earned_points=earned_points,
            receipt_no=receipt_no,
        )
        session.add(checkin)

        # --- 2️⃣ Cộng điểm cho user ---
        user = session.get(User, user_id)
        if user:
            current_points = getattr(user, "points", 0)
            user.points = current_points + earned_points

        # --- 3️⃣ Atomic update cho POI.checked_users ---
        session.execute(
            update(POI)
            .where(POI.id == poi_id)
            .values(checked_users=(POI.checked_users + 1))
        )

        # --- 4️⃣ Commit tất cả trong cùng 1 transaction ---
        session.commit()
        session.refresh(checkin)

        total_points = user.points if user else earned_points
        return checkin, total_points

    except Exception as e:
        session.rollback()
        raise e



def count_checked_users_for_poi(session: Session, poi_id: int) -> int:
    """
    Đếm số người dùng khác nhau đã check-in tại một POI (distinct user_id).
    Trả về 0 nếu chưa ai check-in.
    """
    stmt = (
        select(func.count(func.distinct(Checkin.user_id)))
        .where(Checkin.poi_id == poi_id)
    )
    result = session.execute(stmt).scalar()
    return result or 0

def count_total_users(session: Session) -> int:
    """Đếm tổng số user trong hệ thống."""
    stmt = select(func.count(User.id))
    return session.execute(stmt).scalar_one()