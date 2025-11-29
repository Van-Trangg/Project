# backend/mock_api/models.py
from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from .db import Base

class RedemptionLog(Base):
    __tablename__ = "redemption_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    promotion_title = Column(String, index=True)
    code = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
