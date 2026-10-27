import time
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db
from app.models import UpdateConsentPayload, CreateTimeLimitedSharePayload, ConsentStatus

router = APIRouter(prefix="/api/consent", tags=["Consent Management"])

@router.get("/requests")
def list_consent_requests(
    student_id: Optional[str] = None,
    status: Optional[str] = None
):
    """List consent requests for student, optionally filtered by status"""
    results = db.consent_requests
    if student_id:
        results = [r for r in results if r["student_id"] == student_id]
    if status:
        results = [r for r in results if r["status"] == status]
        
    # Attach existing permissions if present
    enhanced = []
    for req in results:
        perm = next((p for p in db.consent_permissions if p["consent_request_id"] == req["id"]), None)
        enhanced.append({
            **req,
            "permission": perm
        })
        
    return {
        "status": "success",
        "count": len(enhanced),
        "data": enhanced
    }

@router.post("/requests/{request_id}/status")
def update_consent_request(request_id: str, payload: UpdateConsentPayload):
    """
    Approve, reject, or revoke a consent request:
    Update request status and adjust granular field permissions (profile, degree, marksheets, certificates, skills)
    """
    req = next((r for r in db.consent_requests if r["id"] == request_id), None)
    if not req:
        raise HTTPException(status_code=404, detail="Consent request not found")
        
    old_status = req["status"]
    req["status"] = payload.status.value if hasattr(payload.status, 'value') else payload.status
    
    if payload.valid_until:
        req["valid_until"] = payload.valid_until
        
    # Update or create consent permission record
    perm = next((p for p in db.consent_permissions if p["consent_request_id"] == request_id), None)
    if not perm:
        perm = {
            "id": f"perm-{int(time.time() * 1000)}",
            "consent_request_id": request_id,
            "student_id": req["student_id"],
            "share_profile": payload.share_profile,
            "share_degree": payload.share_degree,
            "share_marksheets": payload.share_marksheets,
            "share_certificates": payload.share_certificates,
            "share_skills": payload.share_skills,
            "valid_until": req["valid_until"],
            "is_active": (req["status"] == "approved"),
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        db.consent_permissions.append(perm)
    else:
        perm["share_profile"] = payload.share_profile
        perm["share_degree"] = payload.share_degree
        perm["share_marksheets"] = payload.share_marksheets
        perm["share_certificates"] = payload.share_certificates
        perm["share_skills"] = payload.share_skills
        perm["is_active"] = (req["status"] == "approved")
        if payload.valid_until:
            perm["valid_until"] = payload.valid_until

    # Record in audit log
    action_type = f"CONSENT_{req['status'].upper()}"
    student = next((s for s in db.students if s["id"] == req["student_id"]), None)
    student_name = student["full_name"] if student else "Student"
    
    db.audit_logs.insert(0, {
        "id": f"audit-{int(time.time() * 1000)}",
        "action": action_type,
        "actor_name": student_name,
        "actor_role": "student",
        "institution_id": student["institution_id"] if student else None,
        "target_entity": f"{req['id']} ({req['verifier_name']})",
        "details": f"Consent changed from {old_status} to {req['status']}. Shared: Profile={payload.share_profile}, Degree={payload.share_degree}, Marksheets={payload.share_marksheets}, Certs={payload.share_certificates}, Skills={payload.share_skills}.",
        "ip_address": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mock_block_hash": f"0000{uuid.uuid4().hex[:40]}"
    })

    return {
        "status": "success",
        "message": f"Consent request {req['status']} successfully.",
        "data": {
            **req,
            "permission": perm
        }
    }

@router.post("/create-share-link")
def create_time_limited_share_link(payload: CreateTimeLimitedSharePayload):
    """
    Generate a secure time-limited sharing link with granular field permissions
    """
    student = next((s for s in db.students if s["id"] == payload.student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    token = f"SECURE-LINK-{uuid.uuid4().hex[:12].upper()}"
    expires_at = (datetime.utcnow() + timedelta(hours=payload.duration_hours)).isoformat() + "Z"
    
    new_req = {
        "id": f"share-{int(time.time() * 1000)}",
        "verifier_id": "public-link-holder",
        "verifier_name": f"Secure Link ({payload.purpose})",
        "verifier_type": "Direct Link",
        "verifier_logo": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=60&auto=format&fit=crop&q=80",
        "student_id": student["id"],
        "purpose": payload.purpose,
        "requested_fields": [
            f for f, enabled in [
                ("profile", payload.share_profile),
                ("degree", payload.share_degree),
                ("marksheets", payload.share_marksheets),
                ("certificates", payload.share_certificates),
                ("skills", payload.share_skills)
            ] if enabled
        ],
        "status": "approved",
        "requested_at": datetime.utcnow().isoformat() + "Z",
        "valid_until": expires_at,
        "access_token": token
    }
    db.consent_requests.insert(0, new_req)
    
    new_perm = {
        "id": f"perm-share-{int(time.time() * 1000)}",
        "consent_request_id": new_req["id"],
        "student_id": student["id"],
        "share_profile": payload.share_profile,
        "share_degree": payload.share_degree,
        "share_marksheets": payload.share_marksheets,
        "share_certificates": payload.share_certificates,
        "share_skills": payload.share_skills,
        "valid_until": expires_at,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    db.consent_permissions.insert(0, new_perm)
    
    # Audit trail
    db.audit_logs.insert(0, {
        "id": f"audit-{int(time.time() * 1000)}",
        "action": "TIME_LIMITED_SHARE_CREATED",
        "actor_name": student["full_name"],
        "actor_role": "student",
        "institution_id": student["institution_id"],
        "target_entity": token,
        "details": f"Created time-limited link expiring in {payload.duration_hours} hours. Permissions: Profile={payload.share_profile}, Degree={payload.share_degree}, Marksheets={payload.share_marksheets}.",
        "ip_address": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mock_block_hash": f"0000{uuid.uuid4().hex[:40]}"
    })

    share_url = f"/verify?token={token}"
    return {
        "status": "success",
        "token": token,
        "expires_at": expires_at,
        "duration_hours": payload.duration_hours,
        "share_url": share_url,
        "message": "Secure time-limited sharing link generated."
    }
