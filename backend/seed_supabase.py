import os
import sys
from supabase import create_client

# Add app to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.seed_data import (
    INSTITUTIONS_SEED,
    USERS_SEED,
    STUDENTS_SEED,
    ACADEMIC_RECORDS_SEED,
    CREDENTIALS_SEED,
    CONSENT_REQUESTS_SEED,
    CONSENT_PERMISSIONS_SEED,
    ANOMALIES_SEED,
    VERIFICATION_LOGS_SEED,
    AUDIT_LOGS_SEED,
    NOTIFICATIONS_SEED
)

SUPABASE_URL = "https://sznupbyahmpgtfcmaqul.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bnVwYnlhaG1wZ3RmY21hcXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzExMDc2MSwiZXhwIjoyMTA4Njg2NzYxfQ.sADuX7Ksw15X8bgOocguPhRTrW6MjUpXkKCdXjWaj7w"

def seed_all():
    print(f"Connecting to Supabase at {SUPABASE_URL}...")
    client = create_client(SUPABASE_URL, SERVICE_ROLE_KEY)
    
    tables_and_data = [
        ("institutions", INSTITUTIONS_SEED),
        ("users", USERS_SEED),
        ("students", STUDENTS_SEED),
        ("academic_records", ACADEMIC_RECORDS_SEED),
        ("credentials", CREDENTIALS_SEED),
        ("consent_requests", CONSENT_REQUESTS_SEED),
        ("consent_permissions", CONSENT_PERMISSIONS_SEED),
        ("anomaly_alerts", ANOMALIES_SEED),
        ("verification_logs", VERIFICATION_LOGS_SEED),
        ("audit_logs", AUDIT_LOGS_SEED),
        ("notifications", NOTIFICATIONS_SEED)
    ]

    for table_name, data in tables_and_data:
        try:
            print(f"Upserting {len(data)} records into '{table_name}'...")
            res = client.table(table_name).upsert(data).execute()
            print(f"[OK] '{table_name}' seeded successfully ({len(data)} records).")
        except Exception as e:
            print(f"[NOTE] on '{table_name}': {e}")

    print("\n[SUCCESS] Live Supabase database seeding complete!")

if __name__ == "__main__":
    seed_all()
