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

    rank = db.query(User).filter(User.eco_points > user.eco_points).count() + 1
    user_response = UserOut.model_validate(user)
    
    user_response.rank = rank
    
    if not user.phone_public:
        user_response.phone = None
        
    if not user.address_public:
        user_response.address = None
        
    if not user.email_public:
        user_response.email = None
        
    return user_response