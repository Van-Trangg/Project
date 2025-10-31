from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base

class Reward(Base):
    __tablename__ = "rewards"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    badge: Mapped[str] = mapped_column(String)
    threshold: Mapped[int] = mapped_column(Integer, default=0)