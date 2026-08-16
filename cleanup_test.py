#!/usr/bin/env python3
"""
Cleanup script to delete test applications created during diagnostic testing
"""

import requests

BASE_URL = "https://www.das-deutsche-haus.com/api"
ADMIN_EMAIL = "bachir.devops@gmail.com"
ADMIN_PASSWORD = "@26042026Admin"

# Login as admin
response = requests.post(
    f"{BASE_URL}/auth/login",
    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
    timeout=20
)
admin_cookie = response.cookies.get("ddh_token")

if admin_cookie:
    print("✅ Admin login successful")
    
    # Get all applications
    response = requests.get(
        f"{BASE_URL}/admin/vocational-applications",
        cookies={"ddh_token": admin_cookie},
        timeout=20
    )
    
    if response.status_code == 200:
        items = response.json().get("items", [])
        
        # Find test applications (created in last hour with test emails)
        test_emails = ["abc", "test@example.com", "rate.test", "voc.test"]
        test_apps = [
            app for app in items
            if any(test_email in app.get("email", "") for test_email in test_emails)
        ]
        
        print(f"Found {len(test_apps)} test applications to delete")
        
        for app in test_apps:
            response = requests.delete(
                f"{BASE_URL}/admin/vocational-applications/{app['id']}",
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            if response.status_code == 200:
                print(f"✅ Deleted: {app['email']} ({app['id']})")
            else:
                print(f"❌ Failed to delete: {app['id']}")
        
        print(f"\n✅ Cleanup complete")
    else:
        print(f"❌ Failed to get applications: {response.status_code}")
else:
    print("❌ Admin login failed")
