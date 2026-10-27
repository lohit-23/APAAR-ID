import io
import os
import zipfile
import requests

NETLIFY_TOKEN = "nfp_YGn6zSk75qGPN2EunrXW1ZU7JcdTsX6i61d0"
DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

def zip_dist_folder(dist_path):
    mem_zip = io.BytesIO()
    with zipfile.ZipFile(mem_zip, mode="w", compression=zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(dist_path):
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, dist_path)
                zf.write(abs_path, arcname=rel_path)
    mem_zip.seek(0)
    return mem_zip.getvalue()

def deploy_to_netlify():
    print(f"Reading and compressing build assets from: {DIST_DIR}...")
    if not os.path.exists(DIST_DIR):
        raise FileNotFoundError(f"Dist directory {DIST_DIR} not found. Run npm run build first.")
        
    zip_bytes = zip_dist_folder(DIST_DIR)
    print(f"Build zipped successfully: {len(zip_bytes)} bytes.")

    headers_auth = {"Authorization": f"Bearer {NETLIFY_TOKEN}"}

    # Step 1: Check if a site for shikshasetu already exists or create new
    site_id = None
    site_url = None
    sites_res = requests.get("https://api.netlify.com/api/v1/sites", headers=headers_auth)
    if sites_res.status_code == 200:
        for s in sites_res.json():
            if "shikshasetu" in s.get("name", "").lower():
                site_id = s.get("id")
                site_url = s.get("ssl_url") or s.get("url")
                print(f"Found existing Netlify site: {s.get('name')} (ID: {site_id})")
                break

    if not site_id:
        print("Creating new Netlify site for ShikshaSetu AI...")
        create_res = requests.post(
            "https://api.netlify.com/api/v1/sites",
            headers={"Authorization": f"Bearer {NETLIFY_TOKEN}", "Content-Type": "application/json"},
            json={"name": "shikshasetu-ai-aicte"}
        )
        if create_res.status_code in [200, 201]:
            site_data = create_res.json()
            site_id = site_data["id"]
            site_url = site_data.get("ssl_url") or site_data.get("url")
            print(f"Created Netlify site: {site_data['name']} (ID: {site_id})")
        else:
            # Fallback without custom name to avoid collision
            create_res2 = requests.post(
                "https://api.netlify.com/api/v1/sites",
                headers={"Authorization": f"Bearer {NETLIFY_TOKEN}", "Content-Type": "application/json"},
                json={}
            )
            site_data = create_res2.json()
            site_id = site_data["id"]
            site_url = site_data.get("ssl_url") or site_data.get("url")
            print(f"Created Netlify site with generated name: {site_data.get('name')} (ID: {site_id})")

    # Step 2: Deploy zip archive to the site
    print(f"Uploading deployment archive to Netlify site {site_id}...")
    deploy_res = requests.post(
        f"https://api.netlify.com/api/v1/sites/{site_id}/deploys",
        headers={"Authorization": f"Bearer {NETLIFY_TOKEN}", "Content-Type": "application/zip"},
        data=zip_bytes
    )

    if deploy_res.status_code in [200, 201]:
        deploy_data = deploy_res.json()
        live_url = deploy_data.get("ssl_url") or deploy_data.get("url") or site_url
        print(f"\n[SUCCESS] Deployed to Netlify Live URL: {live_url}")
        print(f"Deploy ID: {deploy_data.get('id')}")
        print(f"State: {deploy_data.get('state')}")
        return live_url
    else:
        print(f"Deploy failed with status {deploy_res.status_code}: {deploy_res.text}")
        return None

if __name__ == "__main__":
    deploy_to_netlify()
