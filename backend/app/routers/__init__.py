from .auth import router as auth_router
from .documents import router as documents_router
from .drawback import router as drawback_router
from .rodtep import router as rodtep_router
from .analytics import router as analytics_router

routers = [
    auth_router,
    documents_router,
    drawback_router,
    rodtep_router,
    analytics_router
]

