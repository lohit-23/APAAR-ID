import hashlib
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db
from app.models import IssueCredentialPayload, CredentialType

router = APIRouter(prefix="/api/credentials", tags=["Credentials"])

@router.get("")
def list_credentials(
    student_id: Optional[str] = None,
    institution_id: Optional[str] = None,
    credential_type: Optional[str] = None
):
    """List credentials with optional filters"""
    results = db.credentials
    if student_id:
        results = [c for c in results if c["student_id"] == student_id]
    if institution_id:
        results = [c for c in results if c["institution_id"] == institution_id]
    if credential_type:
        results = [c for c in results if c["credential_type"] == credential_type]
        
    return {
        "status": "success",
        "count": len(results),
        "data": results
    }

@router.get("/{credential_id}")
def get_credential(credential_id: str):
    """Get single credential by ID"""
    cred = next((c for c in db.credentials if c["id"] == credential_id), None)
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
    return {"status": "success", "data": cred}

@router.post("/issue")
def issue_credential(payload: IssueCredentialPayload):
    """
    Issue a new academic credential:
    1. Look up student and institution
    2. Compute mock cryptographic SHA-256 hash of credential metadata
    3. Generate digital signature status
    4. Construct QR verification payload and link
    5. Save into credentials table and create immutable audit log
    """
    student = next((s for s in db.students if s["id"] == payload.student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    institution = next((i for i in db.institutions if i["id"] == payload.institution_id), None)
    if not institution:
        institution = db.institutions[0]
        
    # Generate unique credential ID
    timestamp_suffix = int(time.time()) % 100000
    cred_prefix = {
        CredentialType.DEGREE: "DEG",
        CredentialType.MARKSHEET: "MRK",
        CredentialType.CERTIFICATE: "CRT",
        CredentialType.INTERNSHIP: "INT",
        CredentialType.SKILL_BADGE: "SKL"
    }.get(payload.credential_type, "CRD")
    
    cred_id = f"CRED-{institution['code']}-2024-{cred_prefix}-{timestamp_suffix}"
    
    # Compute mock cryptographic hash
    hash_payload = f"{cred_id}:{student['apaar_id']}:{institution['aicte_id']}:{payload.title}:{payload.grade}:{payload.cgpa}:{payload.issue_date}"
    mock_hash = hashlib.sha256(hash_payload.encode('utf-8')).hexdigest()
    
    # Mock digital signature
    digital_signature = f"RSA-SHA256-SIGN-{institution['code']}-AICTE-{timestamp_suffix}-VERIFIED"
    
    qr_payload = f"SHIKSHASETU:VERIFY:{cred_id}:{student['apaar_id']}:{institution['code']}"
    verification_link = f"/verify/{cred_id}"
    
    new_credential = {
        "id": cred_id,
        "student_id": student["id"],
        "student_name": student["full_name"],
        "apaar_id": student["apaar_id"],
        "institution_id": institution["id"],
        "institution_name": institution["name"],
        "title": payload.title,
        "credential_type": payload.credential_type.value if hasattr(payload.credential_type, 'value') else payload.credential_type,
        "course": payload.course,
        "grade": payload.grade,
        "cgpa": payload.cgpa,
        "issue_date": payload.issue_date,
        "mock_hash": mock_hash,
        "digital_signature": digital_signature,
        "signature_status": "Digitally Signed & Verified",
        "is_tampered": False,
        "qr_code_payload": qr_payload,
        "verification_link": verification_link,
        "mock_certificate_url": "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=80",
        "description": payload.description or f"{payload.title} issued to {student['full_name']} by {institution['name']}.",
        "skills_covered": payload.skills_covered or ["Academic Proficiency", "AICTE Certified Coursework"]
    }
    
    # Insert at top of credentials
    db.credentials.insert(0, new_credential)
    institution["credentials_issued"] += 1
    
    # Create audit log entry
    audit_entry = {
        "id": f"audit-{int(time.time() * 1000)}",
        "action": "CREDENTIAL_ISSUED",
        "actor_name": f"Admin ({institution['code']})",
        "actor_role": "institution",
        "institution_id": institution["id"],
        "target_entity": f"{cred_id} ({student['full_name']})",
        "details": f"Issued {payload.title} with Hash: {mock_hash[:16]}...",
        "ip_address": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mock_block_hash": hashlib.sha256(f"audit:{cred_id}:{time.time()}".encode()).hexdigest()
    }
    db.audit_logs.insert(0, audit_entry)
    
    # Create notification for student
    notif_entry = {
        "id": f"notif-{int(time.time() * 1000)}",
        "user_id": student["user_id"],
        "title": "New Credential Added to Wallet",
        "message": f"Your institution issued '{payload.title}'. It is now ready for verification.",
        "type": "credential",
        "is_read": False,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "action_url": "/student/wallet"
    }
    db.notifications.insert(0, notif_entry)
    
    return {
        "status": "success",
        "message": "Credential successfully issued, signed, and registered.",
        "data": new_credential
    }

@router.post("/{credential_id}/tamper")
def toggle_tamper(credential_id: str):
    """
    Demo endpoint: Toggle tampered state of a credential to demonstrate
    real-time tamper detection in the verifier portal and audit trail!
    """
    cred = next((c for c in db.credentials if c["id"] == credential_id), None)
    if not cred:
        raise HTTPException(status_code=404, detail="Credential not found")
        
    cred["is_tampered"] = not cred.get("is_tampered", False)
    if cred["is_tampered"]:
        cred["signature_status"] = "Signature Tampered"
        cred["mock_hash"] = "deadbeef" + cred["mock_hash"][8:]
        action = "CREDENTIAL_TAMPERED"
        details = f"Tampering injected into {credential_id}. Cryptographic signature invalidated."
    else:
        cred["signature_status"] = "Digitally Signed & Verified"
        cred["mock_hash"] = hashlib.sha256(f"{cred['id']}:{cred['title']}".encode()).hexdigest()
        action = "CREDENTIAL_RESTORED"
        details = f"Original cryptographic integrity restored for {credential_id}."
        
    # Log to audit trail
    db.audit_logs.insert(0, {
        "id": f"audit-{int(time.time() * 1000)}",
        "action": action,
        "actor_name": "Security Sentinel Demo Engine",
        "actor_role": "system",
        "institution_id": cred["institution_id"],
        "target_entity": cred["id"],
        "details": details,
        "ip_address": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mock_block_hash": hashlib.sha256(f"{action}:{cred['id']}:{time.time()}".encode()).hexdigest()
    })
    
    return {
        "status": "success",
        "is_tampered": cred["is_tampered"],
        "credential": cred
    }
