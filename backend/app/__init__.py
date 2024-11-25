from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import routers
from .middleware.cors import setup_cors
from .middleware.auth import AuthMiddleware
from .middleware.logging import LoggingMiddleware
from .middleware.error_handler import ErrorHandlerMiddleware
from .middleware.rate_limiter import RateLimiterMiddleware
from .services.scheduler_service import SchedulerService

def create_app():
    app = FastAPI(
        title=settings.APP_NAME,
        description="TradeGlobe.AI - Cross-Border Trade Intelligence Platform",
        version="1.0.0",
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
    )

    # Setup CORS
    setup_cors(app)

    # Add middlewares
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(AuthMiddleware)
    app.add_middleware(RateLimiterMiddleware)

    # Include routers
    for router in routers:
        app.include_router(router)

    # Startup and shutdown events
    @app.on_event("startup")
    async def startup_event():
        # Initialize scheduler
        scheduler = SchedulerService()
        await scheduler.start()

    @app.on_event("shutdown")
    async def shutdown_event():
        # Cleanup tasks
        pass

    return app
