from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Import các "công cụ"
from app.schemas import reward_schema
from app import models
from app.db.database import get_db
from app.core.security import get_current_user # "Người gác cổng"

router = APIRouter()

#
# --- API 1: LẤY DANH SÁCH PHẦN THƯỞNG (Mock data) ---
#
@router.get(
    "/", 
    response_model=List[reward_schema.Reward], # Trả về 1 DANH SÁCH
    response_model_by_alias=True # Bật chế độ alias
)
def get_all_rewards():
    """
    Cung cấp danh sách GIẢ LẬP (hardcoded) của tất cả
    các phần thưởng có sẵn.
    """
    
    # Dùng mock_data (snake_case) để giả lập data từ DB
    mock_data = [
        {
            "id": 1,
            "name": "Giảm 10% vé xe bus",
            "description": "Áp dụng cho tất cả các tuyến xe bus Phương Trang.",
            "points_required": 1000,
            "image_url": "https://i.imgur.com/example.png",
            "category": "Voucher"
        },
        {
            "id": 2,
            "name": "Áo thun GreenJourney",
            "description": "Làm từ 100% cotton hữu cơ, thân thiện môi trường.",
            "points_required": 5000,
            "image_url": "https://i.imgur.com/example.png",
            "category": "Merchandise"
        },
        {
            "id": 3,
            "name": "Quyên góp 1 cây xanh",
            "description": "Chúng tôi sẽ thay bạn trồng 1 cây xanh tại rừng Cúc Phương.",
            "points_required": 500,
            "image_url": "https://i.imgur.com/example.png",
            "category": "Charity"
        }
    ]
    return mock_data

#
# --- API 2: ĐỔI PHẦN THƯỞNG (Dùng data thật) ---
#
@router.post(
    "/{reward_id}/redeem", 
    response_model=reward_schema.RedeemResponse, # Dùng schema RedeemResponse
    response_model_by_alias=True
)
def redeem_reward(
    reward_id: int, # Lấy ID từ URL (ví dụ: /reward/1/redeem)
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    """
    Endpoint (dùng data thật) để user đổi điểm lấy phần thưởng.
    """
    
    # === BƯỚC 1: LẤY PHẦN THƯỞNG TỪ DB ===
    reward = db.query(models.Reward).filter(models.Reward.id == reward_id).first()
    
    if not reward:
        raise HTTPException(status_code=404, detail="Không tìm thấy phần thưởng này")

    # === BƯỚC 2: KIỂM TRA ĐIỂM ===
    # (Dùng 'eco_points' từ model User của bạn)
    if current_user.eco_points < reward.points_required:
        raise HTTPException(
            status_code=400, 
            detail=f"Không đủ điểm. Bạn cần {reward.points_required} điểm, nhưng chỉ có {current_user.eco_points}."
        )
        
    # === BƯỚC 3: TRỪ ĐIỂM VÀ LƯU VÀO DB ===
    current_user.eco_points -= reward.points_required
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    
    # === BƯỚC 4: TRẢ VỀ THÀNH CÔNG ===
    return {
        "message": f"Đổi '{reward.name}' thành công!",
        "user_points_left": current_user.eco_points # Trả về số điểm MỚI
    }

@router.get(
    "/history", # <-- Đặt tên endpoint là /history
    response_model=List[reward_schema.HistoryItem] # Trả về 1 DANH SÁCH
)
def get_user_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    """
    Lấy lịch sử giao dịch (cộng/trừ điểm) của user hiện tại.
    """
    
    # Lấy 10 giao dịch mới nhất của user này
    # (Dùng 'current_user.transactions' nhờ liên kết 'relationship' bạn tạo)
    history = current_user.transactions[-10:] # Lấy 10 phần tử cuối
    history.reverse() # Đảo ngược để mới nhất lên đầu
    
    return history