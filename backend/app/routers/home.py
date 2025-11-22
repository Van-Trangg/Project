from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, date 

from app.schemas import home_schema
from app import models
from app.db.database import get_db
from app.core.security import get_current_user

router = APIRouter()

# --- HÀM TÍNH DANH HIỆU DỰA TRÊN TỔNG ĐIỂM ---
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

# --- API 1: NHẬN THƯỞNG ĐIỂM DANH ---
@router.post("/claim-reward")
def claim_daily_reward(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    today = date.today()

    # Kiểm tra xem hôm nay đã nhận chưa
    if current_user.last_check_in_date == today:
        return {"success": False, "message": "Hôm nay bạn đã nhận rồi!"}

    points_to_add = 200
    
    current_user.eco_points += points_to_add
    
    if current_user.total_eco_points is None:
        current_user.total_eco_points = 0
    current_user.total_eco_points += points_to_add

    current_user.last_check_in_date = today
    current_user.check_ins += 1 

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
        "message": "Nhận thưởng thành công!"
    }


# --- API 2: LẤY DỮ LIỆU TRANG CHỦ ---
@router.get(
    "/", 
    response_model=home_schema.HomeDataResponse
)
def get_real_home_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # 1. Tính Rank (Số người có điểm eco_points cao hơn mình + 1)
    rank = db.query(models.User).filter(models.User.eco_points > current_user.eco_points).count() + 1
    
    current_total = current_user.total_eco_points if current_user.total_eco_points else 0
    
    # Gọi hàm tính toán level
    level_info = calculate_level(current_total)
    
    quest = {
        "title": level_info["title"], 
        "progress": current_total,  
        "max": level_info["max"]    
    } 
    
    # 3. Xử lý Daily Rewards ĐỘNG (Tự động theo ngày thực tế)
    rewards = []
    today = date.today()
    
    # Tạo danh sách hiển thị 4 ngày bắt đầu từ hôm qua
    start_date = today - timedelta(days=1) 

    for i in range(4):
        loop_date = start_date + timedelta(days=i)
        
        # Kiểm tra xem ngày trong vòng lặp có phải hôm nay không
        is_today = (loop_date == today)
        
        # Kiểm tra xem ngày này đã nhận thưởng chưa
        is_claimed = False
        if current_user.last_check_in_date:
            # Nếu ngày đang xét nhỏ hơn hoặc bằng ngày check-in cuối cùng -> Đã nhận
            if loop_date <= current_user.last_check_in_date:
                is_claimed = True
        
        rewards.append({
            "date": loop_date.strftime("%d/%m"), 
            "points": 10,
            "claimed": is_claimed,
            "isToday": is_today
        })

    real_data = {
        "userName": current_user.nickname or current_user.full_name,
        "avatarUrl": current_user.avatar_url,
        "ecopoints": current_user.eco_points, # Điểm tiêu xài hiện tại
        "badges": current_user.badges_count,
        "rank": rank, 
        "checkIns": current_user.check_ins,
        
        # Thông tin thanh Progress Bar (Dùng total_eco_points)
        "currentTitle": quest["title"],
        "progressCurrent": quest["progress"],
        "progressMax": quest["max"],
        
        "dailyStreak": current_user.check_ins, 
        "dailyRewards": rewards
    }
    
    return real_data