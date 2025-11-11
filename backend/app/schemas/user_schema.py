+from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None = None
    nickname: str | None = None
    bio: str | None = None
    phone: str | None = None
    address: str | None = None
    check_ins: int
    badges_count: int
    eco_points: int
    total_eco_points: int
    avatar_url: str | None = None
    class Config:
        from_attributes = True
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str

class SetNewPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    password: str = Field(min_length=8, max_length=72)

class UserUpdate(BaseModel):
    full_name: str | None = None
    nickname: str | None = None
    bio: str | None = None
    phone: str | None = None
    address: str | None = None
    email: EmailStr | None = None
