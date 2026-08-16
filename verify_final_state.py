#!/usr/bin/env python3
"""Verify final state"""
import requests

BASE_URL = "http://localhost:3000/api"
ADMIN_EMAIL = "bachir.devops@gmail.com"
ADMIN_PASSWORD = "@26042026Admin"

# Login
response = requests.post(f"{BASE_URL}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
admin_cookie = response.cookies.get("ddh_token")

# Check jobs
response = requests.get(f"{BASE_URL}/vocational/jobs", timeout=20)
jobs = response.json().get("jobs", [])
print(f"📊 Active jobs: {len(jobs)} (expected: 2)")

# Check applications
response = requests.get(f"{BASE_URL}/admin/vocational-applications", cookies={"ddh_token": admin_cookie}, timeout=20)
apps = response.json().get("items", [])
test_apps = [a for a in apps if "test" in a.get("email", "").lower() or "voc.test" in a.get("email", "").lower()]
print(f"📊 Test applications: {len(test_apps)} (expected: 0)")
print(f"📊 Total applications: {len(apps)}")

if len(jobs) == 2 and len(test_apps) == 0:
    print("\n✅ Final state verified: 2 jobs, 0 test applications")
else:
    print("\n⚠️  Final state mismatch")
