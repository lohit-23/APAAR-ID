from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from app.db import db
from app.models import User, UserRole

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class LoginRequest(BaseModel):
    role: Optional[str] = None
    email: Optional[str] = None
    user_id: Optional[str] = None

@router.get("/roles")
def get_available_roles():
    """Return available demo personas and roles for one-click hackathon switching"""
    return {
        "status": "success",
        "roles": [
            {
                "role": "student",
                "label": "Student",
                "description": "View academic wallet, consent manager, APAAR card, AI insights",
                "default_user": db.users[0],
                "badge": "APAAR: XXXX-XXXX-4402"
            },
            {
                "role": "institution",
                "label": "Institution Admin",
                "description": "Issue credentials, search students, bulk CSV upload, AI anomaly detection",
                "default_user": db.users[1],
                "badge": "DTU (AICTE Approved - Demo)"
            },
            {
                "role": "verifier",
                "label": "Verifier (Employer / University)",
                "description": "Public verification portal, QR validation, consent enforcement, tamper detection",
                "default_user": db.users[2],
                "badge": "TCS Campus Hiring"
            },
            {
                "role": "super_admin",
                "label": "Super Admin",
                "description": "System analytics, institution approval, audit logs, ledger integrity health",
                "default_user": db.users[3],
                "badge": "AICTE Central Node"
            }
        ]
    }

@router.post("/login")
def login(payload: LoginRequest):
    """Demo login endpoint to switch personas easily"""
    if payload.user_id:
        user = next((u for u in db.users if u["id"] == payload.user_id), None)
        if user:
            return {"status": "success", "user": user, "token": f"mock-jwt-{user['role']}-{user['id']}"}
            
    if payload.role:
        user = next((u for u in db.users if u["role"] == payload.role), None)
        if user:
            return {"status": "success", "user": user, "token": f"mock-jwt-{user['role']}-{user['id']}"}

    if payload.email:
        user = next((u for u in db.users if u["email"].lower() == payload.email.lower()), None)
        if user:
            return {"status": "success", "user": user, "token": f"mock-jwt-{user['role']}-{user['id']}"}

    # Default to first student if not specified
    user = db.users[0]
    return {"status": "success", "user": user, "token": f"mock-jwt-{user['role']}-{user['id']}"}

@router.get("/me")
def get_current_user(role: Optional[str] = "student"):
    """Get profile info for currently selected demo role"""
    user = next((u for u in db.users if u["role"] == role), db.users[0])
    student = None
    institution = None
    
    if user.get("student_id"):
        student = next((s for s in db.students if s["id"] == user["student_id"]), None)
    if user.get("institution_id"):
        institution = next((i for i in db.institutions if i["id"] == user["institution_id"]), None)
        
    return {
        "status": "success",
        "user": user,
        "student": student,
        "institution": institution
    }
