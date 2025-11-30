from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.statistic_schema import StatisticListResponse
from app.crud.statistic_crud import get_all_monthly_points
from app.models.user import User  # Giả sử model User tồn tại
from app.core.security import get_current_user  # Hàm bạn đã có

router = APIRouter(
    prefix="/statistic",
    tags=["statistic"]
)

@router.get("/monthly/all", response_model=StatisticListResponse)
def get_all_monthly_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    📊 Trả về thống kê điểm theo từng tháng mà user có điểm.
    """
    data = get_all_monthly_points(db, current_user.id)

    if not data:
        raise HTTPException(status_code=404, detail="No transactions found for this user")

    return {
        "user_id": current_user.id,
        "statistics": data
    }
