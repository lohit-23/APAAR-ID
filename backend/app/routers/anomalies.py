from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db

router = APIRouter(prefix="/api/anomalies", tags=["AI Anomaly Detection"])

@router.get("")
def list_anomalies(
    institution_id: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None
):
    """
    AI anomaly detection list:
    Flags duplicate credentials and inconsistent academic data with confidence scores and recommended actions.
    """
    results = db.anomalies
    if institution_id:
        results = [a for a in results if a["institution_id"] == institution_id]
    if status:
        results = [a for a in results if a["status"] == status]
    if severity:
        results = [a for a in results if a["severity"] == severity]
        
    return {
        "status": "success",
        "count": len(results),
        "data": results
    }

@router.post("/{anomaly_id}/status")
def update_anomaly_status(anomaly_id: str, new_status: str = Query(..., pattern="^(flagged|reviewing|resolved)$")):
    """Update status of an AI anomaly alert (e.g. resolve or set to under review)"""
    anomaly = next((a for a in db.anomalies if a["id"] == anomaly_id), None)
    if not anomaly:
        raise HTTPException(status_code=404, detail="Anomaly alert not found")
        
    old_status = anomaly["status"]
    anomaly["status"] = new_status
    
    # Audit trail
    db.audit_logs.insert(0, {
        "id": f"audit-anom-{anomaly_id}",
        "action": "ANOMALY_STATUS_UPDATED",
        "actor_name": "Compliance Officer",
        "actor_role": "institution",
        "institution_id": anomaly["institution_id"],
        "target_entity": anomaly_id,
        "details": f"Anomaly {anomaly_id} status transitioned from {old_status} to {new_status}.",
        "ip_address": "127.0.0.1",
        "timestamp": "2024-10-27T10:00:00Z",
        "mock_block_hash": f"0000{anomaly_id[:8]}"
    })
    
    return {
        "status": "success",
        "message": f"Anomaly alert marked as {new_status}.",
        "data": anomaly
    }
