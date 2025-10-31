from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.leaderboard import Leaderboard

router = APIRouter()

@router.get("")
def list_leaderboard(db: Session = Depends(get_db)):
    return db.query(Leaderboard).order_by(Leaderboard.points.desc()).limit(50).all()