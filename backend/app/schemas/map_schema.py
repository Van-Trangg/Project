from pydantic import BaseModel
from typing import List
from typing import Optional

class MapOut(BaseModel):
    id: int
    name: str
    center_lat: float
    center_lng: float
    radius_m: int
    class Config: from_attributes = True

class PoiOut(BaseModel):
    id: int
    slug: str  
    map_id: int
    name: str
    address: Optional[str] = None            
    description: Optional[str] = None        
    lat: float
    lng: float
    score: int
    rating: Optional[float] = None           
    category: Optional[str] = None           
    image: Optional[str] = None              
    visited: bool = False
    money_required: bool = False
    cost: int = 0                   

    class Config:
        from_attributes = True  

