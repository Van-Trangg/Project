from fastapi import APIRouter, Depends
from app.core.security import get_current_user
from app.db.database import DbDep
from app.models.leaderboard import Leaderboard
from app.models.user import User
from app.schemas.leaderboard_schema import LeaderboardOut

default_avatar_url = "https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg"

router = APIRouter()
CurrentUser = Depends(get_current_user)

@router.get("", response_model=list[LeaderboardOut])
def list_leaderboard(db: DbDep) -> list[LeaderboardOut]:
    r = db.query(User).order_by(User.monthly_points.desc(), User.email.asc()).limit(10).all()
    return [LeaderboardOut.model_validate({
        "id": user.id,
        "user_name": user.full_name,
        "points": user.monthly_points,
        "avatar": get_avatar_url(user.avatar_url),
        "rank": index + 1
    }) for (index, user) in enumerate(r)]

@router.get("/my", response_model=LeaderboardOut)
def my_rank(
    db: DbDep,
    current_user: User = CurrentUser,
):
    rank = db.query(User).filter(User.monthly_points > current_user.monthly_points).count()
    rank_2 = db.query(User).filter(
        User.monthly_points == current_user.monthly_points,
        User.email < current_user.email
    ).count()
    return LeaderboardOut.model_validate({
        "id": current_user.id,
        "user_name": current_user.full_name,
        "points": current_user.monthly_points,
        "avatar": get_avatar_url(current_user.avatar_url),
        "rank": rank + rank_2 + 1
    })

def get_avatar_url(avatar_url: str | None) -> str:
    if avatar_url and avatar_url != "" and (not avatar_url.startswith("https://example.com")):
        return avatar_url
    return default_avatar_url