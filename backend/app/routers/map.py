from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_places():
    # Demo data with eco-scores
    return [
        {"id": 1, "name": "Eco Park", "eco_score": 88},
        {"id": 2, "name": "Green Cafe", "eco_score": 72},
    ]