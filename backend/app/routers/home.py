from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.schemas import home_schema
from app import models
from app.db.database import get_db
from app.core.security import get_current_user


router = APIRouter()

@router.get(
    "/", 
    response_model=home_schema.HomeDataResponse
)
def get_real_home_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    
    rank = db.query(models.User).filter(models.User.eco_points > current_user.eco_points).count() + 1
    
    quest = {"title": "Friend of Tree ", "progress": 1600, "max": 2000} 
    rewards = [
        { "date": "25/10", "points": 10, "claimed": True, "isToday": False },
        { "date": "26/10", "points": 10, "claimed": False, "isToday": True },
        { "date": "27/10", "points": 10, "claimed": True, "isToday": False },
        { "date": "28/10", "points": 10, "claimed": True, "isToday": False },
    ]

    real_data = {
        "userName": current_user.nickname or current_user.full_name,
        "ecopoints": current_user.eco_points,
        "badges": current_user.badges_count,
        "rank": rank, 
        "checkIns": current_user.check_ins,
        "currentTitle": quest["title"],
        "progressCurrent": quest["progress"],
        "progressMax": quest["max"],
        "dailyStreak": current_user.check_ins, 
        "dailyRewards": rewards
    }
    
    return real_data