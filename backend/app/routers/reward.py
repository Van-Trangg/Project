from fastapi import APIRouter, Depends
from app.core.security import get_current_user as TokenDep
from app.models.user import User

router = APIRouter()


def _available_rewards():
    # static list for now. Each reward has an id and the eco_point threshold to unlock
    return [
        {"id": 1, "badge": "Seedling", "threshold": 50, "image": "seedling.png"},
        {"id": 2, "badge": "Sapling", "threshold": 100, "image": "sapling.png"},
        {"id": 3, "badge": "Evergreen", "threshold": 200, "image": "evergreen.png"},
        {"id": 4, "badge": "Blossom", "threshold": 300, "image": "blossom.png"},
        
    ]


@router.get("/", tags=["rewards"])
def list_rewards():
    """Public listing of rewards (no user context)"""
    return _available_rewards()


@router.get("/me", tags=["rewards"])
def list_rewards_for_user(current_user: User = Depends(TokenDep)):
    """Return rewards with an `unlocked` boolean based on the authenticated user's eco points."""
    points = getattr(current_user, "eco_points", 0) or 0
    out = []
    for r in _available_rewards():
        item = r.copy()
        item["unlocked"] = points >= (r.get("threshold") or 0)
        out.append(item)
    return {"eco_points": points, "rewards": out}