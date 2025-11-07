from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.db.database import Base

class POI(Base):
    __tablename__ = "pois"  # ⚠️ đặt tên bảng dạng số nhiều cho thống nhất

    id = Column(Integer, primary_key=True, index=True)
    map_id = Column(Integer, ForeignKey("maps.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    address = Column(String, nullable=True)
    description = Column(String, nullable=True)
    image = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    score = Column(Integer, default=10)
    category = Column(String, nullable=True)  # cafe xanh, giao thông xanh...
