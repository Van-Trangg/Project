from fastapi import APIRouter

router = APIRouter()

@router.get("")
def list_rewards():
    return [
        {"id": 1, "badge": "Seedling", "threshold": 50},
        {"id": 2, "badge": "Sapling", "threshold": 100},
        {"id": 3, "badge": "Evergreen", "threshold": 200},
    ]