from fastapi import APIRouter, HTTPException
from ..services.monitoring_service import MonitoringService

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

@router.get("/alerts")
async def get_active_alerts():
    try:
        service = MonitoringService()
        alerts = await service.get_active_alerts()
        return alerts
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/system-health")
async def get_system_health():
    try:
        service = MonitoringService()
        health_status = await service.check_system_health()
        return health_status
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/performance-metrics")
async def get_performance_metrics():
    try:
        service = MonitoringService()
        metrics = await service.get_performance_metrics()
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))