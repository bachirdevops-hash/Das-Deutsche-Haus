#!/usr/bin/env python3
"""
REGRESSION TEST: telc Feature Removal
Tests that telc endpoints are removed and remaining features work correctly.
"""
import requests
import json
import sys
from datetime import datetime

# Base URL from .env
BASE_URL = "https://www.das-deutsche-haus.com/api"

# Test credentials
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

# Global session
session = requests.Session()
session.headers.update({"Content-Type": "application/json"})

def log(msg, status="INFO"):
    """Log test messages"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{status}] {msg}")

def test_auth_login():
    """Test 1: Auth - Super admin login works"""
    try:
        log("TEST 1: Super admin login", "TEST")
        response = session.post(
            f"{BASE_URL}/auth/login",
            json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
        )
        
        if response.status_code != 200:
            log(f"❌ Login failed with status {response.status_code}: {response.text}", "FAIL")
            return False
        
        data = response.json()
        if not data.get("user"):
            log(f"❌ No user object in response: {data}", "FAIL")
            return False
        
        user = data["user"]
        if user.get("role") != "super_admin":
            log(f"❌ User role is not super_admin: {user.get('role')}", "FAIL")
            return False
        
        # Check cookie is set
        if "ddh_token" not in session.cookies:
            log("❌ ddh_token cookie not set", "FAIL")
            return False
        
        log(f"✅ Login successful - User: {user.get('name')}, Role: {user.get('role')}", "PASS")
        return True
    except Exception as e:
        log(f"❌ Exception during login: {str(e)}", "FAIL")
        return False

def test_removed_endpoints():
    """Test 2: Removed telc endpoints return 404 (not 500)"""
    try:
        log("TEST 2: Removed telc endpoints return 404", "TEST")
        
        endpoints = [
            ("GET", "/telc-exams"),
            ("POST", "/telc-bookings"),
            ("GET", "/manager/telc-exams"),
        ]
        
        all_pass = True
        for method, path in endpoints:
            url = f"{BASE_URL}{path}"
            
            if method == "GET":
                response = session.get(url)
            elif method == "POST":
                response = session.post(url, json={"examId": "test"})
            
            # Should be 404, NOT 500
            if response.status_code == 500:
                log(f"❌ {method} {path} returned 500 (should be 404): {response.text}", "FAIL")
                all_pass = False
            elif response.status_code == 404:
                log(f"✅ {method} {path} correctly returns 404", "PASS")
            else:
                # Could be 401 for manager endpoint without proper auth, that's acceptable
                log(f"⚠️  {method} {path} returned {response.status_code} (expected 404, but not 500)", "WARN")
        
        return all_pass
    except Exception as e:
        log(f"❌ Exception testing removed endpoints: {str(e)}", "FAIL")
        return False

def test_dashboard_no_telc():
    """Test 3: Dashboard returns data WITHOUT telc_bookings key"""
    try:
        log("TEST 3: Dashboard has no telc_bookings key", "TEST")
        
        response = session.get(f"{BASE_URL}/dashboard")
        
        if response.status_code != 200:
            log(f"❌ Dashboard failed with status {response.status_code}: {response.text}", "FAIL")
            return False
        
        data = response.json()
        
        # Check expected keys are present
        expected_keys = ["user", "registrations", "vocational_applications", "travel_consultations"]
        for key in expected_keys:
            if key not in data:
                log(f"❌ Missing expected key '{key}' in dashboard response", "FAIL")
                return False
        
        # Check telc_bookings is NOT present
        if "telc_bookings" in data:
            log(f"❌ telc_bookings key found in dashboard (should be removed): {list(data.keys())}", "FAIL")
            return False
        
        log(f"✅ Dashboard response correct - Keys: {list(data.keys())}", "PASS")
        log(f"   Registrations: {len(data.get('registrations', []))}, Vocational: {len(data.get('vocational_applications', []))}, Travel: {len(data.get('travel_consultations', []))}", "INFO")
        return True
    except Exception as e:
        log(f"❌ Exception testing dashboard: {str(e)}", "FAIL")
        return False

def test_admin_stats_no_telc():
    """Test 4: Admin stats has no telcBookings/examRevenue keys"""
    try:
        log("TEST 4: Admin stats has no telcBookings/examRevenue", "TEST")
        
        response = session.get(f"{BASE_URL}/admin/stats")
        
        if response.status_code != 200:
            log(f"❌ Admin stats failed with status {response.status_code}: {response.text}", "FAIL")
            return False
        
        data = response.json()
        
        # Check expected keys are present
        expected_keys = ["users", "courseRegistrations", "vocationalApps", "consultations", "contactMessages", "courseRevenue", "totalRevenue"]
        for key in expected_keys:
            if key not in data:
                log(f"❌ Missing expected key '{key}' in stats response", "FAIL")
                return False
        
        # Check telc-related keys are NOT present
        telc_keys = ["telcBookings", "examRevenue"]
        found_telc = [k for k in telc_keys if k in data]
        if found_telc:
            log(f"❌ telc-related keys found in stats (should be removed): {found_telc}", "FAIL")
            return False
        
        log(f"✅ Admin stats correct - Keys: {list(data.keys())}", "PASS")
        log(f"   Users: {data.get('users')}, Course Registrations: {data.get('courseRegistrations')}, Revenue: ${data.get('totalRevenue')}", "INFO")
        return True
    except Exception as e:
        log(f"❌ Exception testing admin stats: {str(e)}", "FAIL")
        return False

def test_site_features_no_telc():
    """Test 5: Site features contains only german_visitors (no telc)"""
    try:
        log("TEST 5: Site features has no telc feature", "TEST")
        
        response = session.get(f"{BASE_URL}/admin/site-features")
        
        if response.status_code != 200:
            log(f"❌ Site features failed with status {response.status_code}: {response.text}", "FAIL")
            return False
        
        data = response.json()
        
        if "features" not in data:
            log(f"❌ No 'features' key in response: {data}", "FAIL")
            return False
        
        features = data["features"]
        feature_keys = [f.get("key") for f in features]
        
        # Check telc is NOT in features
        if "telc" in feature_keys:
            log(f"❌ 'telc' feature found in site features (should be removed): {feature_keys}", "FAIL")
            return False
        
        # Check german_visitors is present
        if "german_visitors" not in feature_keys:
            log(f"⚠️  'german_visitors' feature not found (expected): {feature_keys}", "WARN")
        
        log(f"✅ Site features correct - Features: {feature_keys}", "PASS")
        return True
    except Exception as e:
        log(f"❌ Exception testing site features: {str(e)}", "FAIL")
        return False

def test_unified_inbox():
    """Test 6: Unified inbox endpoints work for remaining types, telc-bookings returns 404"""
    try:
        log("TEST 6: Unified inbox endpoints", "TEST")
        
        # Test remaining lead types should work
        working_endpoints = [
            "/admin/course-registrations",
            "/admin/vocational-applications",
            "/admin/travel-consultations",
        ]
        
        all_pass = True
        for endpoint in working_endpoints:
            response = session.get(f"{BASE_URL}{endpoint}")
            
            if response.status_code != 200:
                log(f"❌ {endpoint} failed with status {response.status_code}: {response.text}", "FAIL")
                all_pass = False
            else:
                data = response.json()
                if "items" not in data:
                    log(f"❌ {endpoint} missing 'items' key: {data}", "FAIL")
                    all_pass = False
                else:
                    log(f"✅ {endpoint} works - {len(data['items'])} items", "PASS")
        
        # Test telc-bookings should return 404 or error (not 500)
        response = session.get(f"{BASE_URL}/admin/inbox/telc-bookings")
        if response.status_code == 500:
            log(f"❌ /admin/inbox/telc-bookings returned 500 (should be 404): {response.text}", "FAIL")
            all_pass = False
        elif response.status_code == 404:
            log(f"✅ /admin/inbox/telc-bookings correctly returns 404", "PASS")
        else:
            log(f"⚠️  /admin/inbox/telc-bookings returned {response.status_code} (expected 404, but not 500)", "WARN")
        
        return all_pass
    except Exception as e:
        log(f"❌ Exception testing unified inbox: {str(e)}", "FAIL")
        return False

def test_public_content():
    """Test 7: Public content still works (courses, home content without telc)"""
    try:
        log("TEST 7: Public content endpoints", "TEST")
        
        all_pass = True
        
        # Test courses endpoint
        response = session.get(f"{BASE_URL}/courses")
        if response.status_code != 200:
            log(f"❌ /courses failed with status {response.status_code}: {response.text}", "FAIL")
            all_pass = False
        else:
            data = response.json()
            if "courses" not in data:
                log(f"❌ /courses missing 'courses' key: {data}", "FAIL")
                all_pass = False
            else:
                courses = data["courses"]
                log(f"✅ /courses works - {len(courses)} courses", "PASS")
        
        # Test content endpoint (if exists)
        response = session.get(f"{BASE_URL}/content/home_hero")
        if response.status_code == 200:
            data = response.json()
            # Check if response contains 'telc' text
            response_text = json.dumps(data).lower()
            if "telc" in response_text:
                log(f"⚠️  /content/home_hero contains 'telc' text (should be removed)", "WARN")
            else:
                log(f"✅ /content/home_hero has no 'telc' references", "PASS")
        elif response.status_code == 404:
            log(f"⚠️  /content/home_hero not found (endpoint may not exist)", "WARN")
        else:
            log(f"⚠️  /content/home_hero returned {response.status_code}", "WARN")
        
        return all_pass
    except Exception as e:
        log(f"❌ Exception testing public content: {str(e)}", "FAIL")
        return False

def test_sanity_vocational():
    """Test 8: Sanity check - vocational jobs endpoint works"""
    try:
        log("TEST 8: Sanity check - vocational jobs", "TEST")
        
        response = session.get(f"{BASE_URL}/vocational/jobs")
        
        if response.status_code != 200:
            log(f"❌ /vocational/jobs failed with status {response.status_code}: {response.text}", "FAIL")
            return False
        
        data = response.json()
        if "jobs" not in data:
            log(f"❌ /vocational/jobs missing 'jobs' key: {data}", "FAIL")
            return False
        
        jobs = data["jobs"]
        log(f"✅ /vocational/jobs works - {len(jobs)} jobs", "PASS")
        return True
    except Exception as e:
        log(f"❌ Exception testing vocational jobs: {str(e)}", "FAIL")
        return False

def main():
    """Run all tests"""
    log("=" * 80, "INFO")
    log("REGRESSION TEST: telc Feature Removal", "INFO")
    log(f"Base URL: {BASE_URL}", "INFO")
    log("=" * 80, "INFO")
    
    results = []
    
    # Test 1: Auth
    results.append(("Auth Login", test_auth_login()))
    
    # Test 2: Removed endpoints
    results.append(("Removed Endpoints", test_removed_endpoints()))
    
    # Test 3: Dashboard
    results.append(("Dashboard No telc", test_dashboard_no_telc()))
    
    # Test 4: Admin Stats
    results.append(("Admin Stats No telc", test_admin_stats_no_telc()))
    
    # Test 5: Site Features
    results.append(("Site Features No telc", test_site_features_no_telc()))
    
    # Test 6: Unified Inbox
    results.append(("Unified Inbox", test_unified_inbox()))
    
    # Test 7: Public Content
    results.append(("Public Content", test_public_content()))
    
    # Test 8: Sanity Check
    results.append(("Vocational Jobs", test_sanity_vocational()))
    
    # Summary
    log("=" * 80, "INFO")
    log("TEST SUMMARY", "INFO")
    log("=" * 80, "INFO")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        log(f"{name}: {status}", "INFO")
    
    log("=" * 80, "INFO")
    log(f"TOTAL: {passed}/{total} tests passed ({passed*100//total}%)", "INFO")
    log("=" * 80, "INFO")
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
