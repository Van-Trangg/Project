from fastapi import APIRouter, Depends, Form, UploadFile, File
from fastapi import HTTPException
from typing import Annotated 
from app.core.security import get_current_user as TokenDep
from app.models.user import User
from app.schemas.user_schema import UserOut, UserUpdate
from app.db.database import DbDep
from app.core.file_storage import upload_avatar 

router = APIRouter()

@router.get("/", response_model=UserOut)
def my_profile(
    current_user: User = Depends(TokenDep),
    db: DbDep = None
 ):
    rank = db.query(User).filter(User.monthly_points > current_user.monthly_points).count() + 1
    current_user.rank = rank
    return current_user


def get_user_update_form(
    full_name: Annotated[str | None, Form()] = None,
    nickname: Annotated[str | None, Form()] = None,
    bio: Annotated[str | None, Form()] = None,
    phone: Annotated[str | None, Form()] = None,
    address: Annotated[str | None, Form()] = None,
    email: Annotated[str | None, Form()] = None,
    phone_public: Annotated[str | None, Form()] = None,
    address_public: Annotated[str | None, Form()] = None,
    email_public: Annotated[str | None, Form()] = None
) -> UserUpdate:
    
    def to_bool(s: str | None) -> bool | None:
        if s is None:
            return None
        return s.lower() == 'true'

    return UserUpdate(
        full_name=full_name,
        nickname=nickname,
        bio=bio,
        phone=phone,
        address=address,
        email=email,
        phone_public=to_bool(phone_public),
        address_public=to_bool(address_public),
        email_public=to_bool(email_public)
    )

@router.put("/", response_model=UserOut)
def update_profile(
    db: DbDep,
    current_user: User = Depends(TokenDep),
    payload: UserUpdate = Depends(get_user_update_form), 
    avatar_file: UploadFile | None = File(None) 
):
    update_data = payload.model_dump(exclude_unset=True) 
    
    for key, value in update_data.items():
        if hasattr(current_user, key) and value is not None:
            setattr(current_user, key, value)

    if avatar_file and avatar_file.filename: 
        try:
            avatar_url = upload_avatar(file=avatar_file, user_id=current_user.id) 
            current_user.avatar_url = avatar_url
        except Exception as e:
            print(f"Lỗi tải avatar: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload avatar")
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user