from enum import Enum
from sqlalchemy import JSON, DateTime, Integer, String, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base
from datetime import datetime

class EmotionEnum(str, Enum):
    SLEEPY = "Sleepy"
    JOYFUL = "Joyful"
    MISERABLE = "Miserable"
    HAPPY = "Happy"
    SAD = "Sad"
    NEUTRAL = "Neutral"
    DELIGHTED = "Delighted"
    ANGRY = "Angry"
    CONFUSED = "Confused"

class Journal(Base):
    __tablename__ = "journals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    # title: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(String)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    emotion: Mapped[EmotionEnum] = mapped_column(String, default=EmotionEnum.NEUTRAL)
    eco_score: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=func.now())

    poi_id: Mapped[int] = mapped_column(ForeignKey("pois.id"))
    poi = relationship("POI", back_populates="journals")

    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    author = relationship("User", back_populates="journals")
