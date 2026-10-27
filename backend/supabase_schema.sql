-- =========================================================================
-- ShikshaSetu AI - Supabase PostgreSQL Schema & Security Policies
-- Problem Statement: APAAR ID-Based Student Data Management and Verification
--                    Platform for AICTE-Approved Institutions
-- Smart India Hackathon Prototype
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. INSTITUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.institutions (
    id VARCHAR(64) PRIMARY KEY,
    aicte_id VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL,
    state VARCHAR(64) NOT NULL,
    city VARCHAR(64) NOT NULL,
    type VARCHAR(64) NOT NULL,
    approval_status VARCHAR(64) DEFAULT 'AICTE Approved - Demo',
    accreditation VARCHAR(64),
    contact_email VARCHAR(128) NOT NULL,
    student_count INTEGER DEFAULT 0,
    credentials_issued INTEGER DEFAULT 0,
    pending_verifications INTEGER DEFAULT 0,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(128) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL CHECK (role IN ('student', 'institution', 'verifier', 'super_admin')),
    institution_id VARCHAR(64) REFERENCES public.institutions(id) ON DELETE SET NULL,
    student_id VARCHAR(64),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
    apaar_id VARCHAR(64) UNIQUE NOT NULL, -- e.g. APAAR-2024-8921-4402
    masked_apaar_id VARCHAR(64) NOT NULL, -- e.g. XXXX-XXXX-4402
    enrollment_number VARCHAR(64) NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    email VARCHAR(128) NOT NULL,
    masked_email VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    masked_phone VARCHAR(32) NOT NULL,
    institution_id VARCHAR(64) REFERENCES public.institutions(id) ON DELETE RESTRICT,
    institution_name VARCHAR(255) NOT NULL,
    program VARCHAR(128) NOT NULL,
    branch VARCHAR(128) NOT NULL,
    admission_year INTEGER NOT NULL,
    graduation_year INTEGER NOT NULL,
    current_semester INTEGER NOT NULL,
    cgpa NUMERIC(4, 2) NOT NULL,
    profile_completion INTEGER DEFAULT 80,
    avatar_url TEXT,
    masked_aadhaar VARCHAR(32) DEFAULT 'XXXX-XXXX-9142',
    abc_account_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ACADEMIC RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.academic_records (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    institution_id VARCHAR(64) REFERENCES public.institutions(id) ON DELETE RESTRICT,
    semester INTEGER NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    sgpa NUMERIC(4, 2) NOT NULL,
    cgpa NUMERIC(4, 2) NOT NULL,
    credits_registered INTEGER NOT NULL,
    credits_earned INTEGER NOT NULL,
    backlogs INTEGER DEFAULT 0,
    status VARCHAR(64) DEFAULT 'Passed',
    subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREDENTIALS TABLE (Degrees, Marksheets, Certificates, Internships, Badges)
CREATE TABLE IF NOT EXISTS public.credentials (
    id VARCHAR(64) PRIMARY KEY, -- e.g. CRED-DTU-2024-DEG-01
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    apaar_id VARCHAR(64) NOT NULL,
    institution_id VARCHAR(64) REFERENCES public.institutions(id) ON DELETE RESTRICT,
    institution_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    credential_type VARCHAR(32) NOT NULL CHECK (credential_type IN ('degree', 'marksheet', 'certificate', 'internship', 'skill_badge')),
    course VARCHAR(128) NOT NULL,
    grade VARCHAR(64),
    cgpa NUMERIC(4, 2),
    issue_date DATE NOT NULL,
    mock_hash VARCHAR(64) NOT NULL, -- SHA-256 style mock hash
    digital_signature TEXT NOT NULL,
    signature_status VARCHAR(64) DEFAULT 'Digitally Signed & Verified',
    is_tampered BOOLEAN DEFAULT FALSE,
    qr_code_payload TEXT NOT NULL,
    verification_link TEXT NOT NULL,
    mock_certificate_url TEXT,
    description TEXT,
    skills_covered JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONSENT REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.consent_requests (
    id VARCHAR(64) PRIMARY KEY,
    verifier_id VARCHAR(64) NOT NULL,
    verifier_name VARCHAR(128) NOT NULL,
    verifier_type VARCHAR(64) NOT NULL, -- Employer, University, Background Verification
    verifier_logo TEXT,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL,
    requested_fields JSONB NOT NULL DEFAULT '["profile", "degree"]'::jsonb,
    status VARCHAR(32) NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'revoked', 'expired')),
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    access_token VARCHAR(128) UNIQUE NOT NULL
);

-- 7. CONSENT PERMISSIONS TABLE (Granular Field Controls)
CREATE TABLE IF NOT EXISTS public.consent_permissions (
    id VARCHAR(64) PRIMARY KEY,
    consent_request_id VARCHAR(64) REFERENCES public.consent_requests(id) ON DELETE CASCADE,
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    share_profile BOOLEAN DEFAULT TRUE,
    share_degree BOOLEAN DEFAULT TRUE,
    share_marksheets BOOLEAN DEFAULT FALSE,
    share_certificates BOOLEAN DEFAULT FALSE,
    share_skills BOOLEAN DEFAULT TRUE,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. VERIFICATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.verification_logs (
    id VARCHAR(64) PRIMARY KEY,
    credential_id VARCHAR(64) NOT NULL,
    apaar_id VARCHAR(64),
    verifier_name VARCHAR(128) NOT NULL,
    verifier_ip VARCHAR(64) NOT NULL,
    verification_method VARCHAR(64) NOT NULL, -- qr_scan, direct_link, apaar_search, credential_id
    verification_state VARCHAR(32) NOT NULL CHECK (verification_state IN ('Verified', 'Invalid', 'Expired', 'Consent Required', 'Tampered')),
    consented_fields_visible JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 9. AUDIT LOGS TABLE (Immutable-Style Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    action VARCHAR(64) NOT NULL,
    actor_name VARCHAR(128) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    institution_id VARCHAR(64),
    target_entity VARCHAR(128) NOT NULL,
    details TEXT NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    mock_block_hash VARCHAR(64) NOT NULL
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(32) NOT NULL, -- consent, credential, verification, anomaly, system
    is_read BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action_url TEXT
);

-- 11. ANOMALY ALERTS TABLE (AI Anomaly Detection)
CREATE TABLE IF NOT EXISTS public.anomaly_alerts (
    id VARCHAR(64) PRIMARY KEY,
    alert_type VARCHAR(64) NOT NULL, -- duplicate_credential, cgpa_jump, invalid_date, missing_mandatory_doc
    student_id VARCHAR(64) REFERENCES public.students(id) ON DELETE CASCADE,
    student_name VARCHAR(128) NOT NULL,
    apaar_id VARCHAR(64) NOT NULL,
    institution_id VARCHAR(64) REFERENCES public.institutions(id) ON DELETE RESTRICT,
    institution_name VARCHAR(255) NOT NULL,
    confidence_score NUMERIC(3, 2) NOT NULL, -- e.g. 0.94
    severity VARCHAR(16) NOT NULL CHECK (severity IN ('high', 'medium', 'low')),
    description TEXT NOT NULL,
    recommended_action TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'flagged' CHECK (status IN ('flagged', 'reviewing', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anomaly_alerts ENABLE ROW LEVEL SECURITY;

-- Students can view only their own records
CREATE POLICY "Students view own profile" 
ON public.students FOR SELECT 
USING (auth.uid()::text = user_id OR auth.role() = 'service_role');

-- Students manage their own consent permissions
CREATE POLICY "Students manage own consent" 
ON public.consent_permissions FOR ALL 
USING (student_id IN (SELECT id FROM public.students WHERE user_id = auth.uid()::text) OR auth.role() = 'service_role');

-- Institutions can manage credentials for their enrolled students
CREATE POLICY "Institutions manage own credentials" 
ON public.credentials FOR ALL 
USING (institution_id IN (SELECT institution_id FROM public.users WHERE id = auth.uid()::text) OR auth.role() = 'service_role');

-- Verifiers can view credentials ONLY if active consent permission exists
CREATE POLICY "Verifiers view consented credentials only" 
ON public.credentials FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.consent_permissions cp
        WHERE cp.student_id = public.credentials.student_id
          AND cp.is_active = TRUE
          AND cp.valid_until > NOW()
    ) OR auth.role() = 'service_role'
);

-- Audit logs are append-only and readable by Super Admin & Auditors
CREATE POLICY "Auditors can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (TRUE);
