from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Créer le dossier pour la base de données s'il n'existe pas
if not os.path.exists('db'):
    os.makedirs('db')

# URL de la base de données
SQLALCHEMY_DATABASE_URL = "sqlite:///./db/travel.db"

# Créer le moteur de base de données
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Créer la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Créer la base
Base = declarative_base()