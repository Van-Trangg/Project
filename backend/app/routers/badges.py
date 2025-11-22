from fastapi import APIRouter, Depends
from app.core.security import get_current_user as TokenDep
from app.models.user import User
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.badge import UserBadge
# Import từ file data mới
from app.core.badge_data import get_available_rewards 

router = APIRouter()

@router.get("/", tags=["badges"]) 
def list_badges(): 
    return get_available_rewards()

@router.get("/me", tags=["badges"]) 
def list_badges_for_user(
    current_user: User = Depends(TokenDep),
    db: Session = Depends(get_db)
):
    """
    Trả về danh sách badges.
    Logic sửa đổi: Mở khóa nếu (Có trong DB) HOẶC (Đủ điểm eco_points).
    """
    # 1. Lấy điểm hiện tại
    points = getattr(current_user, "total_eco_points", 0) or 0
    
    # 2. Lấy badge đã lưu trong DB (để lấy ngày obtained_at)
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == current_user.id).all()
    earned_map = {ub.badge_id: ub.obtained_at for ub in user_badges}
    
    versions = []
    all_data = get_available_rewards()

    for v in all_data:
        vv = {"version": v.get("version"), "title": v.get("title"), "badges": []}
        for b in v.get("badges", []):
            item = b.copy()
            b_id = item["id"]
            threshold = item.get("threshold", 0)

            # 👉 LOGIC TỰ ĐỘNG MỞ KHÓA (FIX LỖI MỜ BADGE)
            is_in_db = b_id in earned_map
            is_enough_points = points >= threshold

            if is_in_db:
                # Trường hợp 1: Đã có trong DB (Chuẩn nhất)
                item["unlocked"] = True
                item["obtained_at"] = earned_map[b_id].isoformat()
            elif is_enough_points:
                # Trường hợp 2: Đủ điểm nhưng chưa kịp lưu vào DB (Vẫn cho hiện)
                item["unlocked"] = True
                item["obtained_at"] = None # Chưa có ngày cụ thể
            else:
                # Trường hợp 3: Chưa đủ điểm
                item["unlocked"] = False
                item["obtained_at"] = None
                
            vv["badges"].append(item)
        versions.append(vv)
        
    return {"eco_points": points, "versions": versions}