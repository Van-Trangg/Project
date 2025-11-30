from pydantic import BaseModel
from datetime import datetime
from typing import List

class MonthlyStatistic(BaseModel):
    month: int
    year: int
    checkin_points: int
    daily_reward_points: int
    total_points: int
    transactions_count: int

    class Config:
        orm_mode = True

class StatisticListResponse(BaseModel):
    user_id: int
    statistics: List[MonthlyStatistic]
