# 🇮🇳 ShikshaSetu AI (शिक्षासेतु AI)

> **Smart India Hackathon (SIH) Prototype**  
> **Problem Statement:** *“Development of an APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions.”*

---

## 🌟 Overview & Value Proposition

**ShikshaSetu AI** is a full-stack, privacy-first, and tamper-evident student data management and credential verification ecosystem designed in alignment with the **National Education Policy (NEP 2020)** and **AICTE Guidelines**.

It establishes a unified platform anchored on the **Automated Permanent Academic Account Registry (APAAR ID)** — *“One Nation, One Student ID”* — enabling AICTE-approved higher educational institutions to issue cryptographically signed academic credentials (degrees, consolidated semester marksheets, micro-credentials, and internship certifications) while empowering students with sovereign, granular consent management under the **Digital Personal Data Protection (DPDP) Act 2023**.

---

## 🔒 Important Prototype Disclaimers

> [!IMPORTANT]
> **DEMO / PROTOTYPE DATA ONLY**
> - This platform is an engineering demonstration prototype developed for the Smart India Hackathon.
> - It **does NOT connect to real APAAR, Aadhaar, DigiLocker, AICTE, or government APIs**.
> - All students, enrollment records, APAAR IDs, and institutional metrics are **strictly fictional**.
> - All personally identifiable information is masked (e.g., `XXXX-XXXX-4402`, `aa***ma@dtu.ac.in`).
> - **Privacy-by-Design:** Verifiers can only inspect data fields for which the student has granted active, unexpired consent.

---

## 🚀 Key Features by User Role

### 1. 🎓 Student Portal
- **APAAR Digital ID Card:** Interactive national identity card displaying masked mock APAAR ID (`XXXX-XXXX-4402`), Academic Bank of Credits (ABC) ID, and institutional credentials.
- **Academic Credential Wallet:** Unified repository for Degrees, Consolidated Marksheets, AICTE-NEAT Skill Badges, and Research Internships.
- **Cryptographic Trust & QR Codes:** Each asset features a unique credential ID, SHA-256 content hash, digital signature certificate, and live dynamic QR verification code.
- **Granular Consent Manager:** Review, approve, reject, or revoke access requests from employers and universities. Toggle granular field sharing (*Profile*, *Degree*, *Marksheets*, *Certificates*, *Skills*).
- **Time-Limited Sharing Links:** Generate secure self-verification links with configurable expiry (1 hour, 24 hours, 7 days).
- **Prototype AI Insights:** AI engine that audits graduation readiness, flags missing documents (e.g., mandatory 8-week AICTE internship), recommends career skill badges, and summarizes cohort strengths.

### 2. 🏛️ Institution Admin Portal
- **Institutional Command Center:** Real-time statistics on total students, credentials issued, pending verifications, and active fraud anomalies.
- **Credential Issuing Form:** Live interactive form with real-time SHA-256 cryptographic hash computation as the administrator types, digital signature simulation, and mock certificate attachment.
- **Student Directory & Dossiers:** Search students across programs using mock APAAR ID, enrollment number, or name.
- **Bulk CSV Ingestion:** Drag-and-drop / paste interface for student cohorts with syntax validation, CGPA boundary checks, and batch APAAR ID generation.
- **Data Quality & AI Sentinel:** Real-time auditor detecting incomplete records, duplicate certificates, non-existent calendar dates, and statistical CGPA inflation.

### 3. 🔍 Verifier Gateway (Employers & Universities)
- **Zero-Trust Public Portal:** Query records via Credential ID, mock APAAR ID, verification code, or QR scan.
- **5 Comprehensive Verification States:**
  1. `Verified` (Green): Cryptographically authentic and backed by active consent.
  2. `Tampered` (Red Alert): Visual tamper-detection indicator highlighting checksum mismatches and altered parameters.
  3. `Expired` (Orange): Access permission window has lapsed.
  4. `Consent Required` (Yellow): Student has not authorized disclosure to this organization.
  5. `Invalid` (Gray): Non-existent identifier.
- **Privacy Enforcement:** Displays **only consented fields**; unapproved fields remain shielded.

### 4. ⚙️ Super Admin (AICTE Apex Consortium Node)
- **Pan-Institutional Analytics:** Comprehensive monitoring of issued credentials, verifications, consent requests, and fraud flags.
- **Institution Approval Management:** Review and approve demo institutions with compliance toggles.
- **Immutable Audit Trail:** Append-only cryptographic ledger tracking every credential issuance, verification query, and consent modification.
- **System Health & Hash Continuity:** Mock blockchain Proof-of-Authority validator nodes and block hash chain inspection.

---

## 🏗️ Architecture & Folder Structure

```
apaar id sih/
├── backend/                        # Python FastAPI Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py              # Environment & application settings
│   │   ├── db.py                  # Supabase client + local stateful seeded store
│   │   ├── models.py              # Pydantic data schemas
│   │   ├── seed_data.py           # Comprehensive fictional seed dataset
│   │   ├── main.py                # Root FastAPI app, CORS, and route registration
│   │   └── routers/
│   │       ├── admin.py           # Super Admin analytics and institution approvals
│   │       ├── anomalies.py       # AI anomaly detection and resolution
│   │       ├── audit.py           # Immutable audit log queries
│   │       ├── auth.py            # Role switching & demo authentication
│   │       ├── consent.py         # Consent requests & time-limited share links
│   │       ├── credentials.py     # Credential issuance, hashes, tamper toggle
│   │       ├── institutions.py    # Institution metrics, search, bulk CSV upload
│   │       ├── notifications.py   # Real-time notification feed
│   │       ├── students.py        # Student profile, records, and AI insights
│   │       └── verification.py    # Public verification engine & privacy filter
│   ├── supabase_schema.sql        # Supabase PostgreSQL DDL, tables, RLS policies
│   ├── requirements.txt           # Python package dependencies
│   └── .env.example               # Backend environment variables
│
├── frontend/                       # React.js + Vite Frontend
│   ├── src/
│   │   ├── api.js                 # Unified API service for FastAPI REST endpoints
│   │   ├── App.jsx                # Main application component & router
│   │   ├── index.css              # Tailwind CSS v4 styling & theme tokens
│   │   ├── main.jsx               # React DOM entrypoint
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Role switcher, toasts, and demo state
│   │   ├── components/
│   │   │   ├── CertificateModal.jsx # Official certificate renderer with mock PDF export
│   │   │   ├── DemoBanner.jsx     # Top persistent SIH prototype disclaimer
│   │   │   ├── Footer.jsx         # Indian Ed-Tech footer
│   │   │   ├── Navbar.jsx         # Header with Tricolor ribbon & role switcher
│   │   │   ├── QRCodeModal.jsx    # Interactive QR code modal (qrcode.react)
│   │   │   └── Toast.jsx          # Toast notifications
│   │   └── pages/
│   │       ├── AcademicRecordsPage.jsx # Marksheets & progression charts (Recharts)
│   │       ├── AiInsightsPage.jsx      # Prototype AI Insight advisory
│   │       ├── AuditLogsPage.jsx       # Full filterable audit ledger
│   │       ├── BulkUploadPage.jsx      # Bulk student CSV ingestion
│   │       ├── ConsentManagerPage.jsx  # Granular consent & time-limited links
│   │       ├── CredentialWalletPage.jsx# Verifiable credentials & tamper toggle
│   │       ├── DataQualityPage.jsx     # Data health & AI anomaly sentinel
│   │       ├── InstitutionDashboard.jsx# Institutional metrics & charts
│   │       ├── IssueCredentialPage.jsx # Credential issuance with live hash
│   │       ├── LandingPage.jsx         # Hero, quick verify, and role showcase
│   │       ├── LoginPage.jsx           # Evaluator 1-click persona switcher
│   │       ├── NotificationsPage.jsx   # System alerts
│   │       ├── SettingsPage.jsx        # Security parameters & demo reset
│   │       ├── StudentDashboard.jsx    # APAAR card, timeline, performance
│   │       ├── StudentDirectoryPage.jsx# Directory search & student dossiers
│   │       ├── SuperAdminDashboard.jsx # Pan-institutional central console
│   │       └── VerifierPortalPage.jsx  # 5-state zero-trust verification gateway
│   ├── package.json
│   ├── vite.config.js             # Vite configuration with Tailwind v4 & API proxy
│   └── .env.example               # Frontend environment variables
│
└── README.md                       # Comprehensive documentation
```

---

## 🗄️ Core Database Tables

The application defines and seeds the 11 core tables specified in the requirements:

| Table | Description |
|---|---|
| `users` | User accounts, credentials, demo roles (`student`, `institution`, `verifier`, `super_admin`). |
| `institutions` | AICTE-approved demo institutions (DTU, VJTI, IIT Bombay Extension). |
| `students` | Fictional student dossiers with mock APAAR IDs, masked Aadhaar, ABC IDs, and programs. |
| `academic_records` | Semester-wise subject grades, credits registered, credits earned, SGPA, and CGPA. |
| `credentials` | Degrees, marksheets, skill badges, internships with SHA-256 hashes and digital signatures. |
| `consent_requests` | Access requests from third parties with purposes, expiry dates, and access tokens. |
| `consent_permissions` | Granular boolean flags (*share_profile*, *share_degree*, *share_marksheets*, etc.). |
| `verification_logs` | Audit record of every verification attempt, timestamp, IP, and evaluated state. |
| `audit_logs` | Immutable audit trail with SHA-256 block hash continuity across all actions. |
| `notifications` | Alerts for incoming consent requests, newly issued credentials, and verification events. |
| `anomaly_alerts` | Machine learning flags for duplicate credentials, CGPA spikes, and missing documents. |

---

## 🛠️ Setup & Installation Instructions

### Prerequisites
- **Node.js** (v18 or newer; v24 recommended) & **npm**
- **Python** (v3.10 to v3.14) & **pip**

---

### Step 1: Backend Setup (FastAPI)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```
   *(Note: If you do not have Supabase keys yet, ShikshaSetu automatically runs in local demo mode with complete seed data!)*

5. Start the FastAPI server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Root: `http://127.0.0.1:8000`
   - Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

---

### Step 2: Frontend Setup (React + Vite)

1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration:
   ```bash
   cp .env.example .env
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend Application: `http://localhost:5173`

---

### Step 3: Supabase PostgreSQL Setup (Optional / Production)

If connecting to a live Supabase project:
1. Create a new project in the [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase project.
3. Open `backend/supabase_schema.sql` and run the entire script. It creates all tables, foreign keys, and Row Level Security (RLS) policies.
4. Copy your **Project URL** and **anon/service_role key** into `backend/.env` and `frontend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-supabase-key
   ```
5. Restart the backend server. It will detect the credentials and log:  
   `"Successfully initialized connection to Supabase cloud database."`

---

## 🧪 Hackathon Evaluation Test Cases (Quick Presets)

Use the following pre-configured test scenarios in the **Verifier Portal (`/verify`)** or the landing page search bar:

1. **Successful Verification Case (Authentic Degree):**
   - **Identifier:** `CRED-DTU-2024-DEG-01`
   - **Verifier:** `Tata Consultancy Services (TCS)`
   - **Token:** `TCS-GRANT-TOKEN-9981-ACTIVE`
   - **Result:** `Verified (Green)`. Confetti triggers; only consented fields (*Profile*, *Degree*, *Skills*) are displayed.

2. **Tampered Credential Alert (Tamper Detection):**
   - **Identifier:** `CRED-TAMPERED-MOCK-99`
   - **Result:** `Tampered (Red Alert)`. Visual tamper-detection indicator displays checksum mismatch against original registered hash.

3. **Expired Consent Case:**
   - **Identifier:** `CRED-DTU-2024-DEG-01`
   - **Verifier:** `Infosys Technologies Ltd`
   - **Token:** `INFY-GRANT-TOKEN-EXPIRED-001`
   - **Result:** `Expired (Orange)`. Explains that the student’s grant window expired on `2024-06-01`.

4. **Zero-Trust Consent Required Case:**
   - **Identifier:** `CRED-DTU-2024-DEG-01`
   - **Verifier:** `Unknown Third-Party Employer`
   - **Result:** `Consent Required (Yellow)`. Record is sealed to protect candidate privacy under DPDP Act 2023.

5. **AI Anomaly Detection Section:**
   - Visit **Data Quality & AI Sentinel** (`/institution/quality`) under the **Institution Admin** role.
   - Observe **Alert #ANOM-2024-DUP-102**: Duplicate marksheet hash collision between DTU and VJTI flagged with **94% confidence** and recommended action.

---

## 🎨 Design System & Aesthetic

- **Color Palette:** Deep Ashoka Navy (`#0B2545`, `#1E3A8A`), National Saffron accents (`#F97316`), Indian Green accents (`#16A34A`), Slate neutrals (`#F8FAFC`, `#0F172A`).
- **Typography:** Inter (Primary UI) and Poppins (Headings) via Google Fonts.
- **Components:** Interactive SVG QR codes (`qrcode.react`), responsive charts (`recharts`), celebratory interactions (`canvas-confetti`), glassmorphism cards, and Lucide React icons.

---

## 📄 License
This prototype is released under the **MIT License** for the Smart India Hackathon.
