from typing import Optional
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response_type: str
    poi_slug: Optional[str]
    poi_id: Optional[int]
    message: str

