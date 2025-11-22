from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date 
from pydantic import BaseModel
from typing import List

from app.schemas import home_schema
from app import models
from app.db.database import get_db
from app.core.security import get_current_user

router = APIRouter()

# ==========================================
# 1. CÁC SCHEMA (Định nghĩa dữ liệu input/output)
# ==========================================

class HistoryItem(BaseModel):
    id: int
    title: str
    amount: int
    type: str 
    # created_at: datetime # Có thể thêm nếu muốn hiển thị ngày giờ

class PromoItem(BaseModel):
    id: int
    title: str
    price: str

class RewardResponse(BaseModel):
    balance: int
    history: List[HistoryItem]
    promotions: List[PromoItem]

class RedeemRequest(BaseModel):
    title: str
    price: int

# ==========================================
# 2. HÀM LOGIC PHỤ TRỢ
# ==========================================

def calculate_level(total_points: int):
    if total_points < 100:
        return {"title": "Seedling (Hạt giống)", "max": 100}
    elif total_points < 500:
        return {"title": "Sprout (Mầm non)", "max": 500}
    elif total_points < 1000:
        return {"title": "Sapling (Cây non)", "max": 1000}
    elif total_points < 2000:
        return {"title": "Friend of Tree", "max": 2000}
    elif total_points < 5000:
        return {"title": "Forest Guardian", "max": 5000}
    else:
        return {"title": "Earth Hero", "max": 10000}

# ==========================================
# 3. CÁC API ENDPOINT
# ==========================================

# --- API: Nhận thưởng điểm danh ---
@router.post("/claim-reward")
def claim_daily_reward(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()

    if current_user.last_check_in_date == today:
        return {"success": False, "message": "Hôm nay bạn đã nhận rồi!"}

    # [LƯU Ý] Đặt lại là 10 sau khi test xong
    points_to_add = 10 
    
    # 1. Cộng điểm User
    current_user.eco_points += points_to_add
    if current_user.total_eco_points is None:
        current_user.total_eco_points = 0
    current_user.total_eco_points += points_to_add

    current_user.last_check_in_date = today
    current_user.check_ins += 1 

    # 2. Lưu lịch sử giao dịch (Transaction)
    new_trans = models.Transaction(
        user_id=current_user.id,
        title="Điểm danh hàng ngày",
        amount=points_to_add,
        type="positive"
    )
    db.add(new_trans)

    db.commit()
    db.refresh(current_user)

    # Trả về info mới nhất
    current_total = current_user.total_eco_points
    new_level_info = calculate_level(current_total)

    return {
        "success": True, 
        "new_ecopoints": current_user.eco_points,
        "new_progress": current_total,
        "new_title": new_level_info["title"],
        "new_max": new_level_info["max"],
        "message": "Nhận thưởng thành công!"
    }

# --- API: Đổi quà (Trừ điểm) ---
@router.post("/redeem")
def redeem_reward(
    request: RedeemRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Kiểm tra đủ điểm không
    if current_user.eco_points < request.price:
        return {"success": False, "message": "Bạn không đủ điểm!"}

    # 1. Trừ điểm
    current_user.eco_points -= request.price

    # 2. Lưu lịch sử giao dịch
    new_trans = models.Transaction(
        user_id=current_user.id,
        title=f"Đổi quà: {request.title}",
        amount=request.price,
        type="negative" # Đánh dấu là trừ tiền
    )
    db.add(new_trans)

    db.commit()
    db.refresh(current_user)

    return {
        "success": True, 
        "new_balance": current_user.eco_points,
        "message": f"Đổi '{request.title}' thành công!"
    }

# --- API: Lấy dữ liệu trang chủ ---
@router.get("/", response_model=home_schema.HomeDataResponse)
def get_real_home_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rank = db.query(models.User).filter(models.User.eco_points > current_user.eco_points).count() + 1
    
    current_total = current_user.total_eco_points if current_user.total_eco_points else 0
    level_info = calculate_level(current_total)
    
    quest = {
        "title": level_info["title"], 
        "progress": current_total, 
        "max": level_info["max"]
    } 
    
    rewards = []
    today = date.today()
    start_date = today - timedelta(days=1) 

    for i in range(4):
        loop_date = start_date + timedelta(days=i)
        is_today = (loop_date == today)
        is_claimed = False
        if current_user.last_check_in_date:
            if loop_date <= current_user.last_check_in_date:
                is_claimed = True
        
        rewards.append({
            "date": loop_date.strftime("%d/%m"), 
            "points": 10,
            "claimed": is_claimed,
            "isToday": is_today
        })

    return {
        "userName": current_user.nickname or current_user.full_name,
        "avatarUrl": current_user.avatar_url,
        "ecopoints": current_user.eco_points,
        "badges": current_user.badges_count,
        "rank": rank, 
        "checkIns": current_user.check_ins,
        "currentTitle": quest["title"],
        "progressCurrent": quest["progress"],
        "progressMax": quest["max"],
        "dailyStreak": current_user.check_ins, 
        "dailyRewards": rewards
    }

# --- API: Lấy dữ liệu trang Reward ---
@router.get("/rewards", response_model=RewardResponse)
def get_reward_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    real_balance = current_user.eco_points

    # Lấy lịch sử giao dịch THẬT từ Database

    real_history = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == current_user.id)\
        .order_by(models.Transaction.created_at.desc())\
        .limit(10)\
        .all()

    fake_promos = [
        {"id": 1, "title": "Voucher giảm 50% vé tháng", "price": "10.000"},
        {"id": 2, "title": "Voucher giảm 10% vé xe buýt", "price": "1.000"},
        {"id": 3, "title": "Ly giữ nhiệt tre ép", "price": "5.000"},
    ]

    return {
        "balance": real_balance,
        "history": real_history,
        "promotions": fake_promos
    }