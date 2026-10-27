from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    STUDENT = "student"
    INSTITUTION = "institution"
    VERIFIER = "verifier"
    SUPER_ADMIN = "super_admin"

class CredentialType(str, Enum):
    DEGREE = "degree"
    MARKSHEET = "marksheet"
    CERTIFICATE = "certificate"
    INTERNSHIP = "internship"
    SKILL_BADGE = "skill_badge"

class VerificationState(str, Enum):
    VERIFIED = "Verified"
    INVALID = "Invalid"
    EXPIRED = "Expired"
    CONSENT_REQUIRED = "Consent Required"
    TAMPERED = "Tampered"

class ConsentStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVOKED = "revoked"
    EXPIRED = "expired"

# ---------------- Database Entities ---------------- #

class User(BaseModel):
    id: str
    email: str
    full_name: str
    role: UserRole
    institution_id: Optional[str] = None
    student_id: Optional[str] = None
    avatar_url: Optional[str] = None
    created_at: str

class Institution(BaseModel):
    id: str
    aicte_id: str
    name: str
    code: str
    state: str
    city: str
    type: str # e.g. "State University", "Autonomous", "Institute of National Importance"
    approval_status: str # "AICTE Approved - Demo", "Pending Review", "Active"
    accreditation: str # "NAAC A++", "NBA Accredited"
    contact_email: str
    student_count: int
    credentials_issued: int
    pending_verifications: int
    logo_url: Optional[str] = None

class Student(BaseModel):
    id: str
    user_id: str
    apaar_id: str # e.g. "APAAR-2024-8921-4402"
    masked_apaar_id: str # e.g. "XXXX-XXXX-4402"
    enrollment_number: str
    full_name: str
    email: str
    masked_email: str
    phone: str
    masked_phone: str
    institution_id: str
    institution_name: str
    program: str # "B.Tech Computer Science & Engineering"
    branch: str
    admission_year: int
    graduation_year: int
    current_semester: int
    cgpa: float
    profile_completion: int # percentage, e.g. 85
    avatar_url: Optional[str] = None
    masked_aadhaar: str # "XXXX-XXXX-9142"
    abc_account_id: str # "ABC-IND-99210-441"
    created_at: str

class SubjectGrade(BaseModel):
    code: str
    name: str
    credits: int
    grade: str
    max_marks: int = 100
    obtained_marks: int

class AcademicRecord(BaseModel):
    id: str
    student_id: str
    institution_id: str
    semester: int
    academic_year: str
    sgpa: float
    cgpa: float
    credits_registered: int
    credits_earned: int
    backlogs: int
    status: str # "Passed", "Promoted"
    subjects: List[SubjectGrade] = []

class Credential(BaseModel):
    id: str # e.g. "CRED-DTU-2024-DEG-01"
    student_id: str
    student_name: str
    apaar_id: str
    institution_id: str
    institution_name: str
    title: str
    credential_type: CredentialType
    course: str
    grade: Optional[str] = None
    cgpa: Optional[float] = None
    issue_date: str
    mock_hash: str # SHA-256 style mock cryptographic hash
    digital_signature: str
    signature_status: str # "Digitally Signed & Verified", "Signature Tampered", "Pending"
    is_tampered: bool = False
    qr_code_payload: str
    verification_link: str
    mock_certificate_url: Optional[str] = None
    description: Optional[str] = None
    skills_covered: List[str] = []

class ConsentRequest(BaseModel):
    id: str
    verifier_id: str
    verifier_name: str
    verifier_type: str # "Employer", "University", "Background Verification Agency"
    verifier_logo: Optional[str] = None
    student_id: str
    purpose: str
    requested_fields: List[str] # ["profile", "degree", "marksheets", "certificates", "skills"]
    status: ConsentStatus
    requested_at: str
    valid_until: str
    access_token: str

class ConsentPermission(BaseModel):
    id: str
    consent_request_id: str
    student_id: str
    share_profile: bool = True
    share_degree: bool = True
    share_marksheets: bool = False
    share_certificates: bool = False
    share_skills: bool = True
    valid_until: str
    is_active: bool = True
    created_at: str

class VerificationLog(BaseModel):
    id: str
    credential_id: str
    apaar_id: Optional[str] = None
    verifier_name: str
    verifier_ip: str
    verification_method: str # "qr_scan", "direct_link", "apaar_search", "credential_id"
    verification_state: VerificationState
    consented_fields_visible: List[str] = []
    timestamp: str
    notes: Optional[str] = None

class AuditLog(BaseModel):
    id: str
    action: str # "CREDENTIAL_ISSUED", "CREDENTIAL_VERIFIED", "CONSENT_APPROVED", "CONSENT_REVOKED", "CREDENTIAL_TAMPERED", "STUDENT_ENROLLED"
    actor_name: str
    actor_role: str
    institution_id: Optional[str] = None
    target_entity: str
    details: str
    ip_address: str
    timestamp: str
    mock_block_hash: str # immutable-style hash chain

class Notification(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    type: str # "consent", "credential", "verification", "anomaly", "system"
    is_read: bool = False
    timestamp: str
    action_url: Optional[str] = None

class AnomalyAlert(BaseModel):
    id: str
    alert_type: str # "duplicate_credential", "cgpa_jump", "invalid_date", "missing_mandatory_doc"
    student_id: str
    student_name: str
    apaar_id: str
    institution_id: str
    institution_name: str
    confidence_score: float # 0.0 - 1.0 (e.g. 0.94)
    severity: str # "high", "medium", "low"
    description: str
    recommended_action: str
    status: str # "flagged", "reviewing", "resolved"
    created_at: str

# ---------------- API Payloads ---------------- #

class IssueCredentialPayload(BaseModel):
    student_id: str
    institution_id: str
    title: str
    credential_type: CredentialType
    course: str
    grade: Optional[str] = None
    cgpa: Optional[float] = None
    issue_date: str
    skills_covered: List[str] = []
    description: Optional[str] = None

class UpdateConsentPayload(BaseModel):
    status: ConsentStatus
    share_profile: bool = True
    share_degree: bool = True
    share_marksheets: bool = False
    share_certificates: bool = False
    share_skills: bool = True
    valid_until: Optional[str] = None

class CreateTimeLimitedSharePayload(BaseModel):
    student_id: str
    duration_hours: int = 24
    share_profile: bool = True
    share_degree: bool = True
    share_marksheets: bool = False
    share_certificates: bool = False
    share_skills: bool = True
    purpose: str = "Candidate Self-Verification Sharing Link"

class VerifyRequestPayload(BaseModel):
    identifier: str # APAAR ID, Credential ID, or QR payload
    verifier_name: Optional[str] = "Independent Verifier"
    access_token: Optional[str] = None
