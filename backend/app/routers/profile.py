from fastapi import APIRouter, Depends, Form, UploadFile, File
from app.core.security import get_current_user as TokenDep
from app.models.user import User
from app.schemas.user_schema import UserOut, UserUpdate
from app.db.database import DbDep
from app.core.file_storage import upload_avatar

router = APIRouter()

@router.get("/", response_model=UserOut)
def my_profile(current_user: User = Depends(TokenDep)):
    return current_user

def get_user_update_form(
    full_name: str | None = Form(None),
    nickname: str | None = Form(None),
    bio: str | None = Form(None),
    phone: str | None = Form(None),
    address: str | None = Form(None),
    email: str | None = Form(None),
) -> UserUpdate:
    return UserUpdate(
        full_name=full_name,
        nickname=nickname,
        bio=bio,
        phone=phone,
        address=address,
        email=email
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

    if avatar_file:
        try:
            avatar_url = upload_avatar(file=avatar_file, user_id=current_user.id)
            current_user.avatar_url = avatar_url
        except Exception as e:
            print(f"Lỗi tải avatar: {e}")
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user