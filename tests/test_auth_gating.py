#!/usr/bin/env python3
"""Quick test for auth gating scenarios"""

import requests
import time

BASE_URL = "https://telc-academy.preview.emergentagent.com"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

print("Testing Auth Gating Scenarios...")

# Test 1: Without cookie -> 401
print("\n1. Testing without cookie (expect 401)...")
try:
    response = requests.get(f"{BASE_URL}/api/admin/content/home_stats", timeout=20)
    print(f"   Status: {response.status_code}")
    if response.status_code == 401:
        print("   ✅ PASS - Returns 401 as expected")
    else:
        print(f"   ❌ FAIL - Expected 401, got {response.status_code}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

# Test 2: Login as super admin
print("\n2. Logging in as super admin...")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD},
        timeout=20
    )
    if response.status_code == 200:
        admin_cookie = response.cookies.get("ddh_token")
        print(f"   ✅ Login successful, cookie: {admin_cookie[:20]}...")
        
        # Test 3: With super_admin cookie -> 200
        print("\n3. Testing with super_admin cookie (expect 200)...")
        for attempt in range(3):
            try:
                response = requests.get(
                    f"{BASE_URL}/api/admin/content/home_stats",
                    cookies={"ddh_token": admin_cookie},
                    timeout=20
                )
                print(f"   Attempt {attempt+1}: Status {response.status_code}")
                if response.status_code == 200:
                    print("   ✅ PASS - Returns 200 as expected")
                    break
                elif response.status_code == 502:
                    print("   ⚠️ 502 error, retrying...")
                    time.sleep(2)
                else:
                    print(f"   ❌ FAIL - Expected 200, got {response.status_code}")
                    break
            except Exception as e:
                print(f"   ❌ ERROR on attempt {attempt+1}: {e}")
                if attempt < 2:
                    time.sleep(2)
        
        # Test 4: Create temp student and test 403
        print("\n4. Creating temp student and testing 403...")
        email = f"test_student_{int(time.time())}@test.com"
        try:
            signup_response = requests.post(
                f"{BASE_URL}/api/auth/signup",
                json={
                    "name": "Test Student",
                    "email": email,
                    "phone": "+963999999999",
                    "password": "TestPass123!"
                },
                timeout=20
            )
            if signup_response.status_code == 200:
                student_cookie = signup_response.cookies.get("ddh_token")
                print(f"   Student created: {email}")
                
                # Test with student cookie
                auth_response = requests.get(
                    f"{BASE_URL}/api/admin/content/home_stats",
                    cookies={"ddh_token": student_cookie},
                    timeout=20
                )
                print(f"   Status with student cookie: {auth_response.status_code}")
                if auth_response.status_code == 403:
                    print("   ✅ PASS - Returns 403 as expected")
                else:
                    print(f"   ❌ FAIL - Expected 403, got {auth_response.status_code}")
                
                # Cleanup
                print("\n5. Cleaning up temp student...")
                users_response = requests.get(
                    f"{BASE_URL}/api/admin/users",
                    cookies={"ddh_token": admin_cookie},
                    timeout=20
                )
                if users_response.status_code == 200:
                    users = users_response.json().get("users", [])
                    user = next((u for u in users if u.get("email") == email), None)
                    if user:
                        delete_response = requests.delete(
                            f"{BASE_URL}/api/admin/users/{user['id']}",
                            cookies={"ddh_token": admin_cookie},
                            timeout=20
                        )
                        if delete_response.status_code == 200:
                            print(f"   ✅ Cleaned up: {email}")
                        else:
                            print(f"   ⚠️ Failed to delete: {delete_response.status_code}")
            else:
                print(f"   ❌ Failed to create student: {signup_response.status_code}")
        except Exception as e:
            print(f"   ❌ ERROR: {e}")
    else:
        print(f"   ❌ Login failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ ERROR: {e}")

print("\n" + "="*60)
print("Auth Gating Tests Complete")
print("="*60)
