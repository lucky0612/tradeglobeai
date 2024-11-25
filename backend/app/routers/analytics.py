from fastapi import APIRouter, HTTPException
from typing import Optional
from datetime import datetime, timedelta
from ..services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/dashboard")
async def get_dashboard_analytics(timeframe: str = "1d"):
    try:
        service = AnalyticsService()
        analytics = await service.generate_dashboard_analytics(timeframe)
        return analytics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/processing-metrics")
async def get_processing_metrics(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    try:
        service = AnalyticsService()
        if not start_date:
            start_date = datetime.utcnow() - timedelta(days=7)
        if not end_date:
            end_date = datetime.utcnow()
            
        metrics = await service.get_processing_metrics(start_date, end_date)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/compliance-metrics")
async def get_compliance_metrics(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    try:
        service = AnalyticsService()
        metrics = await service.get_compliance_metrics(start_date, end_date)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/financial-metrics")
async def get_financial_metrics(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None):
    try:
        service = AnalyticsService()
        metrics = await service.get_financial_metrics(start_date, end_date)
        return metrics
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
