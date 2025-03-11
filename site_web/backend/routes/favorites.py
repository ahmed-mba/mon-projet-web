import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import SessionLocal
from models.user import User
from models.destination import Destination
from models.favorite import Favorite
from security import get_current_user

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/favorites/{destination_id}")
async def add_favorite(
    destination_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Vérifier si la destination existe
    destination = db.query(Destination).filter(Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    
    # Vérifier si déjà en favori
    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id, 
        Favorite.destination_id == destination_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Destination already in favorites")
    
    # Créer le favori
    new_favorite = Favorite(user_id=current_user.id, destination_id=destination_id)
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    
    return {"message": "Destination added to favorites"}

@router.delete("/favorites/{destination_id}")
async def remove_favorite(
    destination_id: int, 
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Supprimer des favoris
    favorite = db.query(Favorite).filter(
        Favorite.user_id == current_user.id, 
        Favorite.destination_id == destination_id
    ).first()
    
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Destination removed from favorites"}

@router.get("/favorites")
async def get_favorites(
    current_user: User = Depends(get_current_user), 
    db: Session = Depends(get_db)
):
    # Récupérer tous les favoris de l'utilisateur
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    
    # Transformer en liste de destinations
    favorite_destinations = [favorite.destination for favorite in favorites]
    
    return favorite_destinations