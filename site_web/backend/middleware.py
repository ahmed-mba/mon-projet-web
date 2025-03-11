from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
import time
import logging
import jwt
from typing import Callable
from starlette.middleware.base import BaseHTTPMiddleware
import sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from security import SECRET_KEY, ALGORITHM

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            # Logging de la requête
            logger.info(f"Incoming request: {request.method} {request.url}")
            
            # Vérification du token JWT pour les routes protégées
            if self.requires_auth(request.url.path):
                authorization = request.headers.get("Authorization")
                if not authorization or not authorization.startswith("Bearer "):
                    raise HTTPException(status_code=401, detail="Non autorisé")
                
                token = authorization.split(" ")[1]
                try:
                    jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                except jwt.InvalidTokenError:
                    raise HTTPException(status_code=401, detail="Token invalide")
            
            # Appel de la route
            response = await call_next(request)
            
            # Calcul du temps de traitement
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = str(process_time)
            
            return response
            
        except HTTPException as exc:
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail}
            )
        except Exception as exc:
            logger.error(f"Une erreur est survenue: {str(exc)}")
            return JSONResponse(
                status_code=500,
                content={"detail": "Erreur interne du serveur"}
            )
    
    def requires_auth(self, path: str) -> bool:
        """Détermine si une route nécessite une authentification"""
        public_paths = [
            "/api/auth/login",
            "/api/auth/register",
            "/api/destinations",  # GET public
            "/",
            "/docs",
            "/openapi.json"
        ]
        
        if path in public_paths or path.startswith("/api/destinations") and path.count("/") == 3:
            return False
        return True