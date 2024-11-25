from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Callable, Set
from ..config import settings
import re

class CORSMiddlewareConfig:
    def __init__(
        self,
        allow_origins: List[str] = None,
        allow_methods: List[str] = None,
        allow_headers: List[str] = None,
        allow_credentials: bool = True,
        expose_headers: List[str] = None,
        max_age: int = 600,
        allow_origin_regex: Optional[str] = None
    ):
        self.allow_origins = allow_origins or ["*"]
        self.allow_methods = allow_methods or ["*"]
        self.allow_headers = allow_headers or ["*"] 
        self.allow_credentials = allow_credentials
        self.expose_headers = expose_headers or []
        self.max_age = max_age
        self._allow_origin_regex = allow_origin_regex
        self._origins_regex = re.compile(allow_origin_regex) if allow_origin_regex else None
        self._origins: Set[str] = set(allow_origins) if allow_origins else set()

    def is_origin_allowed(self, origin: str) -> bool:
        if "*" in self._origins:
            return True
        if origin in self._origins:
            return True
        if self._origins_regex and self._origins_regex.match(origin):
            return True
        return False

class CORSMiddleware:
    def __init__(
        self,
        app: FastAPI,
        config: Optional[CORSMiddlewareConfig] = None
    ):
        self.app = app
        self.config = config or CORSMiddlewareConfig()

    async def __call__(self, request: Request, call_next: Callable) -> Response:
        # Handle preflight requests
        if request.method == "OPTIONS":
            return self._handle_preflight(request)

        # Handle actual request
        response = await call_next(request)
        return self._process_response(request, response)

    def _handle_preflight(self, request: Request) -> Response:
        response = Response()
        origin = request.headers.get("Origin")

        if not origin or not self.config.is_origin_allowed(origin):
            return response

        requested_method = request.headers.get("Access-Control-Request-Method")
        requested_headers = request.headers.get("Access-Control-Request-Headers")

        # Set CORS headers for preflight
        response.headers["Access-Control-Allow-Origin"] = origin
        if self.config.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        if requested_method:
            allowed_methods = self.config.allow_methods
            if "*" in allowed_methods:
                response.headers["Access-Control-Allow-Methods"] = requested_method
            else:
                response.headers["Access-Control-Allow-Methods"] = ", ".join(allowed_methods)

        if requested_headers:
            allowed_headers = self.config.allow_headers
            if "*" in allowed_headers:
                response.headers["Access-Control-Allow-Headers"] = requested_headers
            else:
                response.headers["Access-Control-Allow-Headers"] = ", ".join(allowed_headers)

        if self.config.expose_headers:
            response.headers["Access-Control-Expose-Headers"] = ", ".join(self.config.expose_headers)

        if self.config.max_age:
            response.headers["Access-Control-Max-Age"] = str(self.config.max_age)

        return response

    def _process_response(self, request: Request, response: Response) -> Response:
        origin = request.headers.get("Origin")
        
        if not origin or not self.config.is_origin_allowed(origin):
            return response

        # Set CORS headers for actual response
        response.headers["Access-Control-Allow-Origin"] = origin
        if self.config.allow_credentials:
            response.headers["Access-Control-Allow-Credentials"] = "true"
        
        if self.config.expose_headers:
            response.headers["Access-Control-Expose-Headers"] = ", ".join(self.config.expose_headers)

        return response

def setup_cors(app: FastAPI):
    """Helper function to set up CORS with default settings"""
    config = CORSMiddlewareConfig(
        allow_origins=settings.CORS_ORIGINS,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=[
            "Content-Type",
            "Authorization", 
            "Accept",
            "Origin",
            "X-Requested-With",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers",
            "X-CSRF-Token"
        ],
        expose_headers=[
            "Content-Length",
            "Content-Range",
            "X-Total-Count"
        ],
        allow_credentials=True,
        max_age=3600,
        allow_origin_regex=settings.CORS_ORIGIN_REGEX
    )

    app.add_middleware(
        CORSMiddleware,
        config=config
    )

def get_cors_policy(
    allowed_origins: List[str] = None,
    allowed_methods: List[str] = None,
    allowed_headers: List[str] = None
) -> CORSMiddlewareConfig:
    """Get custom CORS policy configuration"""
    return CORSMiddlewareConfig(
        allow_origins=allowed_origins or settings.CORS_ORIGINS,
        allow_methods=allowed_methods or settings.CORS_ALLOW_METHODS,
        allow_headers=allowed_headers or settings.CORS_ALLOW_HEADERS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        expose_headers=settings.CORS_EXPOSE_HEADERS,
        max_age=settings.CORS_MAX_AGE,
        allow_origin_regex=settings.CORS_ORIGIN_REGEX
    )

# Usage in dependencies
async def verify_cors_origin(request: Request):
    """Dependency to verify CORS origin in protected routes"""
    origin = request.headers.get("Origin")
    if not origin:
        return True
        
    config = get_cors_policy()
    if not config.is_origin_allowed(origin):
        raise HTTPException(
            status_code=403,
            detail="Origin not allowed"
        )
    return True