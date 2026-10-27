import copy
import logging
from typing import Dict, List, Any, Optional
from app.config import settings
from app.seed_data import (
    INSTITUTIONS_SEED,
    STUDENTS_SEED,
    USERS_SEED,
    CREDENTIALS_SEED,
    ACADEMIC_RECORDS_SEED,
    CONSENT_REQUESTS_SEED,
    CONSENT_PERMISSIONS_SEED,
    ANOMALIES_SEED,
    VERIFICATION_LOGS_SEED,
    AUDIT_LOGS_SEED,
    NOTIFICATIONS_SEED
)

logger = logging.getLogger("shikshasetu.db")

class DatabaseStore:
    def __init__(self):
        self.institutions: List[Dict[str, Any]] = copy.deepcopy(INSTITUTIONS_SEED)
        self.students: List[Dict[str, Any]] = copy.deepcopy(STUDENTS_SEED)
        self.users: List[Dict[str, Any]] = copy.deepcopy(USERS_SEED)
        self.credentials: List[Dict[str, Any]] = copy.deepcopy(CREDENTIALS_SEED)
        self.academic_records: List[Dict[str, Any]] = copy.deepcopy(ACADEMIC_RECORDS_SEED)
        self.consent_requests: List[Dict[str, Any]] = copy.deepcopy(CONSENT_REQUESTS_SEED)
        self.consent_permissions: List[Dict[str, Any]] = copy.deepcopy(CONSENT_PERMISSIONS_SEED)
        self.anomalies: List[Dict[str, Any]] = copy.deepcopy(ANOMALIES_SEED)
        self.verification_logs: List[Dict[str, Any]] = copy.deepcopy(VERIFICATION_LOGS_SEED)
        self.audit_logs: List[Dict[str, Any]] = copy.deepcopy(AUDIT_LOGS_SEED)
        self.notifications: List[Dict[str, Any]] = copy.deepcopy(NOTIFICATIONS_SEED)
        
        self.supabase_client = None
        self._init_supabase()

    def _init_supabase(self):
        if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
            try:
                from supabase import create_client
                self.supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
                logger.info("Successfully initialized connection to Supabase cloud database.")
            except Exception as e:
                logger.warning(f"Could not connect to Supabase: {e}. Falling back to stateful prototype store.")
                self.supabase_client = None
        else:
            logger.info("Running in demo mode with seeded local store. (Add SUPABASE_URL and SUPABASE_KEY to .env to connect live Supabase)")

    def reset_to_seed(self):
        """Reset state back to initial prototype seed for demonstration purposes"""
        self.institutions = copy.deepcopy(INSTITUTIONS_SEED)
        self.students = copy.deepcopy(STUDENTS_SEED)
        self.users = copy.deepcopy(USERS_SEED)
        self.credentials = copy.deepcopy(CREDENTIALS_SEED)
        self.academic_records = copy.deepcopy(ACADEMIC_RECORDS_SEED)
        self.consent_requests = copy.deepcopy(CONSENT_REQUESTS_SEED)
        self.consent_permissions = copy.deepcopy(CONSENT_PERMISSIONS_SEED)
        self.anomalies = copy.deepcopy(ANOMALIES_SEED)
        self.verification_logs = copy.deepcopy(VERIFICATION_LOGS_SEED)
        self.audit_logs = copy.deepcopy(AUDIT_LOGS_SEED)
        self.notifications = copy.deepcopy(NOTIFICATIONS_SEED)

db = DatabaseStore()
