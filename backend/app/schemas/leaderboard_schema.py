from pydantic import BaseModel

class LeaderboardOut(BaseModel):
    id: int
    user_name: str
    avatar: str | None = None
    points: int
    rank: int = 0

    class Config:
        from_attributes = True
