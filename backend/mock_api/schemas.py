# backend/mock_api/schemas.py
from pydantic import BaseModel
from datetime import datetime

class RedemptionCreate(BaseModel):
    user_id: int
    promotion_title: str
    code: str

class RedemptionOut(BaseModel):
    id: int
    user_id: int
    promotion_title: str
    code: str
    created_at: datetime

    class Config:
        orm_mode = True
