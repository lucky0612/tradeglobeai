# backend/app/config.py
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API Keys
    SAMBANOVA_API_KEY: str = "3e4ced09-1b40-4a1d-9cfa-d380528da63b"
    EXCHANGE_RATE_API_KEY: str = "cd809ba8d7174e4fba9fb2b31cd59921"
    
    # Base URLs
    WORLD_BANK_BASE_URL: str = "http://api.worldbank.org/v2"
    COMTRADE_BASE_URL: str = "https://comtradeapi.un.org/public/v1"
    DGFT_BASE_URL: str = "https://dgft.gov.in/api/v1"
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True
    
    # Security
    SECRET_KEY: str = "your-secret-key-here"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"

settings = Settings()