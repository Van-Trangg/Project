from fastapi import APIRouter, Depends
from app.core.security import get_current_user as TokenDep
from app.models.user import User
# Import các schema và DbDep
from app.schemas.user_schema import UserOut, UserUpdate 
from app.db.database import DbDep

router = APIRouter()

@router.get("/", response_model=UserOut)
def my_profile(current_user: User = Depends(TokenDep)):
    return current_user

@router.put("/", response_model=UserOut)
def update_profile(
    payload: UserUpdate, 
    db: DbDep,
    current_user: User = Depends(TokenDep)
):
    update_data = payload.model_dump(exclude_unset=True)  
    for key, value in update_data.items():
        if hasattr(current_user, key) and value is not None:
            setattr(current_user, key, value)
            
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user