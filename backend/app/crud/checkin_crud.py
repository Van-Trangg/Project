from sqlalchemy.orm import Session
from sqlalchemy import select, func
from app.models.checkin import Checkin
from app.models.user import User
from sqlalchemy import update
from app.models.poi import POI
from math import ceil
from app.crud.badge_crud import check_and_award_badges

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
        # 1️⃣ Tạo bản ghi check-in
        checkin = Checkin(
            user_id=user_id,
            poi_id=poi_id,
            distance_m=distance_m,
            earned_points=earned_points,
            receipt_no=receipt_no,
        )
        session.add(checkin)

        # 2️⃣ Cộng điểm cho user
        user = session.get(User, user_id)
        if user:
            user.eco_points = getattr(user, "eco_points", 0) + earned_points
            user.total_eco_points = getattr(user, "total_eco_points", 0) + earned_points
            user.monthly_points = getattr(user, "monthly_points", 0) + earned_points
            user.check_ins = getattr(user, "check_ins", 0) + 1

        # 3️⃣ Atomic update cho POI.checked_users
        session.execute(
            update(POI)
            .where(POI.id == poi_id)
            .values(checked_users=(POI.checked_users + 1))
        )

        # 4️⃣ Commit tất cả trong cùng 1 transaction
        session.commit()
        session.refresh(checkin)

        total_points = 0
        if user:
            # Lấy điểm mới nhất từ user sau khi refresh
            total_points = user.total_eco_points
            # Gọi hàm check badge với điểm này
            check_and_award_badges(session, user_id, total_points)
        print(f"User {user_id} checked in POI {poi_id}, total points: {total_points}")
        return checkin, total_points

    except Exception as e:
        session.rollback()
        raise e

def recompute_scores(session: Session):
    # Tổng số user
    total_users = session.query(func.count(User.id)).scalar()

    if total_users == 0:
        return

    pois = session.query(POI).all()

    for poi in pois:
        # Đếm số user đã checkin POI này
        count_checked = session.query(func.count(Checkin.id)) \
                          .filter(Checkin.poi_id == poi.id) \
                          .scalar()

        # Tỷ lệ %
        
        percent = (count_checked / total_users) 
        raw_score = 100 * (2 - percent)

        # làm tròn lên thành số tròn chục
        poi.score = ceil(raw_score / 10) * 10
        print(f"Recomputed score for POI {poi.id} ({poi.name}): {poi.score}")
    session.commit()


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

def recompute_for_poi(session, poi_id: int):
    """Tính lại điểm cho 1 POI dựa trên tỷ lệ % user đã check-in."""

    # Tổng số user
    total_users = session.query(func.count(User.id)).scalar()
    if total_users == 0:
        return

    # POI cần tính
    poi = session.get(POI, poi_id)
    if not poi:
        return

    # Số user đã check-in POI này
    checked_users = (
        session.query(func.count(Checkin.id))
        .filter(Checkin.poi_id == poi_id)
        .scalar()
    )

    percent = (checked_users / total_users)
    raw_score = 100 * (2 - percent)

    # làm tròn lên thành số tròn chục
    poi.score = ceil(raw_score / 10) * 10
    

    session.commit()