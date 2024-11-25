from fastapi import Request
from datetime import datetime
from ..services.logger import Logger

logger = Logger("api")

class LoggingMiddleware:
    async def __call__(self, request: Request, call_next):
        # Log request
        await logger.log_event(
            "request",
            f"Incoming {request.method} request to {request.url.path}",
            details={
                "method": request.method,
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "client_host": request.client.host,
                "user_agent": request.headers.get("user-agent"),
            }
        )

        start_time = datetime.utcnow()
        
        try:
            response = await call_next(request)
            
            # Log response
            process_time = (datetime.utcnow() - start_time).total_seconds()
            await logger.log_event(
                "response",
                f"Response sent for {request.method} {request.url.path}",
                details={
                    "status_code": response.status_code,
                    "process_time": process_time
                }
            )
            
            return response
            
        except Exception as e:
            # Log error
            await logger.log_event(
                "error",
                str(e),
                severity="ERROR",
                details={
                    "method": request.method,
                    "path": request.url.path,
                    "error": str(e)
                }
            )
            raise
