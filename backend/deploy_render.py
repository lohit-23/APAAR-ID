import os
import requests

RENDER_API_KEY = "rnd_xxxELzI1jQWQteSKdZXDqapoaLqA"
OWNER_ID = "tea-dacnlim1egvs73d8u3h0"
REPO_URL = os.getenv("GITHUB_REPO_URL", "https://github.com/lohit-23/shikshasetu-ai")

SUPABASE_URL = "https://sznupbyahmpgtfcmaqul.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bnVwYnlhaG1wZ3RmY21hcXVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MzExMDc2MSwiZXhwIjoyMTA4Njg2NzYxfQ.sADuX7Ksw15X8bgOocguPhRTrW6MjUpXkKCdXjWaj7w"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6bnVwYnlhaG1wZ3RmY21hcXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxMTA3NjEsImV4cCI6MjEwODY4Njc2MX0.Kfu2EZw1vYxO9i1WV2MmI3cffxd8ys9Bu0Q6-dvRWLg"

headers = {
    "Authorization": f"Bearer {RENDER_API_KEY}",
    "Accept": "application/json",
    "Content-Type": "application/json"
}

def deploy_render():
    print(f"Deploying ShikshaSetu AI to Render using repository: {REPO_URL}...")

    # 1. Create Backend Web Service
    backend_payload = {
        "type": "web_service",
        "name": "shikshasetu-backend",
        "ownerId": OWNER_ID,
        "repo": REPO_URL,
        "branch": "main",
        "autoDeploy": "yes",
        "serviceDetails": {
            "env": "python",
            "plan": "free",
            "region": "oregon",
            "rootDir": "backend",
            "buildCommand": "pip install -r requirements.txt",
            "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
            "envVars": [
                {"key": "SUPABASE_URL", "value": SUPABASE_URL},
                {"key": "SUPABASE_KEY", "value": SUPABASE_KEY},
                {"key": "SUPABASE_ANON_KEY", "value": SUPABASE_ANON_KEY},
                {"key": "ENVIRONMENT", "value": "production"},
                {"key": "ALLOWED_ORIGINS", "value": '["*"]'}
            ]
        }
    }

    print("\n[1/2] Creating FastAPI Backend Web Service on Render...")
    r1 = requests.post("https://api.render.com/v1/services", headers=headers, json=backend_payload)
    backend_url = None
    if r1.status_code in [200, 201]:
        b_data = r1.json()
        backend_url = b_data.get("serviceDetails", {}).get("url")
        print(f"✓ Backend Service Created! ID: {b_data.get('id')} | Live URL: {backend_url}")
    else:
        print(f"Note/Error on Backend Service: {r1.status_code} - {r1.text}")

    # 2. Create Frontend Static Site
    frontend_payload = {
        "type": "static_site",
        "name": "shikshasetu-ui",
        "ownerId": OWNER_ID,
        "repo": REPO_URL,
        "branch": "main",
        "autoDeploy": "yes",
        "serviceDetails": {
            "rootDir": "frontend",
            "buildCommand": "npm install && npm run build",
            "publishPath": "dist",
            "routes": [
                {"type": "rewrite", "source": "/*", "destination": "/index.html"}
            ]
        }
    }

    print("\n[2/2] Creating React Frontend Static Site on Render...")
    r2 = requests.post("https://api.render.com/v1/services", headers=headers, json=frontend_payload)
    if r2.status_code in [200, 201]:
        f_data = r2.json()
        frontend_url = f_data.get("serviceDetails", {}).get("url")
        print(f"✓ Frontend Static Site Created! ID: {f_data.get('id')} | Live URL: {frontend_url}")
    else:
        print(f"Note/Error on Frontend Site: {r2.status_code} - {r2.text}")

if __name__ == "__main__":
    deploy_render()
