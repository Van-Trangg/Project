from sqlalchemy.orm import Session
from datetime import datetime
from app.models.badge import UserBadge
# Sửa import: Lấy từ core/badge_data thay vì router
from app.core.badge_data import get_available_rewards 

def check_and_award_badges(db: Session, user_id: int, current_points: int):
    existing_badge_ids = db.query(UserBadge.badge_id)\
                           .filter(UserBadge.user_id == user_id)\
                           .all()
    existing_ids_set = {b[0] for b in existing_badge_ids}

    new_badges_awarded = []

    # Gọi hàm từ file data
    all_versions = get_available_rewards()
    
    for version in all_versions:
        for badge in version["badges"]:
            b_id = badge["id"]
            threshold = badge["threshold"]
            if current_points >= threshold and b_id not in existing_ids_set:
                new_record = UserBadge(
                    user_id=user_id,
                    badge_id=b_id,
                    obtained_at=datetime.now()
                )
                db.add(new_record)
                new_badges_awarded.append(badge)
    
    if new_badges_awarded:
        db.commit()
        
    return new_badges_awarded