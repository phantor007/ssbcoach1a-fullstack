"""
SSB Coach 1A - FastAPI Backend Application
Modern backend API for SSB preparation platform
"""

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import uvicorn
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import IndexModel, ASCENDING, DESCENDING
import logging
from datetime import datetime

# Import route modules
from routes import auth, users, tests, coaches, analytics, admin
from config.settings import settings
from services.database import database
from utils.logging_config import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    logger.info("🚀 Starting SSB Coach 1A API Server...")
    
    # Connect to MongoDB
    await database.connect()
    logger.info("📊 Connected to MongoDB")
    
    # Create indexes for better performance
    await create_database_indexes()
    logger.info("🔧 Database indexes created")
    
    # Initialize sample data if needed
    if settings.INIT_SAMPLE_DATA:
        await init_sample_data()
        logger.info("📝 Sample data initialized")
    
    logger.info("✅ SSB Coach 1A API Server started successfully!")
    
    yield
    
    # Shutdown
    logger.info("🛑 Shutting down SSB Coach 1A API Server...")
    await database.disconnect()
    logger.info("👋 Server shutdown complete")

# Create FastAPI application
app = FastAPI(
    title="SSB Coach 1A API",
    description="Advanced SSB Interview Preparation Platform - Backend API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware for security
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for load balancers"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT
    }

# API Info endpoint
@app.get("/api", tags=["Info"])
async def api_info():
    """API information and available endpoints"""
    return {
        "name": "SSB Coach 1A API",
        "version": "1.0.0",
        "description": "Advanced SSB Interview Preparation Platform",
        "features": [
            "User Authentication & Management",
            "AI-Powered Test Analysis",
            "Real-time Analytics",
            "Gamification System",
            "Coach & Center Management",
            "Practice Test Engine",
            "Progress Tracking",
            "Admin Dashboard"
        ],
        "documentation": "/api/docs",
        "redoc": "/api/redoc",
        "health": "/health"
    }

# Include route modules
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(tests.router, prefix="/api/tests", tags=["Tests"])
app.include_router(coaches.router, prefix="/api/coaches", tags=["Coaches"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

async def create_database_indexes():
    """Create database indexes for better performance"""
    try:
        # Users collection indexes
        users_indexes = [
            IndexModel([("email", ASCENDING)], unique=True),
            IndexModel([("username", ASCENDING)], unique=True),
            IndexModel([("role", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]
        await database.db.users.create_indexes(users_indexes)
        
        # Tests collection indexes
        tests_indexes = [
            IndexModel([("type", ASCENDING)]),
            IndexModel([("difficulty", ASCENDING)]),
            IndexModel([("is_premium", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("created_at", DESCENDING)]),
        ]
        await database.db.tests.create_indexes(tests_indexes)
        
        # Test attempts collection indexes
        attempts_indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("test_id", ASCENDING)]),
            IndexModel([("status", ASCENDING)]),
            IndexModel([("started_at", DESCENDING)]),
            IndexModel([("user_id", ASCENDING), ("test_id", ASCENDING)]),
        ]
        await database.db.test_attempts.create_indexes(attempts_indexes)
        
        # Coaches collection indexes
        coaches_indexes = [
            IndexModel([("service_branch", ASCENDING)]),
            IndexModel([("is_featured", ASCENDING)]),
            IndexModel([("is_active", ASCENDING)]),
            IndexModel([("rating", DESCENDING)]),
        ]
        await database.db.coaches.create_indexes(coaches_indexes)
        
        # Analytics collection indexes
        analytics_indexes = [
            IndexModel([("user_id", ASCENDING)]),
            IndexModel([("event_type", ASCENDING)]),
            IndexModel([("timestamp", DESCENDING)]),
            IndexModel([("date", DESCENDING)]),
        ]
        await database.db.analytics.create_indexes(analytics_indexes)
        
        # Gamification collection indexes
        gamification_indexes = [
            IndexModel([("user_id", ASCENDING)], unique=True),
            IndexModel([("level", DESCENDING)]),
            IndexModel([("points", DESCENDING)]),
        ]
        await database.db.gamification.create_indexes(gamification_indexes)
        
        logger.info("📊 Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"❌ Error creating database indexes: {str(e)}")

async def init_sample_data():
    """Initialize sample data for development"""
    try:
        from services.sample_data import create_sample_data
        await create_sample_data()
        logger.info("📝 Sample data initialized")
    except Exception as e:
        logger.error(f"❌ Error initializing sample data: {str(e)}")

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return {
        "error": True,
        "status_code": exc.status_code,
        "message": exc.detail,
        "timestamp": datetime.utcnow()
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled Exception: {str(exc)}")
    return {
        "error": True,
        "status_code": 500,
        "message": "Internal server error",
        "timestamp": datetime.utcnow()
    }

# Middleware for request logging
@app.middleware("http")
async def log_requests(request, call_next):
    """Log all incoming requests"""
    start_time = datetime.utcnow()
    
    # Process request
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.utcnow() - start_time).total_seconds()
    
    # Log request details
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Time: {process_time:.3f}s"
    )
    
    # Add timing header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

if __name__ == "__main__":
    """Run the application"""
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
        access_log=True
    )