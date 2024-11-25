from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from ..database import Database

class RateLimiterMiddleware:
    def __init__(self, requests_per_minute: int = 60):
        self.db = Database()
        self.requests_per_minute = requests_per_minute

    async def __call__(self, request: Request, call_next):
        # Get client IP
        client_ip = request.client.host
        
        # Get current minute key
        current_minute = datetime.utcnow().strftime("%Y-%m-%d-%H-%M")
        key = f"rate_limit:{client_ip}:{current_minute}"
        
        # Increment request count
        request_count = await self.db.redis.incr(key)
        
        # Set expiry if first request
        if request_count == 1:
            await self.db.redis.expire(key, 60)
        
        # Check if limit exceeded
        if request_count > self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please try again later."
            )
        
        return await call_next(request)
