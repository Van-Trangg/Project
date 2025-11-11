from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.schemas.user_schema import UserOut 
from app.db.database import DbDep

router = APIRouter()

@router.get("/{id}", response_model=UserOut)
def get_public_user_profile(
    id: int, 
    db: DbDep
):
    user = db.get(User, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not user.phone_public:
        user.phone = None
        
    if not user.address_public:
        user.address = None
        
    if not user.email_public:
        user.email = None
    return user