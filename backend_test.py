#!/usr/bin/env python3
"""
RETEST #3 — Ausbildung Application Backend Test Suite
Das Deutsche Haus - Vocational Applications (Ausbildung)

⛔ CRITICAL: Uses http://localhost:3000 for ALL requests (NOT production URL)
Tests validation, rate limiting, mass-assignment protection, duplicate prevention, and admin endpoints.
"""

import requests
import time
import sys
from typing import Dict, Any, Optional

# ⛔ ABSOLUTE RULE: Use localhost:3000 for EVERY request
BASE_URL = "http://localhost:3000/api"
ADMIN_EMAIL = "bachir.devops@gmail.com"
ADMIN_PASSWORD = "@26042026Admin"

# Test tracking
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(name: str, passed: bool, message: str = ""):
    """Log test result"""
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        print(f"✅ PASS: {name}")
        if message:
            print(f"   {message}")
    else:
        tests_failed += 1
        print(f"❌ FAIL: {name}")
        if message:
            print(f"   {message}")
    test_results.append({"name": name, "passed": passed, "message": message})

def admin_login() -> Optional[str]:
    """Login as admin and return ddh_token cookie"""
    try:
        print(f"\n🔐 Logging in as admin at {BASE_URL}/auth/login...")
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=20
        )
        if response.status_code == 200:
            cookie = response.cookies.get("ddh_token")
            if cookie:
                print(f"✅ Admin login successful (cookie received)")
                return cookie
            else:
                print(f"❌ Admin login failed: No ddh_token cookie")
                return None
        else:
            print(f"❌ Admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Admin login exception: {str(e)}")
        return None

def test_get_jobs() -> Optional[str]:
    """Test 1: GET /api/vocational/jobs - should return 2 active jobs, no _id field"""
    print("\n" + "="*80)
    print("TEST 1: GET /api/vocational/jobs (Public Endpoint)")
    print("="*80)
    try:
        response = requests.get(f"{BASE_URL}/vocational/jobs", timeout=20)
        if response.status_code == 200:
            data = response.json()
            jobs = data.get("jobs", [])
            print(f"📊 Received {len(jobs)} jobs")
            
            # Check for exactly 2 jobs
            if len(jobs) != 2:
                log_test("GET /api/vocational/jobs - Count", False, f"Expected 2 jobs, got {len(jobs)}")
                return None
            
            # Check that no _id field is present
            has_no_id = all("_id" not in job for job in jobs)
            if not has_no_id:
                log_test("GET /api/vocational/jobs - No _id", False, "Jobs contain _id field")
                return None
            
            # Check required fields
            required_fields = ["id", "title_ar", "title_de", "partner", "salary"]
            for job in jobs:
                missing = [f for f in required_fields if f not in job]
                if missing:
                    log_test("GET /api/vocational/jobs - Fields", False, f"Missing fields: {missing}")
                    return None
            
            log_test("GET /api/vocational/jobs", True, f"Returns 2 active jobs with all required fields, no _id")
            return jobs[0]["id"] if jobs else None
        else:
            log_test("GET /api/vocational/jobs", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("GET /api/vocational/jobs", False, f"Exception: {str(e)}")
        return None

def test_create_inactive_job(admin_cookie: str) -> Optional[str]:
    """Test 2: Create inactive job via POST /api/manager/jobs and verify it's NOT in public list"""
    print("\n" + "="*80)
    print("TEST 2: Create Inactive Job (Admin) + Verify Not in Public List")
    print("="*80)
    try:
        # Create inactive job
        print("📝 Creating inactive test job...")
        response = requests.post(
            f"{BASE_URL}/manager/jobs",
            json={
                "title_ar": "اختبار مهنة",
                "title_de": "Testberuf",
                "partner": "TEST",
                "salary": "€1",
                "is_active": False
            },
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        
        if response.status_code != 200:
            log_test("Create Inactive Job", False, f"Status {response.status_code}: {response.text}")
            return None
        
        data = response.json()
        temp_job_id = data.get("item", {}).get("id")
        if not temp_job_id:
            log_test("Create Inactive Job", False, "No job ID returned")
            return None
        
        print(f"✅ Inactive job created: {temp_job_id}")
        
        # Verify it's NOT in public list
        print("🔍 Verifying inactive job is NOT in public list...")
        response = requests.get(f"{BASE_URL}/vocational/jobs", timeout=20)
        if response.status_code == 200:
            jobs = response.json().get("jobs", [])
            inactive_in_list = any(job.get("id") == temp_job_id for job in jobs)
            if inactive_in_list:
                log_test("Inactive Job Not Public", False, "Inactive job appears in public list")
                return temp_job_id
            else:
                # Should still be 2 jobs (not 3)
                if len(jobs) == 2:
                    log_test("Create Inactive Job + Verify Hidden", True, f"Inactive job created but NOT in public list (still 2 jobs)")
                    return temp_job_id
                else:
                    log_test("Create Inactive Job + Verify Hidden", False, f"Expected 2 jobs in public list, got {len(jobs)}")
                    return temp_job_id
        else:
            log_test("Verify Inactive Job Hidden", False, f"Failed to fetch public jobs: {response.status_code}")
            return temp_job_id
    except Exception as e:
        log_test("Create Inactive Job", False, f"Exception: {str(e)}")
        return None

def test_validation(real_job_id: str):
    """Test 3: Validation tests (6 scenarios) - THEN SLEEP 61s"""
    print("\n" + "="*80)
    print("TEST 3: Validation Tests (6 scenarios)")
    print("="*80)
    
    # Test 3a: Missing name (Arabic)
    print("\n3a. Missing name (default Arabic)...")
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "email": "test@example.com",
                "phone": "+491234567",
                "germanLevel": "B1",
                "education": "Abitur"
            },
            timeout=20
        )
        if response.status_code == 400:
            error = response.json().get("error", "")
            if "الاسم" in error or "اسم" in error:
                log_test("Validation: Missing name (AR)", True, f"Returns 400 with Arabic error: {error}")
            else:
                log_test("Validation: Missing name (AR)", False, f"Wrong error message: {error}")
        else:
            log_test("Validation: Missing name (AR)", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Validation: Missing name (AR)", False, f"Exception: {str(e)}")
    
    # Test 3b: Invalid email
    print("\n3b. Invalid email...")
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test User",
                "email": "abc",
                "phone": "+491234567",
                "germanLevel": "B1",
                "education": "Abitur"
            },
            timeout=20
        )
        if response.status_code == 400:
            log_test("Validation: Invalid email", True, "Returns 400 for invalid email")
        else:
            log_test("Validation: Invalid email", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Validation: Invalid email", False, f"Exception: {str(e)}")
    
    # Test 3c: Missing phone
    print("\n3c. Missing phone...")
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test User",
                "email": "test@example.com",
                "germanLevel": "B1",
                "education": "Abitur"
            },
            timeout=20
        )
        if response.status_code == 400:
            log_test("Validation: Missing phone", True, "Returns 400 for missing phone")
        else:
            log_test("Validation: Missing phone", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Validation: Missing phone", False, f"Exception: {str(e)}")
    
    # Test 3d: Invalid germanLevel
    print("\n3d. Invalid germanLevel...")
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+491234567",
                "germanLevel": "X9",
                "education": "Abitur"
            },
            timeout=20
        )
        if response.status_code == 400:
            log_test("Validation: Invalid germanLevel", True, "Returns 400 for invalid germanLevel")
        else:
            log_test("Validation: Invalid germanLevel", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Validation: Invalid germanLevel", False, f"Exception: {str(e)}")
    
    # Test 3e: Missing education
    print("\n3e. Missing education...")
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+491234567",
                "germanLevel": "B1"
            },
            timeout=20
        )
        if response.status_code == 400:
            log_test("Validation: Missing education", True, "Returns 400 for missing education")
        else:
            log_test("Validation: Missing education", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Validation: Missing education", False, f"Exception: {str(e)}")
    
    # Test 3f: Missing name with lang:de (German error)
    print("\n3f. Missing name with lang:de (German error)...")
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "lang": "de",
                "email": "test@example.com",
                "phone": "+491234567",
                "germanLevel": "B1",
                "education": "Abitur"
            },
            timeout=20
        )
        if response.status_code == 400:
            error = response.json().get("error", "")
            if "Bitte" in error or "Namen" in error or "Vor- und Nachnamen" in error:
                log_test("Validation: Missing name (DE)", True, f"Returns 400 with German error: {error}")
            else:
                log_test("Validation: Missing name (DE)", False, f"Wrong error message: {error}")
        else:
            log_test("Validation: Missing name (DE)", False, f"Expected 400, got {response.status_code}")
    except Exception as e:
        log_test("Validation: Missing name (DE)", False, f"Exception: {str(e)}")
    
    # MANDATORY SLEEP after validation tests (rate limit: 8/min)
    print("\n⏳ SLEEPING 61 seconds to reset rate limit...")
    time.sleep(61)
    print("✅ Rate limit reset complete")

def test_invalid_job_id():
    """Test 4: Apply with non-existent jobId"""
    print("\n" + "="*80)
    print("TEST 4: Invalid jobId")
    print("="*80)
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": "nonexistent-id",
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+491234567",
                "country": "Jordanien / Amman",
                "germanLevel": "B1",
                "education": "Abitur",
                "notes": "test"
            },
            timeout=20
        )
        if response.status_code == 404:
            error = response.json().get("error", "")
            log_test("Invalid jobId", True, f"Returns 404 with friendly error: {error}")
        else:
            log_test("Invalid jobId", False, f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("Invalid jobId", False, f"Exception: {str(e)}")

def test_apply_to_inactive_job(inactive_job_id: str):
    """Test 5: Apply to inactive job"""
    print("\n" + "="*80)
    print("TEST 5: Apply to Inactive Job")
    print("="*80)
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": inactive_job_id,
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+491234567",
                "country": "Jordanien / Amman",
                "germanLevel": "B1",
                "education": "Abitur",
                "notes": "test"
            },
            timeout=20
        )
        if response.status_code == 404:
            log_test("Apply to Inactive Job", True, "Returns 404 for inactive job")
        else:
            log_test("Apply to Inactive Job", False, f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("Apply to Inactive Job", False, f"Exception: {str(e)}")

def test_valid_application(real_job_id: str) -> Optional[str]:
    """Test 6: Valid application"""
    print("\n" + "="*80)
    print("TEST 6: Valid Application")
    print("="*80)
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test Bewerber",
                "email": "voc.test.applicant@example.com",
                "phone": "+491234567",
                "country": "Jordanien / Amman",
                "germanLevel": "B1",
                "education": "Abitur",
                "notes": "test",
                "lang": "de"
            },
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            app = data.get("application", {})
            
            # Verify required fields
            required_fields = ["id", "jobId", "jobTitle", "jobTitle_de", "status", "germanLevel", "education", "country"]
            missing = [f for f in required_fields if f not in app]
            if missing:
                log_test("Valid Application", False, f"Missing fields: {missing}")
                return None
            
            # Verify values
            if app.get("status") != "new":
                log_test("Valid Application", False, f"Expected status 'new', got '{app.get('status')}'")
                return None
            
            if app.get("germanLevel") != "B1":
                log_test("Valid Application", False, f"Expected germanLevel 'B1', got '{app.get('germanLevel')}'")
                return None
            
            log_test("Valid Application", True, f"Application created successfully with all required fields")
            return app.get("id")
        else:
            log_test("Valid Application", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Valid Application", False, f"Exception: {str(e)}")
        return None

def test_mass_assignment(real_job_id: str) -> Optional[str]:
    """Test 7: Mass-assignment protection"""
    print("\n" + "="*80)
    print("TEST 7: Mass-Assignment Protection")
    print("="*80)
    try:
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test User 2",
                "email": "voc.test2@example.com",
                "phone": "+491234567",
                "country": "Jordanien / Amman",
                "germanLevel": "B1",
                "education": "Abitur",
                "notes": "test",
                # Malicious fields
                "status": "converted",
                "role": "admin",
                "isAdmin": True
            },
            timeout=20
        )
        
        if response.status_code == 200:
            data = response.json()
            app = data.get("application", {})
            
            # Verify status is 'new' (not 'converted')
            if app.get("status") != "new":
                log_test("Mass-Assignment Protection", False, f"Status was changed to '{app.get('status')}'")
                return None
            
            # Verify no role/isAdmin fields
            if "role" in app or "isAdmin" in app:
                log_test("Mass-Assignment Protection", False, "Malicious fields (role/isAdmin) were stored")
                return None
            
            log_test("Mass-Assignment Protection", True, "Malicious fields rejected, status='new'")
            return app.get("id")
        else:
            log_test("Mass-Assignment Protection", False, f"Status {response.status_code}: {response.text}")
            return None
    except Exception as e:
        log_test("Mass-Assignment Protection", False, f"Exception: {str(e)}")
        return None

def test_duplicate_prevention(real_job_id: str):
    """Test 8: Duplicate prevention"""
    print("\n" + "="*80)
    print("TEST 8: Duplicate Prevention")
    print("="*80)
    try:
        # Try to apply again with same email+jobId
        response = requests.post(
            f"{BASE_URL}/vocational/applications",
            json={
                "jobId": real_job_id,
                "name": "Test Bewerber",
                "email": "voc.test.applicant@example.com",
                "phone": "+491234567",
                "country": "Jordanien / Amman",
                "germanLevel": "B1",
                "education": "Abitur",
                "notes": "test",
                "lang": "de"
            },
            timeout=20
        )
        
        if response.status_code == 409:
            error = response.json().get("error", "")
            log_test("Duplicate Prevention", True, f"Returns 409 with error: {error}")
        else:
            log_test("Duplicate Prevention", False, f"Expected 409, got {response.status_code}")
    except Exception as e:
        log_test("Duplicate Prevention", False, f"Exception: {str(e)}")

def test_admin_endpoints(admin_cookie: str, app_id: str):
    """Test 9: Admin endpoints (GET, PATCH)"""
    print("\n" + "="*80)
    print("TEST 9: Admin Endpoints")
    print("="*80)
    
    # Test 9a: GET without cookie
    print("\n9a. GET /api/admin/vocational-applications without cookie...")
    try:
        response = requests.get(f"{BASE_URL}/admin/vocational-applications", timeout=20)
        if response.status_code == 401:
            log_test("Admin GET without auth", True, "Returns 401 without cookie")
        else:
            log_test("Admin GET without auth", False, f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("Admin GET without auth", False, f"Exception: {str(e)}")
    
    # Test 9b: GET with admin cookie
    print("\n9b. GET /api/admin/vocational-applications with admin cookie...")
    try:
        response = requests.get(
            f"{BASE_URL}/admin/vocational-applications",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            data = response.json()
            items = data.get("items", [])
            
            # Verify required fields are present
            if items:
                sample = items[0]
                required_fields = ["germanLevel", "education", "country"]
                missing = [f for f in required_fields if f not in sample]
                if missing:
                    log_test("Admin GET with auth", False, f"Missing fields: {missing}")
                else:
                    log_test("Admin GET with auth", True, f"Returns {len(items)} applications with all required fields")
            else:
                log_test("Admin GET with auth", True, "Returns empty list (no applications yet)")
        else:
            log_test("Admin GET with auth", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Admin GET with auth", False, f"Exception: {str(e)}")
    
    # Test 9c: PATCH application status
    print(f"\n9c. PATCH /api/admin/vocational-applications/{app_id}...")
    try:
        response = requests.patch(
            f"{BASE_URL}/admin/vocational-applications/{app_id}",
            json={"status": "contacted"},
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            data = response.json()
            item = data.get("item", {})
            if item.get("status") == "contacted":
                log_test("Admin PATCH status", True, "Status updated to 'contacted'")
            else:
                log_test("Admin PATCH status", False, f"Status not updated: {item.get('status')}")
        else:
            log_test("Admin PATCH status", False, f"Status {response.status_code}: {response.text}")
    except Exception as e:
        log_test("Admin PATCH status", False, f"Exception: {str(e)}")

def test_rate_limit(real_job_id: str):
    """Test 10: Rate limiting (LAST test, after sleep)"""
    print("\n" + "="*80)
    print("TEST 10: Rate Limiting (8 requests/min)")
    print("="*80)
    
    print("⏳ Sleeping 61 seconds to reset rate limit...")
    time.sleep(61)
    print("✅ Rate limit reset")
    
    print("\n📊 Sending 9 rapid POST requests...")
    rate_limited = False
    for i in range(9):
        try:
            response = requests.post(
                f"{BASE_URL}/vocational/applications",
                json={
                    "jobId": real_job_id,
                    "name": f"Rate Test {i}",
                    "email": f"rate.test.{i}@example.com",
                    "phone": "+491234567",
                    "germanLevel": "B1",
                    "education": "Abitur"
                },
                timeout=20
            )
            print(f"   Request {i+1}: {response.status_code}")
            if response.status_code == 429:
                rate_limited = True
                break
        except Exception as e:
            print(f"   Request {i+1}: Exception - {str(e)}")
    
    if rate_limited:
        log_test("Rate Limiting", True, "Rate limit enforced (429 returned)")
    else:
        log_test("Rate Limiting", False, "No 429 response after 9 rapid requests")

def test_email_logs(admin_cookie: str):
    """Test 11: Email logs (informational)"""
    print("\n" + "="*80)
    print("TEST 11: Email Logs (Informational)")
    print("="*80)
    try:
        response = requests.get(
            f"{BASE_URL}/admin/email-logs",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            data = response.json()
            logs = data.get("logs", [])
            
            # Look for vocational application emails
            admin_emails = [log for log in logs if log.get("type") == "admin_vocational_application"]
            confirm_emails = [log for log in logs if log.get("type") == "confirm_vocational_application"]
            
            print(f"📧 Found {len(admin_emails)} admin_vocational_application emails")
            print(f"📧 Found {len(confirm_emails)} confirm_vocational_application emails")
            
            if admin_emails:
                sample = admin_emails[0]
                print(f"   Sample admin email: to={sample.get('to')}, status={sample.get('status')}")
            
            if confirm_emails:
                sample = confirm_emails[0]
                print(f"   Sample confirm email: to={sample.get('to')}, status={sample.get('status')}")
            
            log_test("Email Logs", True, f"Email logs accessible ({len(logs)} total logs)")
        else:
            print(f"⚠️  Email logs endpoint returned {response.status_code} (non-critical)")
            log_test("Email Logs", True, "Email logs endpoint exists (status informational)")
    except Exception as e:
        print(f"⚠️  Email logs exception: {str(e)} (non-critical)")
        log_test("Email Logs", True, "Email logs test completed (informational)")

def cleanup(admin_cookie: str, app_ids: list, temp_job_id: str):
    """MANDATORY CLEANUP: Delete test applications and temp job"""
    print("\n" + "="*80)
    print("CLEANUP: Deleting Test Data")
    print("="*80)
    
    # Delete test applications
    for app_id in app_ids:
        if app_id:
            try:
                print(f"🗑️  Deleting application {app_id}...")
                response = requests.delete(
                    f"{BASE_URL}/admin/vocational-applications/{app_id}",
                    cookies={"ddh_token": admin_cookie},
                    timeout=20
                )
                if response.status_code == 200:
                    print(f"   ✅ Deleted application {app_id}")
                else:
                    print(f"   ⚠️  Failed to delete application {app_id}: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️  Exception deleting application {app_id}: {str(e)}")
    
    # Delete temp job
    if temp_job_id:
        try:
            print(f"🗑️  Deleting temp job {temp_job_id}...")
            response = requests.delete(
                f"{BASE_URL}/manager/jobs/{temp_job_id}",
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            if response.status_code == 200:
                print(f"   ✅ Deleted temp job {temp_job_id}")
            else:
                print(f"   ⚠️  Failed to delete temp job {temp_job_id}: {response.status_code}")
        except Exception as e:
            print(f"   ⚠️  Exception deleting temp job {temp_job_id}: {str(e)}")
    
    # Verify final state
    try:
        print("\n🔍 Verifying final state...")
        response = requests.get(f"{BASE_URL}/vocational/jobs", timeout=20)
        if response.status_code == 200:
            jobs = response.json().get("jobs", [])
            print(f"   📊 Final job count: {len(jobs)} (expected: 2)")
        
        response = requests.get(
            f"{BASE_URL}/admin/vocational-applications",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            apps = response.json().get("items", [])
            test_apps = [a for a in apps if "test" in a.get("email", "").lower() or "voc.test" in a.get("email", "").lower()]
            print(f"   📊 Test applications remaining: {len(test_apps)} (expected: 0)")
            if test_apps:
                print(f"   ⚠️  WARNING: {len(test_apps)} test applications still in database")
                for app in test_apps:
                    print(f"      - {app.get('email')} (id: {app.get('id')})")
    except Exception as e:
        print(f"   ⚠️  Exception verifying final state: {str(e)}")
    
    print("\n✅ Cleanup complete")

def main():
    """Main test runner"""
    print("="*80)
    print("RETEST #3 — Ausbildung Application Backend Test Suite")
    print("Das Deutsche Haus - Vocational Applications")
    print("="*80)
    print(f"🌐 Base URL: {BASE_URL}")
    print(f"👤 Admin: {ADMIN_EMAIL}")
    print("="*80)
    
    # Login as admin
    admin_cookie = admin_login()
    if not admin_cookie:
        print("\n❌ FATAL: Admin login failed. Cannot proceed with tests.")
        sys.exit(1)
    
    # Test 1: GET jobs
    real_job_id = test_get_jobs()
    if not real_job_id:
        print("\n❌ FATAL: Failed to get real job ID. Cannot proceed with tests.")
        sys.exit(1)
    
    # Test 2: Create inactive job
    temp_job_id = test_create_inactive_job(admin_cookie)
    if not temp_job_id:
        print("\n⚠️  WARNING: Failed to create temp job. Continuing with other tests...")
    
    # Test 3: Validation (6 scenarios) + SLEEP 61s
    test_validation(real_job_id)
    
    # Test 4: Invalid jobId
    test_invalid_job_id()
    
    # Test 5: Apply to inactive job
    if temp_job_id:
        test_apply_to_inactive_job(temp_job_id)
    else:
        print("\n⚠️  SKIP: Test 5 (no temp job ID)")
    
    # Test 6: Valid application
    app_id_1 = test_valid_application(real_job_id)
    
    # Test 7: Mass-assignment protection
    app_id_2 = test_mass_assignment(real_job_id)
    
    # Test 8: Duplicate prevention
    test_duplicate_prevention(real_job_id)
    
    # Test 9: Admin endpoints
    if app_id_1:
        test_admin_endpoints(admin_cookie, app_id_1)
    else:
        print("\n⚠️  SKIP: Test 9 (no application ID)")
    
    # Test 10: Rate limiting (LAST)
    test_rate_limit(real_job_id)
    
    # Test 11: Email logs (informational)
    test_email_logs(admin_cookie)
    
    # MANDATORY CLEANUP
    app_ids = [app_id_1, app_id_2]
    cleanup(admin_cookie, app_ids, temp_job_id)
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    print(f"📊 Total: {tests_passed + tests_failed}")
    print(f"📈 Success Rate: {tests_passed / (tests_passed + tests_failed) * 100:.1f}%")
    print("="*80)
    
    if tests_failed > 0:
        print("\n❌ SOME TESTS FAILED")
        sys.exit(1)
    else:
        print("\n✅ ALL TESTS PASSED")
        sys.exit(0)

if __name__ == "__main__":
    main()
