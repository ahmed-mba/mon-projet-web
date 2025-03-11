import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from database import Base

class Destination(Base):
    __tablename__ = "destinations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    country = Column(String)
    description = Column(String)
    price = Column(Float)
    image_url = Column(String)
    category = Column(String)

    # Relation avec les favoris
    favorites = relationship("Favorite", back_populates="destination", cascade="all, delete-orphan")