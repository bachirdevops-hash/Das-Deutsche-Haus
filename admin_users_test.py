#!/usr/bin/env python3
"""
Admin User Creation Testing — Auto-Generate Password + Remove Google OAuth
Tests the updated POST /api/admin/users endpoint and removal of Google OAuth status endpoint.
"""

import requests
import time
import json
import re
from datetime import datetime

# Configuration
BASE_URL = "https://telc-academy.preview.emergentagent.com/api"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

# Test data storage for cleanup
test_data = {
    "users": [],  # {id, email}
    "leads": [],  # {resource, id}
    "cookie": None,
    "student_cookie": None
}

def log(msg, level="INFO"):
    """Log test messages"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{level}] {msg}")

def make_request(method, path, data=None, cookie=None, expect_status=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{path}"
    headers = {}
    if cookie:
        headers["Cookie"] = cookie
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=10)
        elif method == "POST":
            resp = requests.post(url, json=data, headers=headers, timeout=10)
        elif method == "PATCH":
            resp = requests.patch(url, json=data, headers=headers, timeout=10)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        # Only check status if expect_status is specified
        if expect_status is not None and resp.status_code != expect_status:
            log(f"❌ Expected {expect_status}, got {resp.status_code}: {resp.text[:300]}", "ERROR")
            return None
        
        return resp
    except requests.exceptions.Timeout:
        log(f"❌ Request timeout after 10s for {method} {path}", "ERROR")
        return None
    except requests.exceptions.ConnectionError as e:
        log(f"❌ Connection error for {method} {path}: {str(e)[:100]}", "ERROR")
        return None
    except Exception as e:
        log(f"❌ Request failed for {method} {path}: {type(e).__name__}: {str(e)[:100]}", "ERROR")
        return None

def login_super_admin():
    """Login as super admin and return cookie"""
    log("🔐 Logging in as super admin...")
    resp = make_request("POST", "/auth/login", {
        "email": SUPER_ADMIN_EMAIL,
        "password": SUPER_ADMIN_PASSWORD
    }, expect_status=200)
    
    if resp is None:
        log("❌ Super admin login failed", "ERROR")
        return None
    
    cookie = resp.headers.get("Set-Cookie", "")
    if "ddh_token=" not in cookie:
        log("❌ No ddh_token in response", "ERROR")
        return None
    
    # Extract just the cookie value
    cookie = cookie.split(";")[0]
    log(f"✅ Super admin logged in successfully")
    return cookie

def test_1_auto_generate_password():
    """Test 1: POST /api/admin/users WITHOUT password (auto-generate flow)"""
    log("\n" + "="*80)
    log("TEST 1: Auto-Generate Password Flow")
    log("="*80)
    
    timestamp = int(time.time())
    email = f"autogen.test.{timestamp}@example.com"
    
    log(f"Creating user with auto-generated password: {email}")
    resp = make_request("POST", "/admin/users", {
        "name": "Test AutoGen User",
        "email": email,
        "phone": "+963999000111",
        "role": "student"
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 1 FAILED: Request failed", "ERROR")
        return False
    
    data = resp.json()
    
    # Validate response structure
    if "user" not in data:
        log(f"❌ TEST 1 FAILED: Missing 'user' in response", "ERROR")
        return False
    
    if "createdPassword" not in data:
        log(f"❌ TEST 1 FAILED: Missing 'createdPassword' in response", "ERROR")
        return False
    
    if "emailStatus" not in data:
        log(f"❌ TEST 1 FAILED: Missing 'emailStatus' in response", "ERROR")
        return False
    
    user = data["user"]
    created_password = data["createdPassword"]
    email_status = data["emailStatus"]
    
    # Validate user object
    if not user.get("id"):
        log(f"❌ TEST 1 FAILED: User missing 'id'", "ERROR")
        return False
    
    if user.get("role") != "student":
        log(f"❌ TEST 1 FAILED: Expected role='student', got '{user.get('role')}'", "ERROR")
        return False
    
    if "password" in user:
        log(f"❌ TEST 1 FAILED: User object should not contain password field", "ERROR")
        return False
    
    # Validate createdPassword format (DDH-xxxx-xxxx-YYYY or similar)
    if not created_password:
        log(f"❌ TEST 1 FAILED: createdPassword is null/empty", "ERROR")
        return False
    
    # Check if password matches expected pattern
    if not re.match(r'^DDH-[a-z0-9]+-[a-z0-9]+-\d{4}$', created_password, re.IGNORECASE):
        log(f"⚠️  WARNING: createdPassword '{created_password}' doesn't match expected pattern DDH-xxxx-xxxx-YYYY", "WARN")
    
    log(f"✅ Generated password: {created_password}")
    
    # Validate emailStatus
    if not email_status.get("attempted"):
        log(f"❌ TEST 1 FAILED: emailStatus.attempted should be true", "ERROR")
        return False
    
    log(f"✅ Email status: attempted={email_status.get('attempted')}, ok={email_status.get('ok')}, skipped={email_status.get('skipped')}")
    
    # Store for cleanup and login test
    test_data["users"].append({"id": user["id"], "email": email, "password": created_password})
    
    log("✅ TEST 1 PASSED: Auto-generate password flow working correctly")
    return True

def test_2_manual_password():
    """Test 2: POST /api/admin/users WITH custom password"""
    log("\n" + "="*80)
    log("TEST 2: Manual Password Flow")
    log("="*80)
    
    timestamp = int(time.time())
    email = f"manual.test.{timestamp}@example.com"
    custom_password = "MyCustom123"
    
    log(f"Creating user with custom password: {email}")
    resp = make_request("POST", "/admin/users", {
        "name": "Test Manual User",
        "email": email,
        "phone": "+963999000222",
        "role": "teacher",
        "password": custom_password
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 2 FAILED: Request failed", "ERROR")
        return False
    
    data = resp.json()
    
    # Validate createdPassword should be null
    if data.get("createdPassword") is not None:
        log(f"❌ TEST 2 FAILED: createdPassword should be null when custom password provided, got: {data.get('createdPassword')}", "ERROR")
        return False
    
    user = data.get("user")
    if not user or not user.get("id"):
        log(f"❌ TEST 2 FAILED: Invalid user object in response", "ERROR")
        return False
    
    # Store for cleanup
    test_data["users"].append({"id": user["id"], "email": email, "password": custom_password})
    
    log("✅ TEST 2 PASSED: Manual password flow working correctly")
    return True

def test_3_missing_required_fields():
    """Test 3: POST /api/admin/users with missing required fields"""
    log("\n" + "="*80)
    log("TEST 3: Missing Required Fields Validation")
    log("="*80)
    
    # Test missing name
    log("Testing missing 'name' field...")
    resp = make_request("POST", "/admin/users", {
        "email": "test@example.com",
        "role": "student"
    }, cookie=test_data["cookie"])
    
    if resp is None:
        log(f"❌ TEST 3a FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 400:
        log(f"❌ TEST 3a FAILED: Expected 400 for missing name, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    data = resp.json()
    if "الحقول ناقصة" not in data.get("error", ""):
        log(f"❌ TEST 3a FAILED: Expected Arabic error message, got: {data.get('error')}", "ERROR")
        return False
    
    log("✅ Missing name validation working")
    
    # Test missing email
    log("Testing missing 'email' field...")
    resp = make_request("POST", "/admin/users", {
        "name": "Test User",
        "role": "student"
    }, cookie=test_data["cookie"])
    
    if resp is None:
        log(f"❌ TEST 3b FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 400:
        log(f"❌ TEST 3b FAILED: Expected 400 for missing email, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    log("✅ Missing email validation working")
    
    # Test missing role
    log("Testing missing 'role' field...")
    resp = make_request("POST", "/admin/users", {
        "name": "Test User",
        "email": "test@example.com"
    }, cookie=test_data["cookie"])
    
    if resp is None:
        log(f"❌ TEST 3c FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 400:
        log(f"❌ TEST 3c FAILED: Expected 400 for missing role, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    log("✅ Missing role validation working")
    
    log("✅ TEST 3 PASSED: All required field validations working")
    return True

def test_4_invalid_role():
    """Test 4: POST /api/admin/users with invalid role"""
    log("\n" + "="*80)
    log("TEST 4: Invalid Role Validation")
    log("="*80)
    
    timestamp = int(time.time())
    email = f"invalid.role.{timestamp}@example.com"
    
    log(f"Creating user with invalid role 'ghost'...")
    resp = make_request("POST", "/admin/users", {
        "name": "Test Invalid Role",
        "email": email,
        "role": "ghost"
    }, cookie=test_data["cookie"])
    
    if resp is None:
        log(f"❌ TEST 4 FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 400:
        log(f"❌ TEST 4 FAILED: Expected 400 for invalid role, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    data = resp.json()
    if "دور غير صالح" not in data.get("error", ""):
        log(f"❌ TEST 4 FAILED: Expected Arabic error 'دور غير صالح', got: {data.get('error')}", "ERROR")
        return False
    
    log("✅ TEST 4 PASSED: Invalid role validation working")
    return True

def test_5_duplicate_email():
    """Test 5: POST /api/admin/users with duplicate email"""
    log("\n" + "="*80)
    log("TEST 5: Duplicate Email Validation")
    log("="*80)
    
    timestamp = int(time.time())
    email = f"duplicate.test.{timestamp}@example.com"
    
    # Create first user
    log(f"Creating first user: {email}")
    resp = make_request("POST", "/admin/users", {
        "name": "First User",
        "email": email,
        "role": "student"
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 5 FAILED: First user creation failed", "ERROR")
        return False
    
    user = resp.json().get("user")
    test_data["users"].append({"id": user["id"], "email": email})
    
    # Try to create second user with same email
    log(f"Attempting to create duplicate user: {email}")
    resp = make_request("POST", "/admin/users", {
        "name": "Second User",
        "email": email,
        "role": "student"
    }, cookie=test_data["cookie"])
    
    if resp is None:
        log(f"❌ TEST 5 FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 400:
        log(f"❌ TEST 5 FAILED: Expected 400 for duplicate email, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    data = resp.json()
    if "البريد مستخدم" not in data.get("error", ""):
        log(f"❌ TEST 5 FAILED: Expected Arabic error 'البريد مستخدم', got: {data.get('error')}", "ERROR")
        return False
    
    log("✅ TEST 5 PASSED: Duplicate email validation working")
    return True

def test_6_authorization():
    """Test 6: Authorization checks (no auth, wrong role)"""
    log("\n" + "="*80)
    log("TEST 6: Authorization Checks")
    log("="*80)
    
    # Test without cookie
    log("Testing POST /admin/users without authentication...")
    resp = make_request("POST", "/admin/users", {
        "name": "Test User",
        "email": "test@example.com",
        "role": "student"
    })
    
    if resp is None:
        log(f"❌ TEST 6a FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 401:
        log(f"❌ TEST 6a FAILED: Expected 401 without auth, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    log("✅ Unauthorized access blocked (401)")
    
    # Create a student user and try to create another user
    log("Creating student user to test role-based access...")
    timestamp = int(time.time())
    student_email = f"student.auth.{timestamp}@example.com"
    student_password = "StudentPass123"
    
    resp = make_request("POST", "/admin/users", {
        "name": "Test Student",
        "email": student_email,
        "role": "student",
        "password": student_password
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 6b FAILED: Student user creation failed", "ERROR")
        return False
    
    student_user = resp.json().get("user")
    test_data["users"].append({"id": student_user["id"], "email": student_email})
    
    # Login as student
    log("Logging in as student...")
    resp = make_request("POST", "/auth/login", {
        "email": student_email,
        "password": student_password
    }, expect_status=200)
    
    if resp is None:
        log("❌ TEST 6b FAILED: Student login failed", "ERROR")
        return False
    
    student_cookie = resp.headers.get("Set-Cookie", "").split(";")[0]
    test_data["student_cookie"] = student_cookie
    
    # Try to create user as student
    log("Testing POST /admin/users as student (should be forbidden)...")
    resp = make_request("POST", "/admin/users", {
        "name": "Another User",
        "email": f"another.{timestamp}@example.com",
        "role": "student"
    }, cookie=student_cookie)
    
    if resp is None:
        log(f"❌ TEST 6b FAILED: Request failed", "ERROR")
        return False
    
    if resp.status_code != 403:
        log(f"❌ TEST 6b FAILED: Expected 403 for student role, got {resp.status_code}: {resp.text[:200]}", "ERROR")
        return False
    
    log("✅ Student role access blocked (403)")
    
    log("✅ TEST 6 PASSED: All authorization checks working")
    return True

def test_7_google_oauth_removed():
    """Test 7: Verify Google OAuth status endpoint is removed"""
    log("\n" + "="*80)
    log("TEST 7: Google OAuth Status Endpoint Removal")
    log("="*80)
    
    log("Testing GET /auth/google/status (should be 404 or not found)...")
    try:
        resp = requests.get(f"{BASE_URL}/auth/google/status", timeout=10)
        
        # Should return 404 or some error indicating endpoint doesn't exist
        if resp.status_code == 200:
            data = resp.json()
            # If it returns 200, check if it's the old format with configured field
            if "configured" in data:
                log(f"❌ TEST 7 FAILED: Google OAuth status endpoint still exists and returns old format: {data}", "ERROR")
                return False
        
        # 404 or any other error status is acceptable
        log(f"✅ Google OAuth status endpoint properly removed (status: {resp.status_code})")
        log("✅ TEST 7 PASSED: Google OAuth endpoint removed")
        return True
    except Exception as e:
        log(f"❌ TEST 7 FAILED: Request exception: {str(e)}", "ERROR")
        return False

def test_8_login_with_generated_password():
    """Test 8: Login with auto-generated password"""
    log("\n" + "="*80)
    log("TEST 8: Login with Auto-Generated Password")
    log("="*80)
    
    # Use the first auto-generated user from test 1
    if not test_data["users"]:
        log("❌ TEST 8 FAILED: No test users available", "ERROR")
        return False
    
    user = test_data["users"][0]
    email = user["email"]
    password = user.get("password")
    
    if not password:
        log("❌ TEST 8 FAILED: No password stored for test user", "ERROR")
        return False
    
    log(f"Attempting login with email: {email} and generated password: {password}")
    resp = make_request("POST", "/auth/login", {
        "email": email,
        "password": password
    }, expect_status=200)
    
    if resp is None:
        log("❌ TEST 8 FAILED: Login with generated password failed", "ERROR")
        return False
    
    data = resp.json()
    if not data.get("user"):
        log("❌ TEST 8 FAILED: No user object in login response", "ERROR")
        return False
    
    if data["user"].get("email") != email.lower():
        log(f"❌ TEST 8 FAILED: Email mismatch in response", "ERROR")
        return False
    
    log("✅ TEST 8 PASSED: Login with auto-generated password successful")
    return True

def test_9_non_regression_patch_delete():
    """Test 9: Non-regression - PATCH and DELETE still work"""
    log("\n" + "="*80)
    log("TEST 9: Non-Regression - PATCH and DELETE")
    log("="*80)
    
    # Create a test user for PATCH/DELETE
    timestamp = int(time.time())
    email = f"patch.delete.{timestamp}@example.com"
    
    log(f"Creating test user for PATCH/DELETE: {email}")
    resp = make_request("POST", "/admin/users", {
        "name": "Test Patch Delete",
        "email": email,
        "role": "student"
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 9 FAILED: Test user creation failed", "ERROR")
        return False
    
    user = resp.json().get("user")
    user_id = user["id"]
    
    # Test PATCH
    log(f"Testing PATCH /admin/users/{user_id}...")
    resp = make_request("PATCH", f"/admin/users/{user_id}", {
        "disabled": True
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 9a FAILED: PATCH request failed", "ERROR")
        return False
    
    data = resp.json()
    if not data.get("ok"):
        log(f"❌ TEST 9a FAILED: PATCH response missing 'ok' field", "ERROR")
        return False
    
    log("✅ PATCH working correctly")
    
    # Test PATCH back to enabled
    log(f"Testing PATCH /admin/users/{user_id} (re-enable)...")
    resp = make_request("PATCH", f"/admin/users/{user_id}", {
        "disabled": False
    }, cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 9b FAILED: PATCH re-enable failed", "ERROR")
        return False
    
    log("✅ PATCH re-enable working correctly")
    
    # Test DELETE
    log(f"Testing DELETE /admin/users/{user_id}...")
    resp = make_request("DELETE", f"/admin/users/{user_id}", cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 9c FAILED: DELETE request failed", "ERROR")
        return False
    
    data = resp.json()
    if not data.get("ok"):
        log(f"❌ TEST 9c FAILED: DELETE response missing 'ok' field", "ERROR")
        return False
    
    log("✅ DELETE working correctly")
    
    log("✅ TEST 9 PASSED: PATCH and DELETE non-regression tests passed")
    return True

def test_10_convert_to_user_idempotency():
    """Test 10: Convert-to-user idempotency (existing endpoint verification)"""
    log("\n" + "="*80)
    log("TEST 10: Convert-to-User Idempotency")
    log("="*80)
    
    # First, get a valid course ID
    log("Fetching available courses...")
    resp = make_request("GET", "/courses", expect_status=200)
    if resp is None:
        log("❌ TEST 10 FAILED: Could not fetch courses", "ERROR")
        return False
    
    courses_data = resp.json()
    courses = courses_data.get("courses", [])
    if not courses:
        log("❌ TEST 10 FAILED: No courses available", "ERROR")
        return False
    
    course_id = courses[0]["id"]
    log(f"✅ Using course ID: {course_id}")
    
    timestamp = int(time.time())
    
    # Create first anonymous course registration (lead)
    log("Creating first anonymous course registration...")
    resp = make_request("POST", "/course-registrations", {
        "courseId": course_id,
        "name": "Convert Test User",
        "email": f"convert.test.{timestamp}@example.com",
        "phone": "+963999888777",
        "notes": "Test lead for conversion"
    }, expect_status=200)
    
    if resp is None:
        log("❌ TEST 10 FAILED: First lead creation failed", "ERROR")
        return False
    
    response_data = resp.json()
    lead1 = response_data.get("registration", response_data)  # Handle both formats
    lead1_id = lead1.get("id")
    lead1_email = lead1.get("email")
    
    if not lead1_id:
        log(f"❌ TEST 10 FAILED: No ID in lead response: {response_data}", "ERROR")
        return False
    
    test_data["leads"].append({"resource": "course-registrations", "id": lead1_id})
    log(f"✅ First lead created: {lead1_id}")
    
    # Convert first lead to user
    log(f"Converting first lead to user...")
    resp = make_request("POST", f"/admin/course-registrations/{lead1_id}/convert-to-user", 
                       cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 10 FAILED: First conversion failed", "ERROR")
        return False
    
    data1 = resp.json()
    
    if not data1.get("ok"):
        log(f"❌ TEST 10 FAILED: First conversion response missing 'ok' field", "ERROR")
        return False
    
    if not data1.get("createdPassword"):
        log(f"❌ TEST 10 FAILED: First conversion should return createdPassword", "ERROR")
        return False
    
    if data1.get("isExisting"):
        log(f"❌ TEST 10 FAILED: First conversion should have isExisting=false", "ERROR")
        return False
    
    user1 = data1.get("user")
    if not user1 or not user1.get("id"):
        log(f"❌ TEST 10 FAILED: First conversion missing user object", "ERROR")
        return False
    
    test_data["users"].append({"id": user1["id"], "email": lead1_email})
    log(f"✅ First conversion successful, user created: {user1['id']}")
    log(f"✅ Generated password: {data1['createdPassword']}")
    
    # Create second lead with SAME email
    log("Creating second anonymous course registration with SAME email...")
    resp = make_request("POST", "/course-registrations", {
        "courseId": course_id,
        "name": "Convert Test User 2",
        "email": lead1_email,
        "phone": "+963999888888",
        "notes": "Second test lead with same email"
    }, expect_status=200)
    
    if resp is None:
        log("❌ TEST 10 FAILED: Second lead creation failed", "ERROR")
        return False
    
    response_data = resp.json()
    lead2 = response_data.get("registration", response_data)  # Handle both formats
    lead2_id = lead2.get("id")
    
    if not lead2_id:
        log(f"❌ TEST 10 FAILED: No ID in second lead response: {response_data}", "ERROR")
        return False
    
    test_data["leads"].append({"resource": "course-registrations", "id": lead2_id})
    log(f"✅ Second lead created: {lead2_id}")
    
    # Convert second lead (should link to existing user)
    log(f"Converting second lead to user (should be idempotent)...")
    resp = make_request("POST", f"/admin/course-registrations/{lead2_id}/convert-to-user", 
                       cookie=test_data["cookie"], expect_status=200)
    
    if resp is None:
        log("❌ TEST 10 FAILED: Second conversion failed", "ERROR")
        return False
    
    data2 = resp.json()
    
    if not data2.get("ok"):
        log(f"❌ TEST 10 FAILED: Second conversion response missing 'ok' field", "ERROR")
        return False
    
    if data2.get("createdPassword") is not None:
        log(f"❌ TEST 10 FAILED: Second conversion should have createdPassword=null, got: {data2.get('createdPassword')}", "ERROR")
        return False
    
    if not data2.get("isExisting"):
        log(f"❌ TEST 10 FAILED: Second conversion should have isExisting=true", "ERROR")
        return False
    
    user2 = data2.get("user")
    if not user2 or user2.get("id") != user1["id"]:
        log(f"❌ TEST 10 FAILED: Second conversion should return same user ID", "ERROR")
        return False
    
    log(f"✅ Second conversion successful, linked to existing user: {user2['id']}")
    log(f"✅ isExisting=true, createdPassword=null (as expected)")
    
    log("✅ TEST 10 PASSED: Convert-to-user idempotency working correctly")
    return True

def cleanup():
    """Clean up all test data"""
    log("\n" + "="*80)
    log("CLEANUP: Removing all test data")
    log("="*80)
    
    # Delete test leads
    for lead in test_data["leads"]:
        resource = lead["resource"]
        lead_id = lead["id"]
        log(f"Deleting lead: {resource}/{lead_id}")
        resp = make_request("DELETE", f"/admin/{resource}/{lead_id}", cookie=test_data["cookie"])
        if resp and resp.status_code == 200:
            log(f"✅ Deleted lead: {lead_id}")
        else:
            log(f"⚠️  Failed to delete lead: {lead_id}", "WARN")
    
    # Delete test users
    for user in test_data["users"]:
        user_id = user["id"]
        email = user["email"]
        log(f"Deleting user: {email} ({user_id})")
        resp = make_request("DELETE", f"/admin/users/{user_id}", cookie=test_data["cookie"])
        if resp and resp.status_code == 200:
            log(f"✅ Deleted user: {email}")
        else:
            log(f"⚠️  Failed to delete user: {email}", "WARN")
    
    log("✅ Cleanup complete")

def main():
    """Run all tests"""
    log("="*80)
    log("ADMIN USER CREATION TESTING — AUTO-GENERATE PASSWORD + REMOVE GOOGLE OAUTH")
    log("="*80)
    log(f"Base URL: {BASE_URL}")
    log(f"Admin: {SUPER_ADMIN_EMAIL}")
    
    # Login
    cookie = login_super_admin()
    if not cookie:
        log("❌ FATAL: Cannot proceed without super admin authentication", "ERROR")
        return
    
    test_data["cookie"] = cookie
    
    # Run tests
    results = []
    
    try:
        results.append(("Test 1: Auto-Generate Password", test_1_auto_generate_password()))
        results.append(("Test 2: Manual Password", test_2_manual_password()))
        results.append(("Test 3: Missing Required Fields", test_3_missing_required_fields()))
        results.append(("Test 4: Invalid Role", test_4_invalid_role()))
        results.append(("Test 5: Duplicate Email", test_5_duplicate_email()))
        results.append(("Test 6: Authorization", test_6_authorization()))
        results.append(("Test 7: Google OAuth Removed", test_7_google_oauth_removed()))
        results.append(("Test 8: Login with Generated Password", test_8_login_with_generated_password()))
        results.append(("Test 9: Non-Regression PATCH/DELETE", test_9_non_regression_patch_delete()))
        results.append(("Test 10: Convert-to-User Idempotency", test_10_convert_to_user_idempotency()))
    finally:
        # Always cleanup
        cleanup()
    
    # Summary
    log("\n" + "="*80)
    log("TEST SUMMARY")
    log("="*80)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        log(f"{status} - {test_name}")
    
    log("="*80)
    log(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}% success rate)")
    log("="*80)
    
    if passed == total:
        log("🎉 ALL TESTS PASSED!", "SUCCESS")
    else:
        log(f"⚠️  {total - passed} test(s) failed", "WARN")

if __name__ == "__main__":
    main()
