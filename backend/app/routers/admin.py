from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db

router = APIRouter(prefix="/api/admin", tags=["Super Admin"])

@router.get("/analytics")
def get_platform_analytics():
    """
    Super Admin high-level analytics:
    Total credentials, active students, verification volume, consent requests, and anomaly rate.
    """
    total_students = len(db.students)
    total_credentials = len(db.credentials)
    total_verifications = len(db.verification_logs)
    total_consent_requests = len(db.consent_requests)
    flagged_anomalies = len([a for a in db.anomalies if a["status"] != "resolved"])
    
    # Verification breakdown
    verified_count = len([v for v in db.verification_logs if v["verification_state"] == "Verified"])
    tampered_count = len([v for v in db.verification_logs if v["verification_state"] == "Tampered"])
    expired_count = len([v for v in db.verification_logs if v["verification_state"] == "Expired"])
    consent_req_count = len([v for v in db.verification_logs if v["verification_state"] == "Consent Required"])
    
    # Institution breakdown
    institutions_stats = []
    for inst in db.institutions:
        inst_creds = len([c for c in db.credentials if c["institution_id"] == inst["id"]])
        inst_students = len([s for s in db.students if s["institution_id"] == inst["id"]])
        institutions_stats.append({
            "id": inst["id"],
            "name": inst["name"],
            "code": inst["code"],
            "state": inst["state"],
            "approval_status": inst["approval_status"],
            "students_count": inst_students or inst["student_count"],
            "credentials_issued": inst_creds or inst["credentials_issued"]
        })

    return {
        "status": "success",
        "metrics": {
            "total_students": total_students,
            "total_institutions": len(db.institutions),
            "total_credentials_issued": total_credentials,
            "total_verifications_performed": total_verifications,
            "total_consent_requests": total_consent_requests,
            "active_anomaly_alerts": flagged_anomalies,
            "data_integrity_index": "99.8%"
        },
        "verification_breakdown": {
            "verified": verified_count,
            "tampered": tampered_count,
            "expired": expired_count,
            "consent_required": consent_req_count
        },
        "monthly_trend": [
            {"month": "May", "issued": 1820, "verified": 950, "consent": 640},
            {"month": "Jun", "issued": 4200, "verified": 2100, "consent": 1580},
            {"month": "Jul", "issued": 3800, "verified": 2850, "consent": 1920},
            {"month": "Aug", "issued": 2900, "verified": 3100, "consent": 2200},
            {"month": "Sep", "issued": 3400, "verified": 3950, "consent": 2840},
            {"month": "Oct", "issued": 4100, "verified": 4480, "consent": 3310}
        ],
        "institutions": institutions_stats
    }

@router.get("/system-health")
def get_system_health():
    """
    Mock data-integrity / blockchain-style hash chain status:
    Verifies that all blocks in the audit trail have intact cryptographic hash continuity.
    """
    total_blocks = len(db.audit_logs)
    intact_blocks = total_blocks # In demo prototype, all audit blocks are cryptographically verified
    
    return {
        "status": "success",
        "ledger_health": "100% Intact & Tamper-Evident",
        "consensus_protocol": "Proof of Authority (AICTE Consortium Nodes)",
        "total_anchored_blocks": total_blocks + 14820,
        "last_block_hash": db.audit_logs[0]["mock_block_hash"] if db.audit_logs else "0000a18f99e312bc",
        "validator_nodes": [
            {"node": "AICTE-NewDelhi-Master", "status": "Online (Latency 12ms)", "synced_blocks": total_blocks + 14820},
            {"node": "DigiLocker-NAD-Bridge", "status": "Online (Latency 18ms)", "synced_blocks": total_blocks + 14820},
            {"node": "NIC-Cloud-MeghRaj", "status": "Online (Latency 14ms)", "synced_blocks": total_blocks + 14820},
            {"node": "DTU-Academic-Peer", "status": "Online (Latency 22ms)", "synced_blocks": total_blocks + 14820}
        ],
        "zero_knowledge_proof_status": "Enabled (Selective field disclosure via student consent)",
        "uptime": "99.98% (Demo Node)"
    }

@router.post("/institutions/{institution_id}/toggle-status")
def toggle_institution_status(institution_id: str):
    """Approve or suspend an AICTE demo institution"""
    inst = next((i for i in db.institutions if i["id"] == institution_id), None)
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    if "Approved" in inst["approval_status"]:
        inst["approval_status"] = "Under AICTE Compliance Review"
    else:
        inst["approval_status"] = "AICTE Approved - Demo"
        
    return {
        "status": "success",
        "institution_id": inst["id"],
        "new_status": inst["approval_status"]
    }

@router.get("/users")
def list_users():
    """List platform users and their roles"""
    return {
        "status": "success",
        "count": len(db.users),
        "data": db.users
    }
