from fastapi import APIRouter

router = APIRouter()

@router.get("")
def get_home_data():
    return {
        "welcome": "GreenJourney",
        "features": ["journals", "leaderboard", "map", "rewards"],
    }