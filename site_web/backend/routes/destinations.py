from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
from models.destination import Destination
from pydantic import BaseModel

# Modèle Pydantic pour la validation des données
class DestinationCreate(BaseModel):
    name: str
    country: str
    description: str
    price: float
    image_url: str
    category: str

class DestinationResponse(BaseModel):
    id: int
    name: str
    country: str
    description: str
    price: float
    image_url: str
    category: str

    class Config:
        orm_mode = True

router = APIRouter()

# Dependency pour la base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=DestinationResponse)
async def create_destination(destination: DestinationCreate, db: Session = Depends(get_db)):
    db_destination = Destination(**destination.dict())
    db.add(db_destination)
    db.commit()
    db.refresh(db_destination)
    return db_destination

@router.get("/", response_model=List[DestinationResponse])
async def get_destinations(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    destinations = db.query(Destination).offset(skip).limit(limit).all()
    return destinations

@router.get("/{destination_id}", response_model=DestinationResponse)
async def get_destination(destination_id: int, db: Session = Depends(get_db)):
    destination = db.query(Destination).filter(Destination.id == destination_id).first()
    if destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    return destination

@router.put("/{destination_id}", response_model=DestinationResponse)
async def update_destination(
    destination_id: int,
    destination: DestinationCreate,
    db: Session = Depends(get_db)
):
    db_destination = db.query(Destination).filter(Destination.id == destination_id).first()
    if db_destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    for key, value in destination.dict().items():
        setattr(db_destination, key, value)
    
    db.commit()
    db.refresh(db_destination)
    return db_destination

@router.delete("/{destination_id}")
async def delete_destination(destination_id: int, db: Session = Depends(get_db)):
    db_destination = db.query(Destination).filter(Destination.id == destination_id).first()
    if db_destination is None:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    db.delete(db_destination)
    db.commit()
    return {"message": "Destination deleted successfully"}