from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    full_name: str | None = None
    referral_code: str | None = None 

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr | None = None
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
    phone_public: bool
    address_public: bool
    email_public: bool
    rank: int | None = None
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
    phone_public: bool | None = None
    address_public: bool | None = None
    email_public: bool | None = None

class InviteeInfo(BaseModel):
    id: int
    full_name: str
    avatar_url: str | None
    joined_at: datetime | None = None

class InvitePageResponse(BaseModel):
    my_referral_code: str | None
    referral_count: int
    total_earned: int
    invitees: List[InviteeInfo]