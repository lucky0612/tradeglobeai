from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.mongodb import MongoDBJobStore
from apscheduler.executors.pool import ThreadPoolExecutor, ProcessPoolExecutor
from datetime import datetime, timedelta
from ..config import settings
from ..database import Database
from .integration_service import IntegrationService
from .notification_service import NotificationService
from .email_service import EmailService

class SchedulerService:
    def __init__(self):
        self.db = Database()
        self.integration_service = IntegrationService()
        self.notification_service = NotificationService()
        self.email_service = EmailService()
        
        # Configure job stores and executors
        jobstores = {
            'default': MongoDBJobStore(database=self.db.mongodb)
        }
        executors = {
            'default': ThreadPoolExecutor(20),
            'processpool': ProcessPoolExecutor(5)
        }
        job_defaults = {
            'coalesce': False,
            'max_instances': 3
        }

        # Initialize scheduler
        self.scheduler = AsyncIOScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults=job_defaults,
            timezone='UTC'
        )

    async def start(self):
        """Start the scheduler and add scheduled jobs"""
        # Schedule exchange rate updates
        self.scheduler.add_job(
            self.update_exchange_rates,
            'interval',
            hours=1,
            id='exchange_rates_update'
        )

        # Schedule regulatory updates monitoring
        self.scheduler.add_job(
            self.monitor_regulatory_updates,
            'interval',
            hours=6,
            id='regulatory_updates_monitor'
        )

        # Schedule claim status checks
        self.scheduler.add_job(
            self.check_claim_statuses,
            'interval',
            minutes=30,
            id='claim_status_check'
        )

        # Schedule document cleanup
        self.scheduler.add_job(
            self.cleanup_old_documents,
            'cron',
            day='*',
            hour=0,
            minute=0,
            id='document_cleanup'
        )

        # Schedule analytics update
        self.scheduler.add_job(
            self.update_analytics,
            'cron',
            hour='*/4',
            id='analytics_update'
        )

        # Start the scheduler
        self.scheduler.start()

    async def update_exchange_rates(self):
        """Update exchange rates from external API"""
        try:
            rates = await self.integration_service.fetch_exchange_rates()
            # Store in cache
            await self.db.redis.setex(
                "exchange_rates",
                3600,  # 1 hour cache
                rates
            )
        except Exception as e:
            print(f"Failed to update exchange rates: {str(e)}")

    async def monitor_regulatory_updates(self):
        """Monitor and process regulatory updates"""
        try:
            updates = await self.integration_service.monitor_regulatory_updates()
            
            # Process each update
            for update in updates:
                # Store update
                await self.db.regulatory_updates.insert_one(update)
                
                # Notify affected users
                affected_users = await self._get_affected_users(update)
                for user in affected_users:
                    # Send notification
                    await self.notification_service.send_notification(
                        user["_id"],
                        {
                            "type": "regulatory_update",
                            "content": update["title"],
                            "severity": update["severity"],
                            "timestamp": datetime.utcnow().isoformat()
                        }
                    )
                    
                    # Send email
                    await self.email_service.send_email(
                        user["email"],
                        f"New Regulatory Update: {update['title']}",
                        self._generate_regulatory_update_email(update)
                    )
        except Exception as e:
            print(f"Failed to monitor regulatory updates: {str(e)}")

    async def check_claim_statuses(self):
        """Check and update claim statuses"""
        try:
            # Check drawback claims
            drawback_claims = await self.db.drawback_claims.find({
                "status": {"$in": ["pending", "processing"]}
            }).to_list(None)
            
            for claim in drawback_claims:
                updated_status = await self.integration_service.check_drawback_status(claim["_id"])
                if updated_status != claim["status"]:
                    # Update status
                    await self.db.drawback_claims.update_one(
                        {"_id": claim["_id"]},
                        {"$set": {"status": updated_status}}
                    )
                    
                    # Notify user
                    await self.notification_service.send_claim_status_notification(
                        claim["user_id"],
                        claim["_id"],
                        updated_status,
                        "Drawback"
                    )

            # Check RoDTEP claims
            rodtep_claims = await self.db.rodtep_claims.find({
                "status": {"$in": ["pending", "processing"]}
            }).to_list(None)
            
            for claim in rodtep_claims:
                updated_status = await self.integration_service.check_rodtep_status(claim["_id"])
                if updated_status != claim["status"]:
                    # Update status
                    await self.db.rodtep_claims.update_one(
                        {"_id": claim["_id"]},
                        {"$set": {"status": updated_status}}
                    )
                    
                    # Notify user
                    await self.notification_service.send_claim_status_notification(
                        claim["user_id"],
                        claim["_id"],
                        updated_status,
                        "RoDTEP"
                    )
        except Exception as e:
            print(f"Failed to check claim statuses: {str(e)}")

    async def cleanup_old_documents(self):
        """Clean up old temporary documents"""
        try:
            cutoff_date = datetime.utcnow() - timedelta(days=settings.DOCUMENT_RETENTION_DAYS)
            
            # Delete old temporary documents
            result = await self.db.documents.delete_many({
                "temporary": True,
                "created_at": {"$lt": cutoff_date}
            })
            
            print(f"Cleaned up {result.deleted_count} old documents")
        except Exception as e:
            print(f"Failed to cleanup old documents: {str(e)}")

    async def update_analytics(self):
        """Update analytics data"""
        try:
            # Update processing metrics
            processing_metrics = await self._calculate_processing_metrics()
            await self.db.analytics.update_one(
                {"type": "processing_metrics"},
                {"$set": {"data": processing_metrics}},
                upsert=True
            )

            # Update financial metrics
            financial_metrics = await self._calculate_financial_metrics()
            await self.db.analytics.update_one(
                {"type": "financial_metrics"},
                {"$set": {"data": financial_metrics}},
                upsert=True
            )

            # Update compliance metrics
            compliance_metrics = await self._calculate_compliance_metrics()
            await self.db.analytics.update_one(
                {"type": "compliance_metrics"},
                {"$set": {"data": compliance_metrics}},
                upsert=True
            )
        except Exception as e:
            print(f"Failed to update analytics: {str(e)}")

    async def _get_affected_users(self, update):
        """Get users affected by a regulatory update"""
        # Implement logic to determine affected users based on update content
        pass

    def _generate_regulatory_update_email(self, update):
        """Generate HTML email content for regulatory update"""
        return f"""
        <h2>{update['title']}</h2>
        <p><strong>Severity:</strong> {update['severity']}</p>
        <p><strong>Effective Date:</strong> {update['effective_date']}</p>
        <div>{update['content']}</div>
        <p>
            <a href="{settings.FRONTEND_URL}/regulatory-updates/{update['_id']}" 
               style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
               View Details
            </a>
        </p>
        """

    async def _calculate_processing_metrics(self):
        """Calculate document processing metrics"""
        # Implement processing metrics calculation
        pass

    async def _calculate_financial_metrics(self):
        """Calculate financial metrics"""
        # Implement financial metrics calculation
        pass

    async def _calculate_compliance_metrics(self):
        """Calculate compliance metrics"""
        # Implement compliance metrics calculation
        pass

