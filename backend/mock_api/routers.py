# backend/mock_api/routers.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .db import get_db
from . import models, schemas

router = APIRouter()

@router.post("/promotion/redeem", response_model=schemas.RedemptionOut)
def redeem_promotion(payload: schemas.RedemptionCreate, db: Session = Depends(get_db)):
    """
    Mock bên thứ ba: chỉ nhận user_id, promotion_title, code và lưu lại.
    """
    record = models.RedemptionLog(
        user_id=payload.user_id,
        promotion_title=payload.promotion_title,
        code=payload.code,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
