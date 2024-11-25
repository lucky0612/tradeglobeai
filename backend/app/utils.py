import hashlib
import json
from typing import Any, Dict
import aiohttp
from datetime import datetime

class Utils:
    @staticmethod
    def generate_hash(data: Any) -> str:
        return hashlib.sha256(
            json.dumps(data, sort_keys=True).encode()
        ).hexdigest()
    
    @staticmethod
    async def make_api_request(
        url: str,
        method: str = "GET",
        headers: Optional[Dict] = None,
        data: Optional[Dict] = None,
        timeout: int = 30
    ) -> Dict:
        async with aiohttp.ClientSession() as session:
            async with session.request(
                method,
                url,
                headers=headers,
                json=data,
                timeout=timeout
            ) as response:
                return await response.json()
    
    @staticmethod
    def format_currency(amount: float, currency: str = "INR") -> str:
        if currency == "INR":
            return f"₹{amount:,.2f}"
        return f"{amount:,.2f} {currency}"
    
    @staticmethod
    def validate_document(document: Dict, schema: Dict) -> bool:
        # Basic schema validation
        try:
            for field, field_type in schema.items():
                if field in document:
                    if not isinstance(document[field], field_type):
                        return False
                else:
                    return False
            return True
        except Exception:
            return False
