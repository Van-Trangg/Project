from pydantic import BaseModel, Field
from typing import List

# Định nghĩa cấu trúc cho DailyReward mà frontend muốn
class DailyReward(BaseModel):
    date: str
    points: int
    claimed: bool
    is_today: bool = Field(..., alias='isToday') 

    class Config:
        from_attributes = True
        populate_by_name = True

# Định nghĩa cấu trúc HomeDataResponse
class HomeDataResponse(BaseModel):
    user_name: str = Field(..., alias='userName')

    avatar_url: str | None = Field(None, alias='avatarUrl')
    ecopoints: int = Field(..., alias='ecopoints') 
    badges: int = Field(..., alias='badges')
    rank: int = Field(..., alias='rank')
    
    check_ins: int = Field(..., alias='checkIns')
    
    current_title: str = Field(..., alias='currentTitle')
    progress_current: int = Field(..., alias='progressCurrent')
    progress_max: int = Field(..., alias='progressMax')
    
    daily_streak: int = Field(..., alias='dailyStreak')
    daily_rewards: List[DailyReward] = Field(..., alias='dailyRewards')

    class Config:
        from_attributes = True
        populate_by_name = True 