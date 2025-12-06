from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.core.security import get_current_user
from app.crud.recap_crud import get_monthly_recap
from app.schemas.recap_schema import MonthlyRecap 
from app.models.user import User

router = APIRouter()

@router.get("/monthly", response_model=MonthlyRecap)
def monthly_recap(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_monthly_recap(db, current_user)
