from pydantic import BaseModel

class MonthlyRecap(BaseModel):
    user_id: int
    full_name: str
    avatarUrl: str | None = None
    month: int
    year: int
    rank: int
    checkins: int
    trees: int
    monthly_points: int
