from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.user_schema import (
    UserCreate, UserLogin, UserOut,
    ForgotPasswordRequest, VerifyCodeRequest, SetNewPasswordRequest
)
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User
import random
from datetime import datetime, timedelta

router = APIRouter()


reset_codes = {}
@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, hashed_password=hash_password(payload.password), full_name=payload.full_name or "")
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "email": user.email, "full_name": user.full_name}}

@router.post("/forgot")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="There is no account linked to the email you provided")
    code = f"{random.randint(0, 9999):04d}"
    expiry = datetime.utcnow() + timedelta(minutes=15)
    reset_codes[payload.email] = {"code": code, "expiry": expiry}
    print(f"!!! OTP reset for  {payload.email} is: {code} !!!") 
    return {"message": "Reset code sent to email"}

@router.post("/verify-reset")
def verify_reset_code(payload: VerifyCodeRequest):
    stored_data = reset_codes.get(payload.email)
    
    if not stored_data:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
        
    if stored_data["code"] != payload.code:
        raise HTTPException(status_code=400, detail="Invalid code")
        
    if datetime.utcnow() > stored_data["expiry"]:
        del reset_codes[payload.email]
        raise HTTPException(status_code=400, detail="Expired code")

    return {"message": "Code verified"}


@router.post("/reset")
def set_new_password(payload: SetNewPasswordRequest, db: Session = Depends(get_db)):
    stored_data = reset_codes.get(payload.email)
    if not stored_data or stored_data["code"] != payload.code or datetime.utcnow() > stored_data["expiry"]:
        raise HTTPException(status_code=400, detail="Invalid or expired code. Please try again.")
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(payload.password)
    db.commit()   
    del reset_codes[payload.email]    
    return {"message": "Password updated successfully"}