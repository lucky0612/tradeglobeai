from typing import Dict, Optional

class TradeGlobeException(Exception):
    def __init__(self, message: str, error_code: str, details: Optional[Dict] = None):
        self.message = message
        self.error_code = error_code
        self.details = details
        super().__init__(self.message)

class DocumentProcessingError(TradeGlobeException):
    pass

class ComplianceCheckError(TradeGlobeException):
    pass

class ValidationError(TradeGlobeException):
    pass

class APIIntegrationError(TradeGlobeException):
    pass