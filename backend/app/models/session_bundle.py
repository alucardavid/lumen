from sqlalchemy import Column, Integer, Float, String, Boolean
from app.core.database import Base

class SessionBundle(Base):
    __tablename__ = "session_bundles"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)