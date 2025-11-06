from pydantic import BaseModel

class JournalBase(BaseModel):
    title: str
    content: str
    eco_score: int = 0

class JournalCreate(JournalBase):
    pass

class JournalUpdate(JournalBase):
    pass

class JournalOut(JournalBase):
    id: int

    class Config:
        from_attributes = True