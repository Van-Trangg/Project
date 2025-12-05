from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.models.user import User
from app.models.transaction import Transaction
from app.models.checkin import Checkin


def get_user_rank(db: Session, current_user: User):
    rank = db.query(User).filter(User.monthly_points > current_user.monthly_points).count()
    rank_2 = db.query(User).filter(
        User.monthly_points == current_user.monthly_points,
        User.email < current_user.email
    ).count()
    return rank + rank_2 + 1


def get_user_tree_stats(db: Session, current_user: User):
    my_trees = db.query(Transaction).filter(
        Transaction.user_id == current_user.id,
        Transaction.title.contains("Trồng cây")
    ).count()

    base_trees = 15830
    total_real_trees = db.query(Transaction).filter(
        Transaction.title.contains("Trồng cây")
    ).count()

    return {
        "my_trees": my_trees,
        "everyone_trees": base_trees + total_real_trees
    }


def get_checkin_count(db: Session, current_user: User, month: int, year: int):
    return db.query(Checkin).filter(
        Checkin.user_id == current_user.id,
        func.extract("month", Checkin.timestamp) == month,
        func.extract("year", Checkin.timestamp) == year
    ).count()


def get_monthly_recap(db: Session, current_user: User):
    # Lấy tháng + năm hiện tại
    now = datetime.now()
    month = now.month
    year = now.year

    tree_stats = get_user_tree_stats(db, current_user)

    return {
        "user_id": current_user.id,
        "full_name": current_user.full_name,
        "avatarUrl": current_user.avatar_url,
        "month": month,
        "year": year,
        "rank": get_user_rank(db, current_user),
        "checkins": get_checkin_count(db, current_user, month, year),
        "trees": tree_stats["my_trees"],
        "monthly_points": current_user.monthly_points
    }
