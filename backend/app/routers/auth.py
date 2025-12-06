import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
from app.models.transaction import Transaction 
from app.core.utils import generate_unique_code 
from app.crud.badge_crud import check_and_award_badges

router = APIRouter()

# LƯU Ý: Nên đưa vào biến môi trường (.env)
SENDER_EMAIL = "lethuan270306@gmail.com"
SENDER_PASSWORD = "ghpi bmwq xbfa vofq"

def send_otp_email(to_email: str, otp_code: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = to_email
        msg['Subject'] = "Mã xác thực OTP của bạn"
        body = f"Mã OTP của bạn là: {otp_code}. Mã này sẽ hết hạn sau 15 phút."
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, to_email, text)
        server.quit()
        print(f"--> Email sent to {to_email}")
    except Exception as e:
        print(f"Error sending email: {e}")

reset_codes = {}

@router.post("/register", response_model=UserOut)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    referrer_id = None
    if payload.referral_code:
        # Tìm user sở hữu mã này
        referrer = db.query(User).filter(User.referral_code == payload.referral_code).first()
        if not referrer:
            raise HTTPException(status_code=400, detail="Mã giới thiệu không hợp lệ")
        referrer_id = referrer.id

    user = User(
        email=payload.email, 
        hashed_password=hash_password(payload.password), 
        full_name=payload.full_name or "",
        referred_by_id=referrer_id # Lưu lại, chưa cộng điểm
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    code = f"{random.randint(0, 9999):04d}"
    expiry = datetime.utcnow() + timedelta(minutes=15)
    reset_codes[payload.email] = {"code": code, "expiry": expiry}
    send_otp_email(payload.email, code)    
    
    return user

@router.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    if user.referral_code is None:
        while True:
            new_code = generate_unique_code()
            # Kiểm tra trùng lặp
            if not db.query(User).filter(User.referral_code == new_code).first():
                user.referral_code = new_code
                break
        
        db.add(user)
        db.commit()
        db.refresh(user)
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
    send_otp_email(payload.email, code)
    return {"message": "Reset code sent to email"}


@router.post("/verify-reset")
def verify_reset_code(payload: VerifyCodeRequest, db: Session = Depends(get_db)): 
    stored_data = reset_codes.get(payload.email)
    
    # 1. Validate OTP
    if not stored_data or stored_data["code"] != payload.code:
         raise HTTPException(status_code=400, detail="Mã không hợp lệ hoặc đã hết hạn")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
         raise HTTPException(status_code=404, detail="User not found")

    # 2. Logic sinh mã mời (nếu chưa có)
    if not user.referral_code:       
        while True:
            new_code = generate_unique_code()
            if not db.query(User).filter(User.referral_code == new_code).first():
                user.referral_code = new_code
                break
        db.add(user) # Add vào session để chuẩn bị commit
    
    # 3. LOGIC TRẢ THƯỞNG (Đã tách ra khỏi khối if ở trên)
    # Kiểm tra: Có người giới thiệu KHÔNG?
    if user.referred_by_id:
        
        # Kiểm tra quan trọng: Đã từng nhận thưởng "Quà tân thủ" chưa? (Chống cộng điểm 2 lần)
        existing_reward = db.query(Transaction).filter(
            Transaction.user_id == user.id,
            Transaction.title == "Quà tân thủ (Nhập mã giới thiệu)"
        ).first()

        if not existing_reward: # Chỉ cộng nếu chưa từng nhận
            referrer = db.get(User, user.referred_by_id)
            if referrer:
                BONUS = 50 
                
                # Cộng điểm
                user.eco_points += BONUS
                user.total_eco_points += BONUS
                
                referrer.eco_points += BONUS
                referrer.total_eco_points += BONUS
                
                # Tạo Transaction
                t1 = Transaction(
                    user_id=user.id,
                    title="Quà tân thủ (Nhập mã giới thiệu)",
                    amount=BONUS,
                    type="positive",
                    code=generate_unique_code()
                )
                
                t2 = Transaction(
                    user_id=referrer.id,
                    title=f"Mời thành công: {user.full_name or user.email}",
                    amount=BONUS,
                    type="positive",
                    code=generate_unique_code()
                )
                
                db.add(t1)
                db.add(t2)
                db.add(referrer)
                
                # Check badge
                check_and_award_badges(db, referrer.id, referrer.total_eco_points)  
                check_and_award_badges(db, user.id, user.total_eco_points)

    # 4. Commit cuối cùng
    db.commit()

    return {"message": "Code verified & Account activated"}

@router.post("/reset")
def set_new_password(payload: SetNewPasswordRequest, db: Session = Depends(get_db)):
    # ... (Giữ nguyên)
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