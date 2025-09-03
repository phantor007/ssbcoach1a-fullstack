"""
SSB Coach 1A Backend Configuration
Settings and environment management
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # Application
    APP_NAME: str = "SSB Coach 1A API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    LOG_LEVEL: str = "INFO"

    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/ssbcoach1a"
    REDIS_URL: str = "redis://localhost:6379"

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8080"]
    ALLOWED_HOSTS: List[str] = ["localhost", "127.0.0.1"]

    # Features
    INIT_SAMPLE_DATA: bool = True
    ENABLE_AI_FEATURES: bool = True
    ENABLE_ANALYTICS: bool = True
    ENABLE_GAMIFICATION: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()