import aiohttp
import asyncio
from typing import Dict, List, Optional
from datetime import datetime
from ..config import settings
from ..database import Database
from ..exceptions import APIIntegrationError

class IntegrationService:
    def __init__(self):
        self.db = Database()
        
    async def fetch_exchange_rates(self) -> Dict:
        """Fetch current exchange rates"""
        try:
            async with aiohttp.ClientSession() as session:
                url = f"https://openexchangerates.org/api/latest.json?app_id={settings.EXCHANGE_RATE_API_KEY}"
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        # Store in cache
                        await self.db.redis.setex(
                            "exchange_rates",
                            3600,  # 1 hour cache
                            json.dumps(data)
                        )
                        return data
                    else:
                        raise APIIntegrationError("Failed to fetch exchange rates")
        except Exception as e:
            raise APIIntegrationError(f"Exchange rate API error: {str(e)}")

    async def fetch_dgft_data(self, iec_number: str) -> Dict:
        """Fetch data from DGFT portal"""
        try:
            headers = {
                "Authorization": f"Bearer {settings.DGFT_API_KEY}",
                "Content-Type": "application/json"
            }
            async with aiohttp.ClientSession() as session:
                url = f"{settings.DGFT_BASE_URL}/iec/{iec_number}"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise APIIntegrationError("Failed to fetch DGFT data")
        except Exception as e:
            raise APIIntegrationError(f"DGFT API error: {str(e)}")

    async def fetch_customs_data(self, shipping_bill_number: str) -> Dict:
        """Fetch data from Customs portal"""
        try:
            headers = {
                "Authorization": f"Bearer {settings.CUSTOMS_API_KEY}",
                "Content-Type": "application/json"
            }
            async with aiohttp.ClientSession() as session:
                url = f"{settings.CUSTOMS_BASE_URL}/shipping-bill/{shipping_bill_number}"
                async with session.get(url, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise APIIntegrationError("Failed to fetch Customs data")
        except Exception as e:
            raise APIIntegrationError(f"Customs API error: {str(e)}")

    async def verify_iec(self, iec_number: str) -> bool:
        """Verify IEC number validity"""
        try:
            dgft_data = await self.fetch_dgft_data(iec_number)
            return dgft_data.get("status") == "active"
        except:
            return False

    async def verify_shipping_bill(self, shipping_bill_number: str) -> Dict:
        """Verify shipping bill details"""
        try:
            customs_data = await self.fetch_customs_data(shipping_bill_number)
            return {
                "valid": True,
                "details": customs_data
            }
        except:
            return {
                "valid": False,
                "details": None
            }

    async def submit_drawback_claim(self, claim_data: Dict) -> Dict:
        """Submit drawback claim to ICEGATE"""
        try:
            headers = {
                "Authorization": f"Bearer {settings.ICEGATE_API_KEY}",
                "Content-Type": "application/json"
            }
            async with aiohttp.ClientSession() as session:
                url = f"{settings.ICEGATE_BASE_URL}/drawback/submit"
                async with session.post(url, json=claim_data, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise APIIntegrationError("Failed to submit drawback claim")
        except Exception as e:
            raise APIIntegrationError(f"ICEGATE API error: {str(e)}")

    async def submit_rodtep_claim(self, claim_data: Dict) -> Dict:
        """Submit RoDTEP claim"""
        try:
            headers = {
                "Authorization": f"Bearer {settings.RODTEP_API_KEY}",
                "Content-Type": "application/json"
            }
            async with aiohttp.ClientSession() as session:
                url = f"{settings.RODTEP_BASE_URL}/claims/submit"
                async with session.post(url, json=claim_data, headers=headers) as response:
                    if response.status == 200:
                        return await response.json()
                    else:
                        raise APIIntegrationError("Failed to submit RoDTEP claim")
        except Exception as e:
            raise APIIntegrationError(f"RoDTEP API error: {str(e)}")

    async def fetch_trade_statistics(self, params: Dict) -> Dict:
        """Fetch trade statistics from government portals"""
        try:
            # Fetch data from multiple sources in parallel
            tasks = [
                self.fetch_dgft_statistics(params),
                self.fetch_customs_statistics(params),
                self.fetch_rbi_statistics(params)
            ]
            results = await asyncio.gather(*tasks)
            
            # Combine and process statistics
            combined_stats = self._process_trade_statistics(results)
            
            return combined_stats
        except Exception as e:
            raise APIIntegrationError(f"Failed to fetch trade statistics: {str(e)}")

    async def monitor_regulatory_updates(self) -> List[Dict]:
        """Monitor and fetch regulatory updates"""
        try:
            # Fetch updates from multiple sources
            updates = []
            
            # DGFT Updates
            dgft_updates = await self._fetch_dgft_updates()
            updates.extend(dgft_updates)
            
            # CBIC Updates
            cbic_updates = await self._fetch_cbic_updates()
            updates.extend(cbic_updates)
            
            # RBI Updates
            rbi_updates = await self._fetch_rbi_updates()
            updates.extend(rbi_updates)
            
            # Store updates in database
            await self._store_regulatory_updates(updates)
            
            return updates
        except Exception as e:
            raise APIIntegrationError(f"Failed to fetch regulatory updates: {str(e)}")
