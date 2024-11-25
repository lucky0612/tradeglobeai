from datetime import datetime, timedelta
from typing import Dict, List, Optional
import pandas as pd
import numpy as np
from ..models import ProcessingStatus
from ..exceptions import AnalyticsError

class AnalyticsService:
    def __init__(self):
        self.db = Database()
        self.logger = Logger("analytics_service")
        
    async def generate_dashboard_analytics(self, timeframe: str = "1d") -> Dict:
        """Generate comprehensive dashboard analytics"""
        try:
            # Get time range
            end_time = datetime.utcnow()
            if timeframe == "1d":
                start_time = end_time - timedelta(days=1)
            elif timeframe == "1w":
                start_time = end_time - timedelta(weeks=1)
            elif timeframe == "1m":
                start_time = end_time - timedelta(days=30)
            else:
                raise ValueError("Invalid timeframe")

            # Gather metrics
            processing_metrics = await self._get_processing_metrics(start_time, end_time)
            financial_metrics = await self._get_financial_metrics(start_time, end_time)
            compliance_metrics = await self._get_compliance_metrics(start_time, end_time)
            
            # Generate insights
            insights = await self._generate_insights({
                "processing": processing_metrics,
                "financial": financial_metrics,
                "compliance": compliance_metrics
            })
            
            return {
                "timeframe": timeframe,
                "generated_at": end_time,
                "metrics": {
                    "processing": processing_metrics,
                    "financial": financial_metrics,
                    "compliance": compliance_metrics
                },
                "insights": insights,
                "trends": await self._get_trends(start_time, end_time)
            }
            
        except Exception as e:
            raise AnalyticsError(
                message="Failed to generate analytics",
                error_code="ANALYTICS_ERROR",
                details={"error": str(e)}
            )

    async def _get_processing_metrics(self, start_time: datetime, end_time: datetime) -> Dict:
        """Calculate document processing metrics"""
        pipeline = [
            {
                "$match": {
                    "created_at": {
                        "$gte": start_time,
                        "$lte": end_time
                    }
                }
            },
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1},
                    "avg_processing_time": {
                        "$avg": {
                            "$subtract": ["$completed_at", "$created_at"]
                        }
                    }
                }
            }
        ]
        
        results = await self.db.documents.aggregate(pipeline)
        
        total_docs = sum(r["count"] for r in results)
        success_count = next((r["count"] for r in results if r["_id"] == "completed"), 0)
        
        return {
            "total_processed": total_docs,
            "success_rate": (success_count / total_docs * 100) if total_docs > 0 else 0,
            "average_processing_time": sum(r["avg_processing_time"] for r in results) / len(results) if results else 0,
            "by_status": {r["_id"]: r["count"] for r in results}
        }

    async def _get_financial_metrics(self, start_time: datetime, end_time: datetime) -> Dict:
        """Calculate financial metrics"""
        # Get drawback metrics
        drawback_metrics = await self._get_drawback_metrics(start_time, end_time)
        
        # Get RoDTEP metrics
        rodtep_metrics = await self._get_rodtep_metrics(start_time, end_time)
        
        # Calculate trends
        trends = await self._calculate_financial_trends(start_time, end_time)
        
        return {
            "drawback": drawback_metrics,
            "rodtep": rodtep_metrics,
            "trends": trends,
            "summary": {
                "total_benefits": drawback_metrics["total_amount"] + rodtep_metrics["total_amount"],
                "total_claims": drawback_metrics["total_claims"] + rodtep_metrics["total_claims"],
                "average_processing_time": (
                    drawback_metrics["avg_processing_time"] + rodtep_metrics["avg_processing_time"]
                ) / 2
            }
        }

    async def _get_trends(self, start_time: datetime, end_time: datetime) -> Dict:
        """Calculate various trends"""
        try:
            pipeline = [
                {
                    "$match": {
                        "created_at": {
                            "$gte": start_time,
                            "$lte": end_time
                        }
                    }
                },
                {
                    "$group": {
                        "_id": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$created_at"
                            }
                        },
                        "total_documents": {"$sum": 1},
                        "successful": {
                            "$sum": {
                                "$cond": [
                                    {"$eq": ["$status", "completed"]},
                                    1,
                                    0
                                ]
                            }
                        },
                        "total_value": {"$sum": "$total_amount"}
                    }
                },
                {"$sort": {"_id": 1}}
            ]

            results = await self.db.documents.aggregate(pipeline)
            
            # Process results into trends
            trends = {
                "dates": [],
                "document_volumes": [],
                "success_rates": [],
                "total_values": []
            }
            
            for result in results:
                trends["dates"].append(result["_id"])
                trends["document_volumes"].append(result["total_documents"])
                trends["success_rates"].append(
                    (result["successful"] / result["total_documents"]) * 100 
                    if result["total_documents"] > 0 else 0
                )
                trends["total_values"].append(result["total_value"])

            return trends
            
        except Exception as e:
            raise AnalyticsError(
                message="Failed to calculate trends",
                error_code="TREND_CALCULATION_ERROR",
                details={"error": str(e)}
            )

    async def _generate_insights(self, metrics: Dict) -> List[Dict]:
        """Generate insights from metrics using LLM"""
        try:
            response = await openai.chat.completions.acreate(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": """
                        Analyze trade metrics and generate actionable insights.
                        Focus on:
                        1. Performance trends
                        2. Compliance issues
                        3. Process optimization opportunities
                        4. Financial impact
                        """
                    },
                    {
                        "role": "user",
                        "content": json.dumps(metrics)
                    }
                ],
                tools=[{
                    "type": "function",
                    "function": {
                        "name": "generate_trade_insights",
                        "description": "Generate insights from trade metrics",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "insights": {
                                    "type": "array",
                                    "items": {
                                        "type": "object",
                                        "properties": {
                                            "category": {"type": "string"},
                                            "insight": {"type": "string"},
                                            "impact_level": {"type": "string"},
                                            "recommended_actions": {
                                                "type": "array",
                                                "items": {"type": "string"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }]
            )
            
            return self._process_insight_response(response)
            
        except Exception as e:
            raise AnalyticsError(
                message="Failed to generate insights",
                error_code="INSIGHT_GENERATION_ERROR",
                details={"error": str(e)}
            )