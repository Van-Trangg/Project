from fastapi import APIRouter, Depends
from app.core.security import get_current_user as TokenDep
from app.models.user import User

router = APIRouter()


def _available_rewards():
    # Return rewards grouped by versions. Each version contains a list of badges.
    # IDs are unique across all versions.
    return [
        {
            "version": 1,
            "title": "Version 1",
            "badges": [
                {"id": 1, "badge": "Seedling", "threshold": 50, "image": "seedling.png"},
                {"id": 2, "badge": "Sapling", "threshold": 100, "image": "sapling.png"},
                {"id": 3, "badge": "Evergreen", "threshold": 200, "image": "evergreen.png"},
                {"id": 4, "badge": "Blossom", "threshold": 300, "image": "blossom.png"},
                {"id": 5, "badge": "Melody", "threshold": 350, "image": "melody.png"},
                {"id": 6, "badge": "Harmony", "threshold": 420, "image": "harmony.png"},
                {"id": 7, "badge": "Rhythm", "threshold": 500, "image": "rhythm.png"},
                {"id": 8, "badge": "Echo", "threshold": 600, "image": "echo.png"},
                {"id": 9, "badge": "Crescendo", "threshold": 750, "image": "crescendo.png"},
                {"id": 10, "badge": "Serenade", "threshold": 900, "image": "serenade.png"},
                {"id": 11, "badge": "Ballad", "threshold": 1100, "image": "ballad.png"},
                {"id": 12, "badge": "Anthem", "threshold": 1300, "image": "anthem.png"}
            ]
        },
        {
            "version": 2,
            "title": "Version 2",
            "badges": [
                {"id": 101, "badge": "Explorer", "threshold": 20, "image": "explorer.png"},
                {"id": 102, "badge": "Navigator", "threshold": 80, "image": "navigator.png"},
                {"id": 103, "badge": "Voyager", "threshold": 240, "image": "voyager.png"}
            ]
        }
    ]


@router.get("/", tags=["rewards"])
def list_rewards():
    """Public listing of rewards (no user context)"""
    return _available_rewards()


@router.get("/me", tags=["rewards"])
def list_rewards_for_user(current_user: User = Depends(TokenDep)):
    """Return rewards with an `unlocked` boolean based on the authenticated user's eco points."""
    points = getattr(current_user, "eco_points", 0) or 0
    versions = []
    for v in _available_rewards():
        vv = {"version": v.get("version"), "title": v.get("title"), "badges": []}
        for b in v.get("badges", []):
            item = b.copy()
            item["unlocked"] = points >= (b.get("threshold") or 0)
            vv["badges"].append(item)
        versions.append(vv)
    return {"eco_points": points, "versions": versions}