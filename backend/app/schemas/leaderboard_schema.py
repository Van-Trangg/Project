from pydantic import BaseModel

class LeaderboardEntry(BaseModel):
    id: int
    user_name: str
    points: int

    class Config:
        from_attributes = True