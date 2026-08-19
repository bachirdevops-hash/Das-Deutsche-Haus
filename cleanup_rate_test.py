#!/usr/bin/env python3
"""Cleanup script for rate test applications"""
import requests

BASE_URL = "http://localhost:3000/api"
ADMIN_EMAIL = ""
ADMIN_PASSWORD = ""

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
admin_cookie = response.cookies.get("ddh_token")

if not admin_cookie:
    print("❌ Login failed")
    exit(1)

# Get all applications
response = requests.get(f"{BASE_URL}/admin/vocational-applications", cookies={"ddh_token": admin_cookie}, timeout=20)
apps = response.json().get("items", [])

# Delete rate test applications
rate_test_apps = [a for a in apps if "rate.test" in a.get("email", "").lower()]
print(f"Found {len(rate_test_apps)} rate test applications to delete")

for app in rate_test_apps:
    app_id = app.get("id")
    email = app.get("email")
    response = requests.delete(f"{BASE_URL}/admin/vocational-applications/{app_id}", cookies={"ddh_token": admin_cookie}, timeout=20)
    if response.status_code == 200:
        print(f"✅ Deleted {email}")
    else:
        print(f"❌ Failed to delete {email}: {response.status_code}")

print("✅ Cleanup complete")
