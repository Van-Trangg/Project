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
    vehicle_bonus: int
    total_points: int
    receipt_no: str

class VehicleConfirmRequest(BaseModel):
    vehicle_type: str  # walk|bike|bus|car|ev_scooter...
