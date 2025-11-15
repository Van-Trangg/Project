
from fastapi import APIRouter, Depends
from app.core.security import get_current_user as TokenDep
from app.models.user import User

router = APIRouter()


def _available_rewards():
    return [
        {
            "version": 1,
            "title": "Version 1",
            "badges": [
                {"id": 1, "badge": "Seedling", "threshold": 50, "image": "01.png", "rare": True, "description": "A tiny start  awarded when you earn your first 50 eco points."},
                {"id": 2, "badge": "Sapling", "threshold": 100, "image": "02.png", "description": "You've planted the roots: reach 100 points to earn this."},
                {"id": 3, "badge": "Evergreen", "threshold": 200, "image": "03.png", "description": "Consistent contributor  keep going to reach 200 points."},
                {"id": 4, "badge": "Blossom", "threshold": 300, "image": "04.png", "description": "Your actions are blooming  awarded at 300 points."},
            ]
        },
        {
            "version": 2,
            "title": "Version 2",
            "badges": [
                {"id": 101, "badge": "Explorer", "threshold": 20, "image": "05.png"},
                {"id": 102, "badge": "Navigator", "threshold": 80, "image": "06.png"},
                {"id": 103, "badge": "Voyager", "threshold": 240, "image": "07.png"}
            ]
        }
    ]


@router.get("/", tags=["badges"]) 
def list_badges(): 
    return _available_rewards()

@router.get("/me", tags=["badges"]) 
def list_badges_for_user(current_user: User = Depends(TokenDep)):
    """Return badges with an `unlocked` boolean based on the user's TOTAL eco points."""
    points = getattr(current_user, "total_eco_points", 0) or 0
    
    versions = []
    for v in _available_rewards():
        vv = {"version": v.get("version"), "title": v.get("title"), "badges": []}
        for b in v.get("badges", []):
            item = b.copy()
            item["unlocked"] = points >= (b.get("threshold") or 0)
            vv["badges"].append(item)
        versions.append(vv)
    return {"eco_points": points, "versions": versions}