from pydantic import BaseModel, Field
from typing import List

# --- Định nghĩa cấu trúc của MỘT phần thưởng ---
class Reward(BaseModel):
    id: int
    name: str
    description: str
    
    # Dùng alias để "dịch" snake_case (DB) sang camelCase (JSON)
    points_required: int = Field(..., alias='pointsRequired')
    image_url: str = Field(..., alias='imageUrl')
    category: str

    class Config:
        from_attributes = True
        populate_by_name = True # Cho phép dùng alias


# --- Định nghĩa cấu trúc trả về khi đổi thưởng thành công ---
class RedeemResponse(BaseModel):
    message: str
    
    # Dùng alias để "dịch" sang camelCase
    user_points_left: int = Field(..., alias='userPointsLeft')

    class Config:
        from_attributes = True
        populate_by_name = True