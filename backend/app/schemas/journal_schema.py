import datetime
from pydantic import BaseModel

from app.models.journal import EmotionEnum

class JournalBase(BaseModel):
    # title: str
    content: str
    images: list[str] = []
    emotion: EmotionEnum
    eco_score: int = 0

class JournalCreate(JournalBase):
    poi_id: int
    pass

class JournalUpdate(JournalBase):
    pass

class JournalOut(JournalBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True
