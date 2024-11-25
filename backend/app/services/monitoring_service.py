from datetime import datetime, timedelta
from typing import Dict, List, Optional
from ..exceptions import MonitoringError

class MonitoringService:
    def __init__(self):
        self.db = Database()
        self.logger = Logger("monitoring_service")
        self.alert_thresholds = {
            "processing_time": 300,  # seconds
            "error_rate": 0.05,      # 5%
            "compliance_score": 0.95, # 95%
            "backlog_limit": 100     # documents
        }
        
    async def monitor_system_health(self) -> Dict:
        """Monitor overall system health"""
        try:
            # Check various components
            database_health = await self._check_database_health()
            api_health = await self._check_api_health()
            processing_health = await self._check_processing_health()
            
            # Get current metrics
            current_metrics = await self._get_current_metrics()
            
            # Generate alerts if needed
            alerts = await self._generate_alerts(current_metrics)
            
            return {
                "status": "healthy" if all([
                    database_health["healthy"],
                    api_health["healthy"],
                    processing_health["healthy"]
                ]) else "unhealthy",
                "timestamp": datetime.utcnow(),
                "components": {
                    "database": database_health,
                    "api": api_health,
                    "processing": processing_health
                },
                "metrics": current_metrics,
                "alerts": alerts
            }
            
        except Exception as e:
            raise MonitoringError(
                message="Health check failed",
                error_code="HEALTH_CHECK_ERROR",
                details={"error": str(e)}
            )

    async def _check_database_health(self) -> Dict:
        """Check database connections and performance"""
        try:
            # Check MongoDB
            mongodb_status = await self.db.mongodb.command("serverStatus")
            
            # Check Elasticsearch
            es_status = await self.db.elasticsearch.cluster.health()
            
            # Check Redis
            redis_status = await self.db.redis.ping()
            
            return {
                "healthy": all([
                    mongodb_status["ok"] == 1,
                    es_status["status"] in ["green", "yellow"],
                    redis_status
                ]),
                "details": {
                    "mongodb": {
                        "status": "healthy" if mongodb_status["ok"] == 1 else "unhealthy",
                        "connections": mongodb_status["connections"]
                    },
                    "elasticsearch": {
                        "status": es_status["status"],
                        "nodes": es_status["number_of_nodes"]
                    },
                    "redis": {
                        "status": "healthy" if redis_status else "unhealthy"
                    }
                }
            }
            
        except Exception as e:
            return {
                "healthy": False,
                "error": str(e)
            }

    async def _check_processing_health(self) -> Dict:
        """Check document processing health"""
        try:
            # Get processing metrics for last hour
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(hours=1)
            
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
            
            # Calculate metrics
            total_docs = sum(r["count"] for r in results)
            error_count = next(
                (r["count"] for r in results if r["_id"] == "failed"),
                0
            )
            avg_processing_time = next(
                (r["avg_processing_time"] for r in results if r["_id"] == "completed"),
                0
            )
            
            # Check against thresholds
            error_rate = error_count / total_docs if total_docs > 0 else 0
            
            return {
                "healthy": all([
                    error_rate <= self.alert_thresholds["error_rate"],
                    avg_processing_time <= self.alert_thresholds["processing_time"]
                ]),
                "metrics": {
                    "total_documents": total_docs,
                    "error_rate": error_rate,
                    "avg_processing_time": avg_processing_time
                }
            }
            
        except Exception as e:
            return {
                "healthy": False,
                "error": str(e)
            }

    async def _generate_alerts(self, metrics: Dict) -> List[Dict]:
        """Generate alerts based on current metrics"""
        alerts = []
        
        # Check processing time
        if metrics["avg_processing_time"] > self.alert_thresholds["processing_time"]:
            alerts.append({
                "type": "processing_time",
                "severity": "high",
                "message": "Processing time exceeds threshold",
                "details": {
                    "current": metrics["avg_processing_time"],
                    "threshold": self.alert_thresholds["processing_time"]
                }
            })
            
        # Check error rate
        if metrics["error_rate"] > self.alert_thresholds["error_rate"]:
            alerts.append({
                "type": "error_rate",
                "severity": "critical",
                "message": "Error rate exceeds threshold",
                "details": {
                    "current": metrics["error_rate"],
                    "threshold": self.alert_thresholds["error_rate"]
                }
            })
            
        # Check document backlog
        if metrics["pending_documents"] > self.alert_thresholds["backlog_limit"]:
            alerts.append({
                "type": "backlog",
                "severity": "medium",
                "message": "Document processing backlog exceeds limit",
                "details": {
                    "current": metrics["pending_documents"],
                    "threshold": self.alert_thresholds["backlog_limit"]
                }
            })
            
        return alerts