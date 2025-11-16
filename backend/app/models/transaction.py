from sqlalchemy import Integer, String, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # 'title' (ví dụ: "Đổi Voucher" hoặc "Check-in")
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    
    # 'amount' (ví dụ: 100 hoặc -500)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # 'type' ("positive" hoặc "negative")
    type: Mapped[str] = mapped_column(String(10), default="positive")
    
    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    
    # Liên kết giao dịch này với user
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    owner: Mapped["User"] = relationship(back_populates="transactions")