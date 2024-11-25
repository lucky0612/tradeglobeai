# backend/app/services/regulatory_service.py
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import aiohttp
import asyncio
from bs4 import BeautifulSoup
from ..config import settings
from ..database import Database
from .notification_service import NotificationService
from .cache_service import CacheService
from ..exceptions import RegulatoryServiceError

class RegulatoryService:
    def __init__(self):
        self.db = Database()
        self.cache = CacheService()
        self.notification_service = NotificationService()
        self.sources = {
            "dgft": {
                "url": "https://www.dgft.gov.in/CP/",
                "type": "html",
                "parser": self._parse_dgft_updates
            },
            "cbic": {
                "url": "https://www.cbic.gov.in/htdocs-cbec/customs/cs-circulars/cs-circulars-2024",
                "type": "html",
                "parser": self._parse_cbic_updates
            },
            "rbi": {
                "url": "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
                "type": "html",
                "parser": self._parse_rbi_updates
            }
        }

    async def fetch_regulatory_updates(self) -> List[Dict]:
        """Fetch updates from all regulatory sources"""
        try:
            # Check cache first
            cached_updates = await self.cache.get("regulatory_updates")
            if cached_updates:
                return cached_updates

            tasks = []
            for source, config in self.sources.items():
                tasks.append(self._fetch_source_updates(source, config))
            
            updates = await asyncio.gather(*tasks)
            combined_updates = []
            for update_list in updates:
                combined_updates.extend(update_list)

            # Sort by date
            combined_updates.sort(key=lambda x: x["published_date"], reverse=True)
            
            # Cache results
            await self.cache.set("regulatory_updates", combined_updates, 3600)  # 1 hour cache
            
            return combined_updates
            
        except Exception as e:
            raise RegulatoryServiceError(
                message="Failed to fetch regulatory updates",
                error_code="FETCH_UPDATES_ERROR",
                details={"error": str(e)}
            )

    async def _fetch_source_updates(self, source: str, config: Dict) -> List[Dict]:
        """Fetch updates from a specific source"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(config["url"]) as response:
                    if response.status == 200:
                        content = await response.text()
                        updates = await config["parser"](content)
                        
                        # Add source information
                        for update in updates:
                            update["source"] = source
                            
                        return updates
                    else:
                        raise RegulatoryServiceError(f"Failed to fetch from {source}")
        except Exception as e:
            print(f"Error fetching from {source}: {str(e)}")
            return []

    async def _parse_dgft_updates(self, content: str) -> List[Dict]:
        """Parse DGFT updates"""
        updates = []
        soup = BeautifulSoup(content, 'html.parser')
        
        for notification in soup.find_all('div', class_='notification-item'):
            try:
                update = {
                    "title": notification.find('h3').text.strip(),
                    "content": notification.find('p').text.strip(),
                    "published_date": self._parse_date(notification.find('span', class_='date').text),
                    "type": "dgft",
                    "url": notification.find('a')['href'],
                    "category": self._categorize_update(notification.find('h3').text)
                }
                updates.append(update)
            except Exception as e:
                print(f"Error parsing DGFT notification: {str(e)}")
                continue
                
        return updates

    async def _parse_cbic_updates(self, content: str) -> List[Dict]:
        """Parse CBIC updates"""
        updates = []
        soup = BeautifulSoup(content, 'html.parser')
        
        for circular in soup.find_all('tr', class_='circular-row'):
            try:
                update = {
                    "title": circular.find('td', class_='title').text.strip(),
                    "content": circular.find('td', class_='description').text.strip(),
                    "published_date": self._parse_date(circular.find('td', class_='date').text),
                    "type": "cbic",
                    "url": circular.find('a')['href'],
                    "category": self._categorize_update(circular.find('td', class_='title').text)
                }
                updates.append(update)
            except Exception as e:
                print(f"Error parsing CBIC circular: {str(e)}")
                continue
                
        return updates

    async def _parse_rbi_updates(self, content: str) -> List[Dict]:
        """Parse RBI updates"""
        updates = []
        soup = BeautifulSoup(content, 'html.parser')
        
        for notification in soup.find_all('div', class_='notification'):
            try:
                update = {
                    "title": notification.find('h2').text.strip(),
                    "content": notification.find('div', class_='content').text.strip(),
                    "published_date": self._parse_date(notification.find('span', class_='date').text),
                    "type": "rbi",
                    "url": notification.find('a')['href'],
                    "category": self._categorize_update(notification.find('h2').text)
                }
                updates.append(update)
            except Exception as e:
                print(f"Error parsing RBI notification: {str(e)}")
                continue
                
        return updates

    def _categorize_update(self, title: str) -> str:
        """Categorize update based on title"""
        title_lower = title.lower()
        
        categories = {
            "export": ["export", "exim", "foreign trade", "meis", "rodtep"],
            "import": ["import", "customs", "duty"],
            "compliance": ["compliance", "regulation", "mandatory"],
            "tax": ["tax", "gst", "duty", "drawback"],
            "finance": ["finance", "banking", "forex", "currency"],
            "shipping": ["shipping", "logistics", "transport"],
            "general": ["general", "miscellaneous", "other"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in title_lower for keyword in keywords):
                return category
                
        return "general"

    async def get_applicable_regulations(self, export_details: Dict) -> List[Dict]:
        """Get regulations applicable to specific export"""
        try:
            # Get all recent updates
            updates = await self.fetch_regulatory_updates()
            
            # Filter applicable updates
            applicable = []
            for update in updates:
                if self._is_applicable(update, export_details):
                    applicable.append(update)
            
            return applicable
            
        except Exception as e:
            raise RegulatoryServiceError(
                message="Failed to get applicable regulations",
                error_code="GET_REGULATIONS_ERROR",
                details={"error": str(e)}
            )

    def _is_applicable(self, update: Dict, export_details: Dict) -> bool:
        """Check if update is applicable to export"""
        # Check HS Code
        if "hs_code" in export_details:
            if not self._check_hs_code_applicability(update, export_details["hs_code"]):
                return False
                
        # Check country
        if "country" in export_details:
            if not self._check_country_applicability(update, export_details["country"]):
                return False
                
        # Check scheme
        if "scheme" in export_details:
            if not self._check_scheme_applicability(update, export_details["scheme"]):
                return False
                
        return True

    async def get_compliance_requirements(self, 
                                       product_category: str, 
                                       destination: str) -> Dict:
        """Get compliance requirements for product and destination"""
        try:
            cache_key = f"compliance_{product_category}_{destination}"
            cached_data = await self.cache.get(cache_key)
            if cached_data:
                return cached_data

            requirements = {
                "mandatory": await self._get_mandatory_requirements(product_category, destination),
                "optional": await self._get_optional_requirements(product_category, destination),
                "prohibited": await self._get_prohibited_items(product_category, destination),
                "documentation": await self._get_required_documents(product_category, destination)
            }
            
            await self.cache.set(cache_key, requirements, 86400)  # 24 hour cache
            return requirements
            
        except Exception as e:
            raise RegulatoryServiceError(
                message="Failed to get compliance requirements",
                error_code="GET_COMPLIANCE_ERROR",
                details={"error": str(e)}
            )

    async def monitor_updates(self):
        """Monitor for new regulatory updates"""
        try:
            # Get last check time
            last_check = await self.db.redis.get("last_regulatory_check")
            if last_check:
                last_check = datetime.fromisoformat(last_check)
            else:
                last_check = datetime.utcnow() - timedelta(days=1)

            # Fetch current updates
            current_updates = await self.fetch_regulatory_updates()
            
            # Filter new updates
            new_updates = [
                update for update in current_updates
                if datetime.fromisoformat(update["published_date"]) > last_check
            ]
            
            if new_updates:
                # Store new updates
                await self.db.regulatory_updates.insert_many(new_updates)
                
                # Notify affected users
                await self._notify_affected_users(new_updates)
            
            # Update last check time
            await self.db.redis.set(
                "last_regulatory_check",
                datetime.utcnow().isoformat()
            )
            
        except Exception as e:
            raise RegulatoryServiceError(
                message="Failed to monitor updates",
                error_code="MONITOR_UPDATES_ERROR",
                details={"error": str(e)}
            )

    async def _notify_affected_users(self, updates: List[Dict]):
        """Notify users affected by updates"""
        for update in updates:
            # Find affected users
            affected_users = await self._get_affected_users(update)
            
            # Send notifications
            for user in affected_users:
                await self.notification_service.send_notification(
                    user["_id"],
                    {
                        "type": "regulatory_update",
                        "title": update["title"],
                        "content": update["content"],
                        "severity": "high" if update["category"] in ["compliance", "mandatory"] else "medium",
                        "url": update["url"]
                    }
                )

    async def _get_affected_users(self, update: Dict) -> List[Dict]:
        """Get users affected by an update"""
        query = {
            "$or": [
                {"preferences.notification_categories": update["category"]},
                {"export_products.hs_code": {"$in": self._extract_hs_codes(update)}},
                {"export_destinations": {"$in": self._extract_countries(update)}}
            ]
        }
        
        users = await self.db.users.find(query).to_list(None)
        return users

    def _extract_hs_codes(self, update: Dict) -> List[str]:
        """Extract HS codes from update content"""
        # Implement HS code extraction logic
        pass

    def _extract_countries(self, update: Dict) -> List[str]:
        """Extract country names from update content"""
        # Implement country extraction logic
        pass

    def _parse_date(self, date_str: str) -> str:
        """Parse date string to ISO format"""
        try:
            # Add date parsing logic based on source format
            pass
        except:
            return datetime.utcnow().isoformat()