from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.db import db

router = APIRouter(prefix="/api/audit", tags=["Audit Logs"])

@router.get("/logs")
def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action type (e.g. CREDENTIAL_ISSUED, CREDENTIAL_VERIFIED, CONSENT_APPROVED)"),
    institution_id: Optional[str] = Query(None, description="Filter by institution ID"),
    actor_role: Optional[str] = Query(None, description="Filter by actor role (student, institution, verifier, system)"),
    search: Optional[str] = Query(None, description="Search details, actor, or target entity")
):
    """
    Query full immutable audit trail:
    Filterable by action type, institution, actor role, or keyword.
    """
    results = db.audit_logs
    if action:
        results = [l for l in results if action.lower() in l["action"].lower()]
    if institution_id:
        results = [l for l in results if l.get("institution_id") == institution_id]
    if actor_role:
        results = [l for l in results if l["actor_role"] == actor_role]
    if search:
        q = search.lower().strip()
        results = [
            l for l in results
            if q in l["actor_name"].lower()
            or q in l["target_entity"].lower()
            or q in l["details"].lower()
            or q in l["action"].lower()
            or q in l.get("mock_block_hash", "").lower()
        ]
        
    return {
        "status": "success",
        "count": len(results),
        "data": results
    }
