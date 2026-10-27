from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.db import db
from app.routers import (
    auth,
    students,
    credentials,
    consent,
    verification,
    institutions,
    anomalies,
    admin,
    audit,
    notifications
)

# Setup logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("shikshasetu")

app = FastAPI(
    title="ShikshaSetu AI API",
    description="Backend REST API for APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions. (Smart India Hackathon Prototype)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permissive for easy prototype evaluation
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all modular routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(credentials.router)
app.include_router(consent.router)
app.include_router(verification.router)
app.include_router(institutions.router)
app.include_router(anomalies.router)
app.include_router(admin.router)
app.include_router(audit.router)
app.include_router(notifications.router)

@app.get("/")
def root():
    return {
        "platform": "ShikshaSetu AI",
        "description": "APAAR ID-Based Student Data Management and Verification Platform for AICTE-Approved Institutions",
        "hackathon": "Smart India Hackathon Prototype",
        "status": "online",
        "prototype_rules": {
            "demo_data_only": True,
            "connected_to_real_apis": False,
            "privacy_by_design": "Consented fields only",
            "roles_supported": ["student", "institution", "verifier", "super_admin"]
        },
        "docs": "/docs"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ShikshaSetu AI Core Engine",
        "supabase_connected": db.supabase_client is not None,
        "database_mode": "Supabase PostgreSQL (Live)" if db.supabase_client else "Stateful Seeded Store (Demo Mode)",
        "cached_students_count": len(db.students),
        "cached_credentials_count": len(db.credentials)
    }

@app.post("/api/demo/reset")
def reset_demo_state():
    """Reset data state back to initial seed dataset for clean evaluation runs"""
    db.reset_to_seed()
    return {
        "status": "success",
        "message": "Demo data successfully reset to initial seed state."
    }
