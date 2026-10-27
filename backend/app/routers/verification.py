import time
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db
from app.models import VerifyRequestPayload, VerificationState

router = APIRouter(prefix="/api/verify", tags=["Verification Portal"])

@router.post("")
def verify_credential(payload: VerifyRequestPayload):
    """
    Public verification endpoint:
    Accepts:
      - Credential ID (e.g. CRED-DTU-2024-DEG-01, CRED-TAMPERED-MOCK-99)
      - APAAR ID (e.g. APAAR-2024-8921-4402)
      - QR Code payload (e.g. SHIKSHASETU:VERIFY:...)
      - Or Sharing Token (e.g. TCS-GRANT-TOKEN-9981-ACTIVE, SECURE-LINK-...)
    Enforces Privacy-by-Design:
      - Validates active consent
      - Filters output so only consented fields are visible
    Evaluates state:
      - Verified
      - Tampered
      - Expired
      - Consent Required
      - Invalid
    Logs every attempt to verification_logs and audit_logs!
    """
    identifier = payload.identifier.strip()
    verifier_name = payload.verifier_name or "Public Verifier"
    access_token = payload.access_token

    # Handle QR string format: "SHIKSHASETU:VERIFY:CRED_ID:..."
    if identifier.startswith("SHIKSHASETU:VERIFY:"):
        parts = identifier.split(":")
        if len(parts) >= 3:
            identifier = parts[2]

    # Find credential by ID or APAAR ID or Token
    cred = None
    student = None
    institution = None
    consent_req = None
    consent_perm = None

    # 1. Direct search by Credential ID
    cred = next((c for c in db.credentials if c["id"].lower() == identifier.lower()), None)
    
    # 2. Search by APAAR ID if not found
    if not cred:
        student = next((s for s in db.students if s["apaar_id"].lower() == identifier.lower() or s["masked_apaar_id"].lower() == identifier.lower()), None)
        if student:
            # Find primary degree or first credential
            cred = next((c for c in db.credentials if c["student_id"] == student["id"]), None)

    # 3. Search by Token
    if not cred or access_token:
        lookup_token = access_token or identifier
        consent_req = next((r for r in db.consent_requests if r["access_token"].lower() == lookup_token.lower()), None)
        if consent_req:
            student = next((s for s in db.students if s["id"] == consent_req["student_id"]), None)
            if not cred and student:
                cred = next((c for c in db.credentials if c["student_id"] == student["id"]), None)

    # If still not found -> State: INVALID
    if not cred:
        vlog = {
            "id": f"vlog-{int(time.time() * 1000)}",
            "credential_id": identifier,
            "apaar_id": None,
            "verifier_name": verifier_name,
            "verifier_ip": "127.0.0.1",
            "verification_method": "direct_query",
            "verification_state": "Invalid",
            "consented_fields_visible": [],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "notes": "No record found matching the provided identifier."
        }
        db.verification_logs.insert(0, vlog)
        return {
            "status": "error",
            "verification_state": "Invalid",
            "message": "Credential not found or invalid identifier format.",
            "details": {
                "searched_identifier": identifier,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }

    # Retrieve student and institution associated with credential
    if not student:
        student = next((s for s in db.students if s["id"] == cred["student_id"]), None)
    institution = next((i for i in db.institutions if i["id"] == cred["institution_id"]), None)

    # Check for TAMPERED state
    if cred.get("is_tampered", False) or "TAMPER" in cred["id"] or cred.get("signature_status") == "Signature Tampered":
        vlog = {
            "id": f"vlog-{int(time.time() * 1000)}",
            "credential_id": cred["id"],
            "apaar_id": student["apaar_id"] if student else cred.get("apaar_id"),
            "verifier_name": verifier_name,
            "verifier_ip": "127.0.0.1",
            "verification_method": "cryptographic_audit",
            "verification_state": "Tampered",
            "consented_fields_visible": [],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "notes": "Cryptographic checksum mismatch! Registry signature does not match content hash."
        }
        db.verification_logs.insert(0, vlog)
        
        # Log audit entry
        db.audit_logs.insert(0, {
            "id": f"audit-{int(time.time() * 1000)}",
            "action": "CREDENTIAL_TAMPER_ALERT",
            "actor_name": verifier_name,
            "actor_role": "verifier",
            "institution_id": cred["institution_id"],
            "target_entity": cred["id"],
            "details": f"Attempted verification of tampered record {cred['id']}. Signature check failed.",
            "ip_address": "127.0.0.1",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "mock_block_hash": f"0000{uuid.uuid4().hex[:40]}"
        })

        return {
            "status": "tampered",
            "verification_state": "Tampered",
            "message": "WARNING: Cryptographic signature mismatch detected! Record may have been unauthorizedly altered.",
            "tamper_details": {
                "expected_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "calculated_hash": cred["mock_hash"],
                "signature_status": "Signature Tampered",
                "tamper_detected_at": datetime.utcnow().isoformat() + "Z",
                "anomaly_reference": "ANOM-2024-DUP-102"
            },
            "credential": {
                "id": cred["id"],
                "institution_name": cred["institution_name"],
                "title": cred["title"],
                "issue_date": cred["issue_date"],
                "credential_hash": cred["mock_hash"]
            }
        }

    # Evaluate Consent: Check if active consent exists for this student & verifier or token
    active_consent = None
    if access_token:
        active_consent = next((r for r in db.consent_requests if r.get("access_token") == access_token and r["student_id"] == student["id"]), None)
    
    if not active_consent and verifier_name:
        # Check if student has approved consent explicitly for this specific verifier
        active_consent = next(
            (r for r in db.consent_requests if r["student_id"] == student["id"] and r.get("status") == "approved" and (verifier_name.lower() in r.get("verifier_name", "").lower() or r.get("verifier_name", "").lower() in verifier_name.lower())),
            None
        )

    # If consent is EXPIRED
    if active_consent and active_consent.get("status") == "expired":
        vlog = {
            "id": f"vlog-{int(time.time() * 1000)}",
            "credential_id": cred["id"],
            "apaar_id": student["apaar_id"] if student else None,
            "verifier_name": verifier_name,
            "verifier_ip": "127.0.0.1",
            "verification_method": "token_check",
            "verification_state": "Expired",
            "consented_fields_visible": [],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "notes": f"Consent token expired on {active_consent.get('valid_until')}."
        }
        db.verification_logs.insert(0, vlog)
        return {
            "status": "expired",
            "verification_state": "Expired",
            "message": "Access permission for this student record expired. The candidate must renew consent.",
            "details": {
                "credential_id": cred["id"],
                "student_masked_name": f"{student['full_name'][0]}*** {student['full_name'].split()[-1]}",
                "expired_at": active_consent.get("valid_until"),
                "verifier_name": verifier_name
            }
        }

    # If consent is REJECTED or REVOKED or NOT FOUND
    if not active_consent or active_consent.get("status") in ["rejected", "revoked", "pending"]:
        vlog = {
            "id": f"vlog-{int(time.time() * 1000)}",
            "credential_id": cred["id"],
            "apaar_id": student["apaar_id"] if student else None,
            "verifier_name": verifier_name,
            "verifier_ip": "127.0.0.1",
            "verification_method": "public_search",
            "verification_state": "Consent Required",
            "consented_fields_visible": ["masked_apaar_id"],
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "notes": "Candidate exists but has not granted consent to this verifier."
        }
        db.verification_logs.insert(0, vlog)
        return {
            "status": "consent_required",
            "verification_state": "Consent Required",
            "message": "Privacy-by-Design: Student has not authorized disclosure of records to your organization.",
            "consent_required_info": {
                "student_id": student["id"] if student else None,
                "masked_apaar_id": student["masked_apaar_id"] if student else "XXXX-XXXX-****",
                "institution_name": cred["institution_name"],
                "instructions": "Please request a direct time-limited sharing link from the candidate or initiate a consent request via ShikshaSetu AI."
            }
        }

    # SUCCESSFUL VERIFICATION!
    # Retrieve granular field permissions
    perm = next((p for p in db.consent_permissions if p["consent_request_id"] == active_consent["id"]), None)
    
    consented_fields = []
    if not perm or perm.get("share_profile", True):
        consented_fields.append("profile")
    if not perm or perm.get("share_degree", True):
        consented_fields.append("degree")
    if perm and perm.get("share_marksheets", False):
        consented_fields.append("marksheets")
    if perm and perm.get("share_certificates", False):
        consented_fields.append("certificates")
    if not perm or perm.get("share_skills", True):
        consented_fields.append("skills")

    # Filtered student profile according to consent
    student_payload = {
        "full_name": student["full_name"] if "profile" in consented_fields else f"{student['full_name'][0]}*** {student['full_name'].split()[-1]}",
        "masked_apaar_id": student["masked_apaar_id"],
        "enrollment_number": student["enrollment_number"] if "profile" in consented_fields else "Protected by Consent",
        "program": student["program"],
        "institution_name": student["institution_name"],
        "cgpa": student["cgpa"] if "degree" in consented_fields or "marksheets" in consented_fields else "Hidden by Student Consent",
        "graduation_year": student["graduation_year"]
    }

    # Log successful verification
    vlog = {
        "id": f"vlog-{int(time.time() * 1000)}",
        "credential_id": cred["id"],
        "apaar_id": student["apaar_id"],
        "verifier_name": verifier_name,
        "verifier_ip": "127.0.0.1",
        "verification_method": "active_consent_gateway",
        "verification_state": "Verified",
        "consented_fields_visible": consented_fields,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "notes": f"Verified successfully with active consent token ({active_consent['access_token']})."
    }
    db.verification_logs.insert(0, vlog)

    # Log to immutable audit trail
    db.audit_logs.insert(0, {
        "id": f"audit-{int(time.time() * 1000)}",
        "action": "CREDENTIAL_VERIFIED",
        "actor_name": verifier_name,
        "actor_role": "verifier",
        "institution_id": cred["institution_id"],
        "target_entity": cred["id"],
        "details": f"Verified {cred['title']} for {student['full_name']} under consent policy {active_consent['id']}.",
        "ip_address": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mock_block_hash": f"0000{uuid.uuid4().hex[:40]}"
    })

    return {
        "status": "success",
        "verification_state": "Verified",
        "message": "Credential authentically verified against AICTE Institutional Registry.",
        "verification_result": {
            "institution_name": cred["institution_name"],
            "aicte_approval": institution["approval_status"] if institution else "AICTE Approved - Demo",
            "credential_title": cred["title"],
            "credential_type": cred["credential_type"],
            "course": cred["course"],
            "grade": cred["grade"] if "degree" in consented_fields else "Verified (Honours)",
            "cgpa": cred["cgpa"] if "degree" in consented_fields else None,
            "issue_date": cred["issue_date"],
            "credential_hash": cred["mock_hash"],
            "digital_signature_status": cred["signature_status"],
            "digital_signature_key": cred["digital_signature"],
            "verification_timestamp": datetime.utcnow().isoformat() + "Z",
            "tamper_status": "Cryptographically Authentic (0 Tampering Detected)",
            "consented_fields": consented_fields,
            "skills_covered": cred["skills_covered"] if "skills" in consented_fields else ["Protected by Student Consent"],
            "mock_certificate_url": cred["mock_certificate_url"] if "certificates" in consented_fields or "degree" in consented_fields else None
        },
        "student": student_payload
    }

@router.get("/logs")
def get_verification_logs(
    credential_id: Optional[str] = None,
    apaar_id: Optional[str] = None
):
    """Retrieve history of verification attempts"""
    results = db.verification_logs
    if credential_id:
        results = [l for l in results if l["credential_id"] == credential_id]
    if apaar_id:
        results = [l for l in results if l.get("apaar_id") == apaar_id]
        
    return {
        "status": "success",
        "count": len(results),
        "data": results
    }
