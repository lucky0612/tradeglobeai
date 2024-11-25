from fastapi import WebSocket
from typing import Dict, Set
import json
from .notification_service import NotificationService
from ..config import settings

class WebSocketService:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.notification_service = NotificationService()

    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect new WebSocket client"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
        
        self.active_connections[user_id].add(websocket)

    def disconnect(self, websocket: WebSocket, user_id: str):
        """Disconnect WebSocket client"""
        if user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_to_user(self, user_id: str, message: Dict):
        """Broadcast message to all user's connections"""
        if user_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.add(connection)
            
            # Clean up disconnected connections
            for connection in disconnected:
                self.active_connections[user_id].remove(connection)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def broadcast_message(self, message: Dict, exclude_user: str = None):
        """Broadcast message to all connected users"""
        for user_id, connections in self.active_connections.items():
            if user_id != exclude_user:
                await self.broadcast_to_user(user_id, message)