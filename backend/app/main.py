from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Database
from .routers import auth, documents, drawback, rodtep, analytics

app = FastAPI(
    title=settings.APP_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection management
@app.on_event("startup")
async def startup_db_client():
    app.db = Database()
    await app.db.connect()

@app.on_event("shutdown")
async def shutdown_db_client():
    await app.db.close()

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(drawback.router, prefix=settings.API_V1_STR)
app.include_router(rodtep.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {"message": "Welcome to TradeGlobe.AI API"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow(),
        "version": "1.0.0"
    }