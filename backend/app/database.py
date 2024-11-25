from motor.motor_asyncio import AsyncIOMotorClient
from elasticsearch import AsyncElasticsearch
import redis.asyncio as redis
from .config import settings

class Database:
    def __init__(self):
        self.mongodb = None
        self.elasticsearch = None
        self.redis = None
        
    async def connect(self):
        # MongoDB connection
        self.mongodb = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Elasticsearch connection
        self.elasticsearch = AsyncElasticsearch([settings.ELASTICSEARCH_URL])
        
        # Redis connection
        self.redis = redis.Redis.from_url(settings.REDIS_URL)
        
    async def close(self):
        if self.mongodb:
            self.mongodb.close()
        if self.elasticsearch:
            await self.elasticsearch.close()
        if self.redis:
            await self.redis.close()
            
    async def get_mongodb(self):
        return self.mongodb
        
    async def get_elasticsearch(self):
        return self.elasticsearch
        
    async def get_redis(self):
        return self.redis