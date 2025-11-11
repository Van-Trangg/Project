from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

# Import "thực đơn" (schema)
from app.schemas import home_schema

# Import các "công cụ"
from app import models
from app.db.database import get_db
from app.core.security import get_current_user # "Người gác cổng"

# Import CRUD (chúng ta vẫn cần 'leaderboard')
#from app.crud import leaderboard_crud 
# (Bạn có thể cần import thêm quest_crud, daily_reward_crud...)

router = APIRouter()

@router.get(
    "/", 
    response_model=home_schema.HomeDataResponse # Vẫn dùng schema (camelCase)
)
def get_real_home_data(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Cung cấp dữ liệu THẬT (real data) cho trang chủ
    dựa trên model User đã được xác thực.
    """
    
    # === LẤY DATA TỪ DATABASE ===
    
    # 1. Lấy rank (Vẫn phải gọi CRUD vì 'rank' không có sẵn trong User)
    # (Hỏi team của bạn tên hàm chính xác, ví dụ: 'get_user_rank')
    #rank = leaderboard_crud.get_user_rank(db, user_id=current_user.id) 
    
    # 2. Lấy Quest/Daily (Tạm thời giả lập nếu team khác chưa xong)
    quest = {"title": "Friend of Tree", "progress": 1600, "max": 2000} # (Giống ảnh)
    rewards = [
        { "date": "25/10", "points": 10, "claimed": True, "isToday": False },
        { "date": "26/10", "points": 10, "claimed": False, "isToday": True },
        { "date": "27/10", "points": 10, "claimed": True, "isToday": False },
        { "date": "28/10", "points": 10, "claimed": True, "isToday": False },
    ]

    # === TRẢ VỀ DATA (KHỚP VỚI 'camelCase' CỦA SCHEMA) ===
    # Lấy data trực tiếp từ 'current_user' (dùng tên cột ĐÚNG)
    real_data = {
        "userName": current_user.nickname or current_user.full_name, # Ưu tiên nickname
        "ecopoints": current_user.eco_points,   # <-- Tên đúng
        "badges": current_user.badges_count,  # <-- Tên đúng (Đơn giản hơn)
        "rank": 1, # Lấy từ CRUD
        "checkIns": current_user.check_ins,     # <-- Tên đúng
        
        "currentTitle": quest["title"],
        "progressCurrent": quest["progress"],
        "progressMax": quest["max"],
        
        # LƯU Ý: Model User không có 'daily_streak'. 
        # Chúng ta tạm dùng 'check_ins' hoặc 0
        "dailyStreak": current_user.check_ins, 
        
        "dailyRewards": rewards
    }
    
    return real_data