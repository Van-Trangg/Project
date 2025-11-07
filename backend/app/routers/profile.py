from fastapi import APIRouter, Depends 
from app.core.security import get_current_user 
from app.models.user import User
from app.schemas.user_schema import UserOut

router = APIRouter()

@router.get("/", response_model=UserOut)
def my_profile(current_user: User = Depends(get_current_user)):
    return current_user