from datetime import datetime
from typing import List, Optional, Dict
from fastapi import WebSocket
import json
from ..models import User
from ..database import Database
from ..config import settings

class NotificationService:
    def __init__(self):
        self.db = Database()
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        self.active_connections.pop(user_id, None)

    async def send_notification(self, user_id: str, notification: Dict):
        """Send notification to specific user"""
        try:
            if user_id in self.active_connections:
                websocket = self.active_connections[user_id]
                await websocket.send_json(notification)
            
            # Store notification in database
            await self.db.notifications.insert_one({
                "user_id": user_id,
                "content": notification,
                "read": False,
                "created_at": datetime.utcnow()
            })
        except Exception as e:
            print(f"Error sending notification: {str(e)}")

    async def broadcast(self, message: Dict, exclude_user: Optional[str] = None):
        """Broadcast message to all connected users"""
        disconnected_users = []
        for user_id, websocket in self.active_connections.items():
            if user_id != exclude_user:
                try:
                    await websocket.send_json(message)
                except:
                    disconnected_users.append(user_id)
        
        # Clean up disconnected users
        for user_id in disconnected_users:
            self.disconnect(user_id)

    async def get_user_notifications(self, user_id: str, page: int = 1, limit: int = 20) -> List[Dict]:
        """Get paginated notifications for user"""
        notifications = await self.db.notifications.find(
            {"user_id": user_id},
            sort=[("created_at", -1)]
        ).skip((page - 1) * limit).limit(limit).to_list(length=limit)
        
        return notifications

    async def mark_as_read(self, notification_id: str, user_id: str) -> bool:
        """Mark notification as read"""
        result = await self.db.notifications.update_one(
            {"_id": notification_id, "user_id": user_id},
            {"$set": {"read": True}}
        )
        return result.modified_count > 0

    async def mark_all_as_read(self, user_id: str) -> int:
        """Mark all notifications as read for user"""
        result = await self.db.notifications.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True}}
        )
        return result.modified_count

    async def get_unread_count(self, user_id: str) -> int:
        """Get count of unread notifications"""
        return await self.db.notifications.count_documents({
            "user_id": user_id,
            "read": False
        })

    async def send_document_status_notification(self, user_id: str, document_id: str, status: str):
        """Send notification about document status change"""
        notification = {
            "type": "document_status",
            "document_id": document_id,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_notification(user_id, notification)

    async def send_claim_status_notification(self, user_id: str, claim_id: str, status: str, claim_type: str):
        """Send notification about claim status change"""
        notification = {
            "type": "claim_status",
            "claim_id": claim_id,
            "claim_type": claim_type,
            "status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
        await self.send_notification(user_id, notification)