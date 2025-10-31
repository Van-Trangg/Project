from pydantic import BaseModel

class RewardOut(BaseModel):
    id: int
    badge: str
    threshold: int

    class Config:
        from_attributes = True