from fastapi import APIRouter
from app.schemas import reward_schema # Import schema bạn vừa tạo
from typing import List

router = APIRouter()

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
