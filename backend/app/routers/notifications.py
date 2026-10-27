from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("")
def get_notifications(
    user_id: Optional[str] = None,
    unread_only: bool = False
):
    """Get notifications for current user or demo view"""
    results = db.notifications
    if user_id:
        results = [n for n in results if n["user_id"] == user_id]
    if unread_only:
        results = [n for n in results if not n["is_read"]]
        
    unread_count = len([n for n in results if not n["is_read"]])
    return {
        "status": "success",
        "unread_count": unread_count,
        "count": len(results),
        "data": results
    }

@router.post("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Mark notification as read"""
    notif = next((n for n in db.notifications if n["id"] == notification_id), None)
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    notif["is_read"] = True
    return {"status": "success", "data": notif}

@router.post("/mark-all-read")
def mark_all_read(user_id: Optional[str] = None):
    """Mark all notifications as read"""
    for n in db.notifications:
        if not user_id or n["user_id"] == user_id:
            n["is_read"] = True
            
    return {"status": "success", "message": "All notifications marked as read"}
