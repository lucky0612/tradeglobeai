from fastapi import APIRouter, WebSocket, Depends, HTTPException
from typing import Dict
import json
from ..services.websocket_service import WebSocketService
from ..services.notification_service import NotificationService
from ..middleware.auth import get_current_user
from ..models import User

router = APIRouter(prefix="/ws", tags=["WebSocket"])
websocket_service = WebSocketService()
notification_service = NotificationService()

@router.websocket("")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str,
    current_user: User = Depends(get_current_user)
):
    try:
        await websocket_service.connect(websocket, current_user.id)
        
        try:
            while True:
                data = await websocket.receive_text()
                message = json.loads(data)
                
                # Handle different message types
                if message["type"] == "ping":
                    await websocket.send_json({"type": "pong"})
                elif message["type"] == "subscribe":
                    # Handle subscription to specific events
                    pass
                elif message["type"] == "unsubscribe":
                    # Handle unsubscription from events
                    pass
                
        except Exception as e:
            print(f"WebSocket error: {str(e)}")
        finally:
            websocket_service.disconnect(websocket, current_user.id)
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
