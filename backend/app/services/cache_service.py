from typing import Any, Optional
import json
from ..database import Database

class CacheService:
    def __init__(self):
        self.db = Database()

    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            value = await self.db.redis.get(key)
            if value:
                return json.loads(value)
            return None
        except:
            return None

    async def set(self, key: str, value: Any, expiry: int = 3600):
        """Set value in cache with expiry in seconds"""
        try:
            await self.db.redis.setex(
                key,
                expiry,
                json.dumps(value)
            )
            return True
        except:
            return False

    async def delete(self, key: str):
        """Delete value from cache"""
        try:
            await self.db.redis.delete(key)
            return True
        except:
            return False

    async def clear_pattern(self, pattern: str):
        """Clear all keys matching pattern"""
        try:
            keys = await self.db.redis.keys(pattern)
            if keys:
                await self.db.redis.delete(*keys)
            return True
        except:
            return False