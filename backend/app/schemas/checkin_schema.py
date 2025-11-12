from pydantic import BaseModel

class CheckinRequest(BaseModel):
    user_id: int
    poi_id: int
    user_lat: float
    user_lng: float

class CheckinReceipt(BaseModel):
    checkin_id: int
    poi_name: str
    distance_m: float
    earned_points: int
    total_points: int
    receipt_no: str

