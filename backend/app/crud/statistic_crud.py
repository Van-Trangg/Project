from sqlalchemy.orm import Session
from sqlalchemy import extract
from app.models.transaction import Transaction

def get_all_monthly_points(db: Session, user_id: int):
    """
    Trả về danh sách các tháng mà user có điểm (check-in hoặc daily reward),
    cùng với tổng điểm từng tháng.
    """
    # Lấy tất cả giao dịch dương
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "positive"
    ).all()

    if not transactions:
        return []

    # Gom nhóm theo (year, month)
    grouped = {}
    for t in transactions:
        year = t.created_at.year
        month = t.created_at.month
        key = (year, month)

        if key not in grouped:
            grouped[key] = {
                "month": month,
                "year": year,
                "checkin_points": 0,
                "daily_reward_points": 0,
                "total_points": 0,
                "transactions_count": 0
            }

        if "checkin" in t.title.lower():
            grouped[key]["checkin_points"] += t.amount
        elif "hàng ngày" in t.title.lower() or "reward" in t.title.lower():
            grouped[key]["daily_reward_points"] += t.amount

        grouped[key]["total_points"] += t.amount
        grouped[key]["transactions_count"] += 1

    # Sắp xếp theo thời gian
    result = sorted(grouped.values(), key=lambda x: (x["year"], x["month"]))
    return result
