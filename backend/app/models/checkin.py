from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Index
from datetime import datetime
from app.db.database import Base

class Checkin(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    poi_id = Column(Integer, ForeignKey("pois.id"), index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    distance_m = Column(Float, nullable=False)
    earned_points = Column(Integer, nullable=False)
    receipt_no = Column(String, nullable=False, unique=True)

# Unique constraint: mỗi user chỉ được check-in 1 lần tại 1 POI
Index("ux_checkin_user_poi", Checkin.user_id, Checkin.poi_id, unique=True)
