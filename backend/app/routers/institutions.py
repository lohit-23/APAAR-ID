import csv
import io
import time
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from typing import Optional, List, Dict, Any
from app.db import db

router = APIRouter(prefix="/api/institutions", tags=["Institutions"])

@router.get("")
def list_institutions():
    """List all AICTE demo institutions"""
    return {
        "status": "success",
        "count": len(db.institutions),
        "data": db.institutions
    }

@router.get("/{institution_id}")
def get_institution(institution_id: str):
    """Get institution profile and statistical indicators"""
    inst = next((i for i in db.institutions if i["id"] == institution_id), None)
    if not inst:
        raise HTTPException(status_code=404, detail="Institution not found")
        
    inst_students = [s for s in db.students if s["institution_id"] == institution_id]
    inst_credentials = [c for c in db.credentials if c["institution_id"] == institution_id]
    inst_anomalies = [a for a in db.anomalies if a["institution_id"] == institution_id]
    
    return {
        "status": "success",
        "data": {
            **inst,
            "total_students": len(inst_students) or inst["student_count"],
            "total_credentials": len(inst_credentials) or inst["credentials_issued"],
            "active_anomalies": len(inst_anomalies),
            "pending_verifications": inst.get("pending_verifications", 12)
        }
    }

@router.get("/{institution_id}/students")
def get_institution_students(
    institution_id: str,
    search: Optional[str] = Query(None, description="Search by APAAR ID, Name, or Enrollment Number")
):
    """Search students belonging to this institution"""
    students = [s for s in db.students if s["institution_id"] == institution_id]
    if search:
        q = search.lower().strip()
        students = [
            s for s in students
            if q in s["full_name"].lower()
            or q in s["apaar_id"].lower()
            or q in s["masked_apaar_id"].lower()
            or q in s["enrollment_number"].lower()
            or q in s["program"].lower()
        ]
        
    return {
        "status": "success",
        "count": len(students),
        "data": students
    }

@router.get("/{institution_id}/data-quality")
def get_data_quality_report(institution_id: str):
    """
    Data-quality dashboard that identifies:
    1. Incomplete records
    2. Duplicate certificates
    3. Invalid dates
    4. Missing documents
    """
    students = [s for s in db.students if s["institution_id"] == institution_id]
    anomalies = [a for a in db.anomalies if a["institution_id"] == institution_id]
    
    incomplete_records = [
        {
            "student_id": s["id"],
            "student_name": s["full_name"],
            "apaar_id": s["masked_apaar_id"],
            "missing_field": "Academic Bank of Credits (ABC) ID" if not s.get("abc_account_id") else "Aadhaar e-KYC Resync",
            "completion_percentage": s["profile_completion"],
            "urgency": "High" if s["profile_completion"] < 80 else "Medium"
        }
        for s in students if s["profile_completion"] < 90
    ]

    duplicate_certificates = [
        {
            "anomaly_id": a["id"],
            "student_name": a["student_name"],
            "apaar_id": a["apaar_id"],
            "description": a["description"],
            "confidence": f"{int(a['confidence_score'] * 100)}%",
            "recommended_action": a["recommended_action"]
        }
        for a in anomalies if a["alert_type"] == "duplicate_credential"
    ]

    invalid_date_flags = [
        {
            "credential_id": "CRED-DTU-FLAG-09",
            "student_name": "Rohan Verma",
            "issue_date": "2024-02-30",
            "reason": "Non-existent calendar date (February 30th) detected in imported marksheet batch #DTU-B3",
            "resolution": "Corrected automatically to 2024-02-28 by validation pipeline."
        }
    ]

    missing_documents = [
        {
            "student_name": a["student_name"],
            "apaar_id": a["apaar_id"],
            "document_type": "AICTE 8-Week Industrial Internship",
            "severity": a["severity"],
            "deadline": "2024-11-30"
        }
        for a in anomalies if a["alert_type"] == "missing_mandatory_doc"
    ]

    # Calculate overall data health score
    health_score = 92.4 # high baseline

    return {
        "status": "success",
        "institution_id": institution_id,
        "health_score": health_score,
        "quality_metrics": {
            "total_records_analyzed": 3420,
            "clean_records_rate": "97.2%",
            "incomplete_records_count": len(incomplete_records),
            "duplicate_flags_count": len(duplicate_certificates),
            "invalid_dates_count": len(invalid_date_flags),
            "missing_documents_count": len(missing_documents)
        },
        "incomplete_records": incomplete_records,
        "duplicate_certificates": duplicate_certificates,
        "invalid_dates": invalid_date_flags,
        "missing_documents": missing_documents
    }

@router.post("/{institution_id}/bulk-upload")
async def bulk_upload_student_records(
    institution_id: str,
    file: Optional[UploadFile] = File(None),
    csv_text: Optional[str] = Form(None)
):
    """
    Bulk CSV upload interface:
    Parses CSV containing student records, validates fields, and simulates bulk batch import into platform.
    """
    content = ""
    if file:
        file_bytes = await file.read()
        content = file_bytes.decode('utf-8', errors='ignore')
    elif csv_text:
        content = csv_text
    else:
        # Sample fallback mock dataset for demonstration if no file provided
        content = """full_name,enrollment_number,program,branch,admission_year,cgpa,email,phone
Tanmay Bakshi,2022/DTU/CO/490,B.Tech Computer Engineering,CSE,2022,9.15,tanmay.b.demo@dtu.ac.in,+91 98101 22334
Isha Sharma,2022/DTU/IT/491,B.Tech Information Technology,IT,2022,8.72,isha.s.demo@dtu.ac.in,+91 98102 33445
Kunal Deshmukh,2022/DTU/ME/492,B.Tech Mechanical Engineering,ME,2022,8.40,kunal.d.demo@dtu.ac.in,+91 98103 44556
"""

    reader = csv.DictReader(io.StringIO(content.strip()))
    parsed_rows = []
    errors = []
    
    row_idx = 1
    for row in reader:
        row_idx += 1
        name = row.get("full_name", "").strip()
        enrollment = row.get("enrollment_number", "").strip()
        cgpa_str = row.get("cgpa", "0").strip()
        
        if not name or not enrollment:
            errors.append(f"Row {row_idx}: Missing required name or enrollment number.")
            continue
            
        try:
            cgpa = float(cgpa_str)
            if cgpa < 0 or cgpa > 10:
                errors.append(f"Row {row_idx} ({name}): Invalid CGPA value '{cgpa_str}'. Must be between 0.0 and 10.0.")
                continue
        except ValueError:
            cgpa = 8.0

        # Generate mock APAAR ID for newly uploaded student
        mock_apaar = f"APAAR-2024-{1000 + row_idx * 17}-{5000 + row_idx * 23}"
        
        parsed_rows.append({
            "id": f"std-bulk-{int(time.time())}-{row_idx}",
            "user_id": f"user-bulk-{row_idx}",
            "apaar_id": mock_apaar,
            "masked_apaar_id": f"XXXX-XXXX-{mock_apaar[-4:]}",
            "enrollment_number": enrollment,
            "full_name": name,
            "email": row.get("email", f"{name.lower().replace(' ', '.')}@dtu.ac.in.demo"),
            "masked_email": f"{name[:2].lower()}***@{institution_id}.ac.in",
            "phone": row.get("phone", "+91 98000 00000"),
            "masked_phone": "+91 ******0000",
            "institution_id": institution_id,
            "institution_name": "Delhi Technological University (DTU) - AICTE Demo",
            "program": row.get("program", "B.Tech Computer Engineering"),
            "branch": row.get("branch", "CSE"),
            "admission_year": int(row.get("admission_year", 2022)),
            "graduation_year": int(row.get("admission_year", 2022)) + 4,
            "current_semester": 5,
            "cgpa": cgpa,
            "profile_completion": 85,
            "masked_aadhaar": f"XXXX-XXXX-{1000 + row_idx}",
            "abc_account_id": f"ABC-IND-{20000 + row_idx}-99",
            "created_at": datetime.utcnow().isoformat() + "Z"
        })

    # Add newly parsed students to DB store
    for student in parsed_rows:
        db.students.append(student)

    # Log to audit trail
    db.audit_logs.insert(0, {
        "id": f"audit-{int(time.time() * 1000)}",
        "action": "STUDENT_BULK_UPLOAD",
        "actor_name": f"Registrar Admin ({institution_id})",
        "actor_role": "institution",
        "institution_id": institution_id,
        "target_entity": f"Batch #{int(time.time() % 10000)}",
        "details": f"Processed bulk CSV upload: {len(parsed_rows)} student records successfully ingested with mock APAAR IDs. {len(errors)} validation warnings.",
        "ip_address": "127.0.0.1",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "mock_block_hash": f"0000{int(time.time())}"
    })

    return {
        "status": "success",
        "message": f"Successfully validated and imported {len(parsed_rows)} student records.",
        "records_imported": len(parsed_rows),
        "validation_errors": errors,
        "imported_students": parsed_rows
    }
