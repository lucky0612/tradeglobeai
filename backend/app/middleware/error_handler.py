from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from ..exceptions import TradeGlobeException
from ..services.logger import Logger

logger = Logger("error_handler")

class ErrorHandlerMiddleware:
    async def __call__(self, request: Request, call_next):
        try:
            return await call_next(request)
            
        except TradeGlobeException as e:
            await logger.log_event(
                "error",
                str(e),
                severity="ERROR",
                details={
                    "error_code": e.error_code,
                    "details": e.details,
                    "path": request.url.path
                }
            )
            return JSONResponse(
                status_code=400,
                content={
                    "error": str(e),
                    "error_code": e.error_code,
                    "details": e.details
                }
            )
            
        except HTTPException as e:
            await logger.log_event(
                "error",
                str(e.detail),
                severity="ERROR",
                details={
                    "status_code": e.status_code,
                    "path": request.url.path
                }
            )
            return JSONResponse(
                status_code=e.status_code,
                content={"error": str(e.detail)}
            )
            
        except Exception as e:
            await logger.log_event(
                "error",
                str(e),
                severity="CRITICAL",
                details={
                    "path": request.url.path,
                    "error_type": type(e).__name__
                }
            )
            return JSONResponse(
                status_code=500,
                content={"error": "Internal server error"}
            )