from fastapi import APIRouter,Depends
from app.schemas import reward_schema # Import schema bạn vừa tạo
from typing import List
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
                {"id": 1, "badge": "Seedling", "threshold": 50, "image": "/back.png", "rare": True, "description": "A tiny start — awarded when you earn your first 50 eco points."},
                {"id": 2, "badge": "Sapling", "threshold": 100, "image": "sapling.png", "description": "You've planted the roots: reach 100 points to earn this."},
                {"id": 3, "badge": "Evergreen", "threshold": 200, "image": "evergreen.png", "description": "Consistent contributor — keep going to reach 200 points."},
                {"id": 4, "badge": "Blossom", "threshold": 300, "image": "blossom.png", "description": "Your actions are blooming — awarded at 300 points."},
                {"id": 5, "badge": "Melody", "threshold": 350, "image": "melody.png", "description": "Harmonious effort — 350 points earned."},
                {"id": 6, "badge": "Harmony", "threshold": 420, "image": "harmony.png", "description": "Balanced and steady — reach 420 points."},
                {"id": 7, "badge": "Rhythm", "threshold": 500, "image": "rhythm.png", "description": "You found the rhythm — 500 points milestone."},
                {"id": 8, "badge": "Echo", "threshold": 600, "image": "echo.png", "description": "Your impact resonates — awarded at 600 points."},
                {"id": 9, "badge": "Crescendo", "threshold": 750, "image": "crescendo.png", "description": "A rising achievement — 750 points reached."},
                {"id": 10, "badge": "Serenade", "threshold": 900, "image": "serenade.png", "description": "A serenade for sustained effort — 900 points."},
                {"id": 11, "badge": "Ballad", "threshold": 1100, "image": "ballad.png", "description": "A story in points — you reached 1100."},
                {"id": 12, "badge": "Anthem", "threshold": 1300, "image": "anthem.png", "description": "An anthem for champions — 1300 points."}
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
@router.get(
    "/", 
    response_model=List[reward_schema.Reward], # Trả về 1 DANH SÁCH Reward
    response_model_by_alias=True # <-- Quan trọng: Bật chế độ alias
)
def get_all_rewards():
    """
    Cung cấp danh sách GIẢ LẬP (hardcoded) của tất cả
    các phần thưởng có sẵn.
    """
    
    # Dùng mock_data (snake_case)
    # để giả lập dữ liệu lấy từ database (Model)
    mock_data = [
        {
            "id": 1,
            "name": "Giảm 10% vé xe bus",
            "description": "Áp dụng cho tất cả các tuyến xe bus Phương Trang.",
            "points_required": 1000, # snake_case
            "image_url": "https://i.imgur.com/example.png", # snake_case
            "category": "Voucher"
        },
        {
            "id": 2,
            "name": "Áo thun GreenJourney",
            "description": "Làm từ 100% cotton hữu cơ, thân thiện môi trường.",
            "points_required": 5000, # snake_case
            "image_url": "https://i.imgur.com/example.png", # snake_case
            "category": "Merchandise"
        },
        {
            "id": 3,
            "name": "Quyên góp 1 cây xanh",
            "description": "Chúng tôi sẽ thay bạn trồng 1 cây xanh tại rừng Cúc Phương.",
            "points_required": 500, # snake_case
            "image_url": "https://i.imgur.com/example.png", # snake_case
            "category": "Charity"
        }
    ]
    
    # FastAPI sẽ tự động "dịch" mock_data (snake_case)
    # sang JSON (camelCase) cho frontend
    return mock_data
