import logging
from elasticsearch import Elasticsearch
from datetime import datetime
from .config import settings

class Logger:
    def __init__(self, service_name: str):
        self.service_name = service_name
        self.es = Elasticsearch([settings.ELASTICSEARCH_URL])
        
        # Setup basic logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(service_name)
        
    async def log_event(
        self,
        event_type: str,
        message: str,
        severity: str = "INFO",
        details: Optional[Dict] = None
    ):
        log_entry = {
            "timestamp": datetime.utcnow(),
            "service": self.service_name,
            "event_type": event_type,
            "message": message,
            "severity": severity,
            "details": details or {}
        }
        
        # Log to Elasticsearch
        try:
            await self.es.index(
                index=f"logs-{self.service_name}-{datetime.utcnow().strftime('%Y%m')}",
                document=log_entry
            )
        except Exception as e:
            self.logger.error(f"Failed to log to Elasticsearch: {str(e)}")
        
        # Also log to standard logging
        log_method = getattr(self.logger, severity.lower(), self.logger.info)
        log_method(f"{event_type}: {message}")