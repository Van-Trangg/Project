from pydantic import BaseModel, Field
from typing import List

# --- 1. Định nghĩa MỘT phần thưởng (cho GET /reward) ---
class Reward(BaseModel):
    id: int
    
    # "Dịch" 'name' (DB) -> 'title' (JSON cho frontend)
    title: str = Field(..., alias='name') 
    
    # "Dịch" 'points_required' (DB) -> 'price' (JSON cho frontend)
    price: int = Field(..., alias='pointsRequired') 
    
    description: str
    image_url: str = Field(..., alias='imageUrl')
    category: str

    class Config:
        from_attributes = True
        populate_by_name = True # Bật chế độ alias


# --- 2. Định nghĩa MỘT mục lịch sử (cho GET /reward/history) ---
class HistoryItem(BaseModel):
    id: int
    title: str
    amount: int
    type: str # "positive" hoặc "negative"

    class Config:
        from_attributes = True

# --- 3. Định nghĩa phản hồi khi Đổi thưởng (cho POST /reward/.../redeem) ---
class RedeemResponse(BaseModel):
    message: str
    user_points_left: int = Field(..., alias='userPointsLeft') # Dịch sang camelCase

    class Config:
        from_attributes = True
        populate_by_name = True