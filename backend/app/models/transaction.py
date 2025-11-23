from sqlalchemy import Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from datetime import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # Nội dung giao dịch (VD: "Điểm danh", "Đổi quà")
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # Số tiền biến động (VD: 10, -5000)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Loại giao dịch ("positive" hoặc "negative")
    type: Mapped[str] = mapped_column(String(20), default="positive")
    
    # Thời gian tạo (Tự động lấy giờ server)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    
    # Liên kết với bảng User
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    
    # Dùng chuỗi "User" để tránh lỗi import
    owner: Mapped["User"] = relationship("User", back_populates="transactions")

    code: Mapped[str] = mapped_column(String(6), unique=True, nullable=False)
