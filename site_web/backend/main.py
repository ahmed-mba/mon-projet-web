from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sys
import os

# Ajouter le chemin du répertoire parent pour les imports
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)
sys.path.append(os.path.dirname(current_dir))

# Imports des routes
from routes import auth, destinations, favorites
from database import Base, engine
from models.user import User
from models.destination import Destination
from models.favorite import Favorite

# Créer les tables dans la base de données
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclure les routes d'authentification
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])

# Inclure les routes de destination
app.include_router(destinations.router, prefix="/api/destinations", tags=["destinations"])

# Inclure les routes de favoris
app.include_router(favorites.router, prefix="/api", tags=["favorites"])

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API TravelExplore"}

# http://localhost:8000/docs
# cd backend
# uvicorn main:app --reload