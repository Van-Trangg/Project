from sqlalchemy.orm import Session
from datetime import datetime
from app.models.badge import UserBadge
from app.models.user import User
from app.core.badge_data import get_available_rewards 

def check_and_award_badges(db: Session, user_id: int, current_points: int):
    """
    Kiểm tra xem user có đạt badge mới không dựa trên current_points.
    Đồng thời CẬP NHẬT lại cột badges_count trong bảng User.
    """
    
    # 1. Lấy user để chuẩn bị update
    user = db.get(User, user_id)
    if not user:
        return []

    # 2. Lấy danh sách badge ID đã có trong DB
    existing_badge_ids = db.query(UserBadge.badge_id)\
                           .filter(UserBadge.user_id == user_id)\
                           .all()
    existing_ids_set = {b[0] for b in existing_badge_ids}

    new_badges_awarded = []

    # 3. Lấy định nghĩa badge từ file data
    all_versions = get_available_rewards()
    
    qualified_badge_ids = set(existing_ids_set) 
    for version in all_versions:
        for badge in version["badges"]:
            b_id = badge["id"]
            threshold = badge["threshold"]
            
            # Kiểm tra nếu đủ điểm
            if current_points >= threshold:
                qualified_badge_ids.add(b_id) 

                if b_id not in existing_ids_set:
                    new_record = UserBadge(
                        user_id=user_id,
                        badge_id=b_id,
                        obtained_at=datetime.now()
                    )
                    db.add(new_record)
                    new_badges_awarded.append(badge)
                    existing_ids_set.add(b_id)

    # 4. CẬP NHẬT SỐ LƯỢNG VÀO USER (Đây là phần sửa lỗi chính)
    new_count = len(qualified_badge_ids)
    
    if user.badges_count != new_count:
        user.badges_count = new_count
        db.add(user) 

    # 5. Commit thay đổi (Lưu badge mới và số lượng mới)
    db.commit()
    db.refresh(user)
        
    return new_badges_awarded

def sync_all_user_badge_counts(db: Session):
    """
    Hàm này sẽ duyệt qua TẤT CẢ user, tính toán lại số badge họ sở hữu
    dựa trên điểm số và dữ liệu trong DB, sau đó cập nhật cột badges_count.
    """

    users = db.query(User).all()
    

    all_versions = get_available_rewards()

    all_badges_flat = []
    for version in all_versions:
        all_badges_flat.extend(version.get("badges", []))

    updated_count = 0
    
    for user in users:
        user_points = user.total_eco_points or 0 
        

        db_badge_ids = {
            row[0] for row in db.query(UserBadge.badge_id).filter(UserBadge.user_id == user.id).all()
        }
        
        qualified_badge_ids = set()
        for b in all_badges_flat:
            b_id = b.get("id")
            threshold = b.get("threshold", 0)
            
            if user_points >= threshold:
                qualified_badge_ids.add(b_id)
        
        final_badge_ids = db_badge_ids.union(qualified_badge_ids)
        real_count = len(final_badge_ids)
        

        if user.badges_count != real_count:
            user.badges_count = real_count
            updated_count += 1
            
    db.commit()
    
    return {"message": f"Đã đồng bộ badge_count cho {updated_count} user(s)."}