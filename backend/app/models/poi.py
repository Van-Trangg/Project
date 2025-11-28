from sqlalchemy import Boolean, Column, Integer, String, Float, ForeignKey
from app.db.database import Base
from sqlalchemy.orm import relationship

class POI(Base):
    __tablename__ = "pois" 

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    map_id = Column(Integer, ForeignKey("maps.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    rating = Column(Float, default=0.0)
    address = Column(String, nullable=True)
    description = Column(String, nullable=True)
    image = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    score = Column(Integer, default=10)
    checked_users = Column(Integer, default=0)
    category = Column(String, nullable=True)  # cafe xanh, giao thông xanh...
    money_required = Column(Boolean, default=False)
    cost = Column(Integer, default=0)
    journals = relationship("Journal", back_populates="poi")
