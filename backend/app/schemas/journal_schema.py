from pydantic import BaseModel

from app.models.journal import EmotionEnum

class JournalBase(BaseModel):
    # title: str
    content: str
    images: list[str] = []
    emotion: EmotionEnum
    eco_score: int = 0

class JournalCreate(JournalBase):
    location_id: int
    pass

class JournalUpdate(JournalBase):
    pass

class JournalOut(JournalBase):
    id: int

    class Config:
        from_attributes = True
