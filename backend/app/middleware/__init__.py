from .auth import AuthMiddleware
from .logging import LoggingMiddleware
from .error_handler import ErrorHandlerMiddleware
from .rate_limiter import RateLimiterMiddleware

__all__ = [
    'AuthMiddleware',
    'LoggingMiddleware',
    'ErrorHandlerMiddleware',
    'RateLimiterMiddleware',
]

# backend/app/middleware/auth.py
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from ..config import settings
from ..database import Database

security = HTTPBearer()

class AuthMiddleware:
    def __init__(self):
        self.db = Database()

    async def __call__(self, request: Request, credentials: HTTPAuthorizationCredentials = security):
        try:
            token = credentials.credentials
            payload = jwt.decode(
                token, 
                settings.SECRET_KEY,
                algorithms=["HS256"]
            )
            
            # Check if token is blacklisted
            is_blacklisted = await self.db.redis.get(f"blacklisted_token:{token}")
            if is_blacklisted:
                raise HTTPException(
                    status_code=401,
                    detail="Token has been invalidated"
                )
            
            # Get user from database
            user = await self.db.users.find_one({"_id": payload["sub"]})
            if not user:
                raise HTTPException(
                    status_code=401,
                    detail="User not found"
                )
                
            # Add user to request state
            request.state.user = user
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired"
            )
        except jwt.JWTError:
            raise HTTPException(
                status_code=401,
                detail="Could not validate credentials"
            )
        except Exception:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication credentials"
            )

        return await self.call_next(request)
