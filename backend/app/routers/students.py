from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from app.db import db

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("")
def list_students(
    search: Optional[str] = Query(None, description="Search by Name, APAAR ID, or Enrollment"),
    institution_id: Optional[str] = None
):
    """List students with search filter"""
    results = db.students
    if institution_id:
        results = [s for s in results if s["institution_id"] == institution_id]
        
    if search:
        s_lower = search.lower().strip()
        results = [
            s for s in results
            if s_lower in s["full_name"].lower()
            or s_lower in s["apaar_id"].lower()
            or s_lower in s["enrollment_number"].lower()
            or s_lower in s["program"].lower()
        ]
        
    return {
        "status": "success",
        "count": len(results),
        "data": results
    }

@router.get("/{student_id}")
def get_student_detail(student_id: str):
    """Get single student profile"""
    student = next((s for s in db.students if s["id"] == student_id or s["apaar_id"] == student_id), None)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
        
    institution = next((i for i in db.institutions if i["id"] == student["institution_id"]), None)
    credentials = [c for c in db.credentials if c["student_id"] == student["id"]]
    academic_records = [r for r in db.academic_records if r["student_id"] == student["id"]]
    
    return {
        "status": "success",
        "data": {
            **student,
            "institution": institution,
            "credentials_count": len(credentials),
            "academic_records_count": len(academic_records)
        }
    }

@router.get("/{student_id}/ai-insights")
def get_student_ai_insights(student_id: str):
    """
    AI Insights panel labelled “Prototype AI Insight” that:
    1. Identifies missing documents
    2. Suggests skills
    3. Summarises academic strengths
    """
    student = next((s for s in db.students if s["id"] == student_id), None)
    if not student:
        student = db.students[0] # Fallback to first student for demo
        
    credentials = [c for c in db.credentials if c["student_id"] == student["id"]]
    records = [r for r in db.academic_records if r["student_id"] == student["id"]]
    
    has_degree = any(c["credential_type"] == "degree" for c in credentials)
    has_internship = any(c["credential_type"] == "internship" for c in credentials)
    has_skills = any(c["credential_type"] == "skill_badge" for c in credentials)
    
    missing_docs = []
    if not has_internship:
        missing_docs.append({
            "title": "Mandatory AICTE Industrial Internship Certificate",
            "urgency": "High",
            "reason": "AICTE 2024 Guidelines require a minimum 8-week accredited internship before final degree conferral.",
            "action": "Upload signed employer certificate from AICTE Internship Portal"
        })
    has_capstone = any(s.get("code") == "CO-312" for r in records for s in r.get("subjects", []))
    if student["current_semester"] >= 7 and not has_capstone:
        missing_docs.append({
            "title": "Major Capstone Project Evaluation Synopsis",
            "urgency": "Medium",
            "reason": "Departmental evaluation rubric requires approved capstone project synopsis.",
            "action": "Request digital signature from Faculty Guide"
        })
    if not student.get("abc_account_id"):
        missing_docs.append({
            "title": "Academic Bank of Credits (ABC) ID Linkage",
            "urgency": "Low",
            "reason": "National Education Policy (NEP 2020) credit portability mandate.",
            "action": "Sync via DigiLocker / ABC.gov.in"
        })

    # Recommended skills based on current branch
    recommended_skills = [
        {
            "name": "AICTE Generative AI & Prompt Engineering Badge",
            "category": "Artificial Intelligence",
            "match_rate": "96% match with your B.Tech curriculum",
            "provider": "AICTE NEAT / Intel AI for Youth",
            "estimated_hours": 30
        },
        {
            "name": "Cloud Native Kubernetes Application Developer",
            "category": "Cloud Computing",
            "match_rate": "92% match with Cloud Computing course",
            "provider": "Linux Foundation / AICTE Portal",
            "estimated_hours": 45
        },
        {
            "name": "Zero-Trust Cybersecurity Architecture",
            "category": "Security",
            "match_rate": "88% career relevance for SDE roles",
            "provider": "CERT-In / NASSCOM FutureSkills",
            "estimated_hours": 25
        }
    ]

    # Academic strengths summary
    academic_strengths = {
        "overall_classification": "Elite Academic Standout (Top 5% in Cohort)",
        "cgpa_performance": f"Cumulative Grade Point Average of {student['cgpa']} with consistent upward trajectory across all semesters.",
        "core_domains": ["Distributed Systems", "Compiler Design", "Algorithms & Data Structures", "Artificial Intelligence"],
        "credit_health": "100% On-Track. 142/160 required NEP degree credits completed with Zero active or historical backlogs.",
        "readiness_index": 94,
        "tamper_proof_integrity_score": "100% Cryptographically Verified"
    }

    return {
        "status": "success",
        "student_id": student["id"],
        "label": "Prototype AI Insight",
        "disclaimer": "Generated by Prototype Machine Learning Engine. Demonstration Data Only.",
        "insights": {
            "profile_completion": student["profile_completion"],
            "missing_documents": missing_docs,
            "recommended_skills": recommended_skills,
            "academic_strengths": academic_strengths,
            "generated_at": "2024-10-27T10:00:00Z"
        }
    }

@router.get("/{student_id}/records")
def get_student_records(student_id: str):
    """Get semester marksheets and grade progression"""
    student = next((s for s in db.students if s["id"] == student_id), None)
    records = [r for r in db.academic_records if r["student_id"] == student_id]
    
    # If student has no specific seeded academic records, build mock semester records from student's CGPA
    if not records and student:
        records = [
            {
                "id": f"rec-{student_id}-sem4",
                "student_id": student_id,
                "institution_id": student["institution_id"],
                "semester": 4,
                "academic_year": "2023-2024",
                "sgpa": student["cgpa"],
                "cgpa": student["cgpa"],
                "credits_registered": 22,
                "credits_earned": 22,
                "backlogs": 0,
                "status": "Passed",
                "subjects": [
                    {"code": "CS-401", "name": "Operating Systems", "credits": 4, "grade": "A+", "max_marks": 100, "obtained_marks": 88},
                    {"code": "CS-402", "name": "Computer Networks", "credits": 4, "grade": "O", "max_marks": 100, "obtained_marks": 94},
                    {"code": "CS-403", "name": "Database Management", "credits": 4, "grade": "A+", "max_marks": 100, "obtained_marks": 90}
                ]
            }
        ]
        
    return {
        "status": "success",
        "student_id": student_id,
        "count": len(records),
        "data": records
    }

@router.get("/{student_id}/timeline")
def get_student_timeline(student_id: str):
    """Academic timeline of milestones, enrollments, credentials, verifications"""
    timeline = [
        {
            "date": "2021-08-16",
            "type": "enrollment",
            "title": "Admitted to B.Tech Computer Engineering",
            "institution": "Delhi Technological University (DTU)",
            "description": "Enrolled via Joint Admission Counseling (JAC Delhi). Mock APAAR ID issued and linked to Academic Bank of Credits (ABC).",
            "icon": "school"
        },
        {
            "date": "2023-06-20",
            "type": "milestone",
            "title": "Completed 4th Semester with 9.20 SGPA",
            "institution": "Delhi Technological University (DTU)",
            "description": "Crossed 90 NEP credit milestone with First Class Distinction.",
            "icon": "award"
        },
        {
            "date": "2024-03-15",
            "type": "credential",
            "title": "Issued AICTE-NEAT Cloud Native Badge",
            "institution": "AICTE NEAT Portal",
            "description": "Cryptographically signed credential registered to student's APAAR ID wallet.",
            "icon": "shield-check"
        },
        {
            "date": "2024-06-25",
            "type": "credential",
            "title": "Issued Official B.Tech Provisional Degree",
            "institution": "DTU Examination Cell",
            "description": "SHA-256 Mock Hash anchored on immutable tamper-evident registry.",
            "icon": "graduation-cap"
        },
        {
            "date": "2024-10-25",
            "type": "verification",
            "title": "Verified by Tata Consultancy Services (TCS)",
            "institution": "Employer Verification Gateway",
            "description": "Full verification check completed with student's active consent.",
            "icon": "check-circle"
        }
    ]
    return {
        "status": "success",
        "data": timeline
    }
