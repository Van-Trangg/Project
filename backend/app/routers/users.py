# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from app.db.database import DbDep
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.user_schema import InvitePageResponse, UserOut

router = APIRouter()

@router.get("/invite-info", response_model=InvitePageResponse)
def get_invite_info(
    db: DbDep,
    current_user: User = Depends(get_current_user)
):
    invitees = db.query(User).filter(User.referred_by_id == current_user.id).all()

    earned = len(invitees) * 50

    invitee_list = []
    for inv in invitees:
        display_name = inv.full_name
        if not display_name and inv.email:
             display_name = inv.email.split('@')[0]
        
        invitee_list.append({
            "id": inv.id,
            "full_name": inv.full_name, 
            "nickname": inv.nickname,    
            "email": inv.email,                   
            "avatar_url": inv.avatar_url,
            "joined_at": None 
        })

    return {
        "my_referral_code": current_user.referral_code,
        "referral_count": len(invitees),
        "total_earned": earned,
        "invitees": invitee_list
    }

@router.get("/{user_id}", response_model=UserOut)
def get_user_profile(user_id: int, db: DbDep):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Không tìm thấy người dùng")

    
    if not user.email_public:
        user.email = None 
        
    if not user.phone_public:
        user.phone = None 
        
    if not user.address_public:
        user.address = None

    return user