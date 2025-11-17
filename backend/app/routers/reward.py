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
    """ Cung cấp danh sách GIẢ LẬP của tất cả phần thưởng. """
    
    mock_data = [
        { "id": 1, "name": "Giảm 10% vé xe bus", "description": "Áp dụng...", "points_required": 1000, "image_url": "...", "category": "Voucher"},
        { "id": 2, "name": "Áo thun GreenJourney", "description": "Làm từ...", "points_required": 5000, "image_url": "...", "category": "Merchandise"},
        { "id": 3, "name": "Quyên góp 1 cây xanh", "description": "Trồng tại...", "points_required": 500, "image_url": "...", "category": "Charity"}
    ]
    return mock_data

#
# --- API 2: ĐỔI PHẦN THƯỞNG (Trừ điểm - Data thật) ---
#
@router.post(
    "/{reward_id}/redeem", 
    response_model=reward_schema.RedeemResponse,
    response_model_by_alias=True
)
def redeem_reward(
    reward_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    """ Endpoint (dùng data thật) để user đổi điểm lấy phần thưởng. """
    
    # 1. Lấy Reward từ DB (Dùng model Reward)
    # (Lưu ý: Chúng ta dùng mock_data ở API 1, nhưng API này dùng DB thật)
    reward = db.query(models.Reward).filter(models.Reward.id == reward_id).first()
    
    if not reward:
        # Nếu DB (bảng Reward) trống, tạo 1 cái giả để test
        if reward_id == 1 and current_user.eco_points >= 1000:
             reward = models.Reward(id=1, name="Giảm 10% vé xe bus", points_required=1000)
        else:
             raise HTTPException(status_code=404, detail="Không tìm thấy phần thưởng hoặc không đủ điểm để tạo giả")

    # 2. Kiểm tra điểm
    if current_user.eco_points < reward.points_required:
        raise HTTPException(
            status_code=400, 
            detail=f"Không đủ điểm. Bạn cần {reward.points_required}, nhưng chỉ có {current_user.eco_points}."
        )
        
    # 3. Trừ điểm
    current_user.eco_points -= reward.points_required
    db.add(current_user)
    
    # 4. GHI VÀO "SỔ KẾ TOÁN" (Transaction)
    new_transaction = models.Transaction(
        title=f"Đổi: {reward.name}",
        amount=-reward.points_required, # Dùng số âm
        type="negative",
        owner=current_user # Tự động gán user_id
    )
    db.add(new_transaction)

    db.commit()
    db.refresh(current_user)
    
    return {
        "message": f"Đổi '{reward.name}' thành công!",
        "user_points_left": current_user.eco_points
    }

#
# --- API 3: LẤY LỊCH SỬ GIAO DỊCH (Data thật) ---
#
@router.get(
    "/history", 
    response_model=List[reward_schema.HistoryItem] # Trả về 1 DANH SÁCH
)
def get_user_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user) # Yêu cầu đăng nhập
):
    """ Lấy lịch sử giao dịch (cộng/trừ điểm) của user hiện tại. """
    
    # Lấy 10 giao dịch mới nhất của user này
    history = current_user.transactions[-10:] 
    history.reverse() # Đảo ngược để mới nhất lên đầu
    
    return history