from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

class Reward(Base):
    __tablename__ = "rewards"

    # Đây là các cột (fields) MỚI
    # Dùng snake_case (chuẩn của database)
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    
    description: Mapped[str] = mapped_column(Text, nullable=True)
    
    points_required: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    
    image_url: Mapped[str] = mapped_column(String(255), nullable=True)
    
    category: Mapped[str] = mapped_column(String(50), nullable=True)