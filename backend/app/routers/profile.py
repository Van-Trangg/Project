from fastapi import APIRouter

router = APIRouter()

@router.get("")
def my_profile():
    # Stubbed user
    return {"id": 1, "email": "demo@greenjourney.dev", "full_name": "Eco Traveler", "eco_points": 120}