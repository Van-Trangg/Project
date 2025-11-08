from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    full_name: Mapped[str] = mapped_column(String, default="")   
    nickname: Mapped[str] = mapped_column(String, default="")
    bio: Mapped[str] = mapped_column(String, default="")
    phone: Mapped[str] = mapped_column(String, default="")
    address: Mapped[str] = mapped_column(String, default="") 
    check_ins: Mapped[int] = mapped_column(Integer, default=0)
    badges_count: Mapped[int] = mapped_column(Integer, default=0)    
    eco_points: Mapped[int] = mapped_column(Integer, default=0) 
    total_eco_points: Mapped[int] = mapped_column(Integer, default=0, index=True) 

    journals = relationship("Journal", back_populates="author")