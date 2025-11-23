from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response_type: str         # "chat" hoặc "recommend"
    poi_name: Optional[str]    # tên trả về từ AI
    poi_id: Optional[int]      # id backend map
    message: str               # câu để hiển thị
