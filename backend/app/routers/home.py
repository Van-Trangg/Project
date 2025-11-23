from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date 
from pydantic import BaseModel
from typing import List
import random

# Import logic xử lý huy hiệu từ main
from app.crud.badge_crud import check_and_award_badges

from app.schemas import home_schema
from app import models
from app.db.database import get_db
from app.core.security import get_current_user

router = APIRouter()

# ==========================================
# 1. CÁC SCHEMA
# ==========================================

class HistoryItem(BaseModel):
    id: int
    code: str
    title: str
    amount: int
    type: str 
    created_at: datetime 

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

class LocationCheckinRequest(BaseModel):
    location_name: str 

# ==========================================
# 2. HÀM LOGIC PHỤ TRỢ
# ==========================================

def generate_trans_code():
    return str(random.randint(100000, 999999))

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

@router.get("/history", response_model=List[HistoryItem])
def get_full_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    full_history = db.query(models.Transaction)\
        .filter(models.Transaction.user_id == current_user.id)\
        .order_by(models.Transaction.created_at.desc())\
        .all()
    return full_history

@router.post("/claim-reward")
def claim_daily_reward(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()
    yesterday = today - timedelta(days=1)


    if current_user.last_daily_reward_date == today:
        return {"success": False, "message": "Hôm nay bạn đã nhận rồi!"}


    points_to_add = 6000 
    
    # 2. Cộng điểm
    current_user.eco_points += points_to_add
    if current_user.total_eco_points is None:
        current_user.total_eco_points = 0
    current_user.total_eco_points += points_to_add

    # 3. Xử lý Streak 
    if current_user.last_daily_reward_date == yesterday:
        current_user.streak += 1
    else:
        current_user.streak = 1

    # 4. Cập nhật ngày nhận thưởng 
    current_user.last_daily_reward_date = today
    
    # 5.  Trao huy hiệu 
    check_and_award_badges(db, current_user.id, current_user.total_eco_points)

    # 6. Lưu Transaction
    new_trans = models.Transaction(
        user_id=current_user.id,
        code=generate_trans_code(),
        title="Điểm danh hàng ngày",
        amount=points_to_add,
        type="positive"
    )
    db.add(new_trans)
    
    db.add(current_user) 

    db.commit()
    db.refresh(current_user)

    current_total = current_user.total_eco_points
    new_level_info = calculate_level(current_total)

    return {
        "success": True, 
        "new_ecopoints": current_user.eco_points,
        "new_progress": current_total,
        "new_title": new_level_info["title"],
        "new_max": new_level_info["max"],
        "new_badges_cnt": current_user.badges_count,
        "new_streak": current_user.streak,
        "message": "Nhận thưởng thành công!"
    }

@router.post("/redeem")
def redeem_reward(
    request: RedeemRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user.eco_points < request.price:
        return {"success": False, "message": "Bạn không đủ điểm!"}

    current_user.eco_points -= request.price

    new_trans = models.Transaction(
        user_id=current_user.id,
        code=generate_trans_code(),
        title=f"Đổi quà: {request.title}",
        amount=request.price,
        type="negative"
    )
    db.add(new_trans)
    db.add(current_user)

    db.commit()
    db.refresh(current_user)

    return {
        "success": True, 
        "new_balance": current_user.eco_points,
        "message": f"Đổi '{request.title}' thành công!"
    }

@router.get("/", response_model=home_schema.HomeDataResponse)
def get_real_home_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    rank = db.query(models.User).filter(models.User.eco_points > current_user.eco_points).count() + 1
    current_total = current_user.total_eco_points if current_user.total_eco_points else 0
    level_info = calculate_level(current_total)
    
    quest = {"title": level_info["title"], "progress": current_total, "max": level_info["max"]} 
    
    today = date.today()
    start_date = today - timedelta(days=1) 
    
    # Lấy danh sách ngày đã nhận từ Transaction 
    checkin_transactions = db.query(models.Transaction.created_at)\
        .filter(
            models.Transaction.user_id == current_user.id,
            models.Transaction.title == "Điểm danh hàng ngày"
        ).all()
    claimed_dates = set(t[0].date() for t in checkin_transactions)

    rewards = []
    for i in range(4):
        loop_date = start_date + timedelta(days=i)
        is_today = (loop_date == today)
        
        is_claimed = False
        
        # Logic kiểm tra ngày đã nhận 
        if current_user.last_daily_reward_date and loop_date == current_user.last_daily_reward_date:
            is_claimed = True
        elif loop_date in claimed_dates:
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
        "dailyStreak": current_user.streak,
        "dailyRewards": rewards
    }

@router.get("/rewards", response_model=RewardResponse)
def get_reward_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    real_balance = current_user.eco_points
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
class TreeStatsResponse(BaseModel):
    my_trees: int
    everyone_trees: int

# --- API 7: LẤY THỐNG KÊ CÂY ---
@router.get("/tree-stats", response_model=TreeStatsResponse)
def get_tree_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Đếm số giao dịch có tiêu đề chứa chữ "Trồng cây"
    # 1. Cây của tôi
    my_trees = db.query(models.Transaction).filter(
        models.Transaction.user_id == current_user.id,
        models.Transaction.title.contains("Trồng cây")
    ).count()

    # 2. Cây của mọi người (Cộng thêm số ảo cho đẹp nếu muốn, VD: 15000)
    base_trees = 15830 
    total_real_trees = db.query(models.Transaction).filter(
        models.Transaction.title.contains("Trồng cây")
    ).count()
    
    return {
        "my_trees": my_trees,
        "everyone_trees": base_trees + total_real_trees
    }

# --- API 8: HÀNH ĐỘNG TRỒNG CÂY (Trừ 1000 điểm) ---
@router.post("/plant-tree")
def plant_tree_action(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    PRICE_PER_TREE = 1000

    # 1. Kiểm tra tiền
    if current_user.eco_points < PRICE_PER_TREE:
        return {"success": False, "message": f"Bạn cần {PRICE_PER_TREE} điểm để trồng cây!"}

    # 2. Trừ tiền
    current_user.eco_points -= PRICE_PER_TREE

    # 3. Lưu lịch sử (Để tính vào thống kê cây)
    new_trans = models.Transaction(
        user_id=current_user.id,
        code=generate_trans_code(),
        title="Trồng cây xanh (Góp quỹ)",
        amount=PRICE_PER_TREE,
        type="negative"
    )
    db.add(new_trans)
    
    # 4. Lưu DB
    db.add(current_user)
    db.commit()
    db.refresh(current_user)

    return {
        "success": True, 
        "new_balance": current_user.eco_points,
        "message": "Trồng cây thành công! Cảm ơn bạn đã góp xanh cho Trái Đất."
    }