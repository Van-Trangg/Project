from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.database import DbDep
from app.models.leaderboard import Leaderboard
from app.models.user import User
from app.schemas.leaderboard_schema import LeaderboardOut

router = APIRouter()
CurrentUser = Depends(get_current_user)

@router.get("", response_model=list[LeaderboardOut])
def list_leaderboard(db: DbDep) -> list[LeaderboardOut]:
    r = db.query(User).order_by(User.eco_points.desc()).limit(10).all()
    return [LeaderboardOut.model_validate({
        "id": user.id,
        "user_name": user.full_name,
        "points": user.eco_points,
        "avatar": user.avatar_url,
        "rank": index + 1
    }) for (index, user) in enumerate(r)]

@router.get("/my", response_model=LeaderboardOut)
def my_rank(
    db: DbDep,
    current_user: User = CurrentUser,
):
    rank = db.query(User).filter(User.eco_points > current_user.eco_points).count() + 1
    return LeaderboardOut.model_validate({
        "id": current_user.id,
        "user_name": current_user.full_name,
        "points": current_user.eco_points,
        "avatar": current_user.avatar_url,
        "rank": rank
    })
