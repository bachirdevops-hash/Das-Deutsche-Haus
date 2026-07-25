#!/usr/bin/env python3
"""
Feature Flags API Testing
Tests the site-features API used to enable/disable specific site pages (telc, german_visitors)
"""

import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "https://telc-academy.preview.emergentagent.com/api"

# Admin credentials to try (in order)
ADMIN_CREDENTIALS = [
    {"email": "bachir.devops@gmail.com", "password": "@26042026Admin"},
]

# Test state
test_state = {
    "admin_cookie": None,
    "admin_email": None,
    "tests_passed": 0,
    "tests_failed": 0,
    "original_flags": {}
}

def log(msg, level="INFO"):
    """Log test messages"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    symbol = "✅" if level == "PASS" else "❌" if level == "FAIL" else "ℹ️"
    print(f"[{timestamp}] {symbol} {msg}")

def make_request(method, path, data=None, cookie=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{path}"
    headers = {}
    if cookie:
        headers["Cookie"] = cookie
    
    try:
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=30)
        elif method == "POST":
            resp = requests.post(url, json=data, headers=headers, timeout=30)
        elif method == "PATCH":
            resp = requests.patch(url, json=data, headers=headers, timeout=30)
        elif method == "DELETE":
            resp = requests.delete(url, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        return resp
    except requests.exceptions.Timeout:
        log(f"Request timeout after 30s for {method} {path}", "FAIL")
        return None
    except Exception as e:
        log(f"Request failed for {method} {path}: {str(e)}", "FAIL")
        return None

def try_admin_login():
    """Try to login with available admin credentials"""
    log("\n" + "="*80)
    log("ATTEMPTING ADMIN LOGIN")
    log("="*80)
    
    for cred in ADMIN_CREDENTIALS:
        log(f"Trying credentials: {cred['email']}")
        resp = make_request("POST", "/auth/login", cred)
        
        if not resp:
            log(f"Login request failed for {cred['email']}", "FAIL")
            continue
        
        if resp.status_code == 200:
            cookie = resp.headers.get("Set-Cookie", "")
            if "ddh_token=" in cookie:
                cookie = cookie.split(";")[0]
                test_state["admin_cookie"] = cookie
                test_state["admin_email"] = cred['email']
                log(f"Admin login successful: {cred['email']}", "PASS")
                return True
            else:
                log(f"No ddh_token in response for {cred['email']}", "FAIL")
        else:
            log(f"Login failed with status {resp.status_code} for {cred['email']}", "FAIL")
    
    log("All admin login attempts failed", "FAIL")
    return False

def test_1_public_endpoint():
    """Test 1: Public endpoint (NO AUTH REQUIRED — critical)"""
    log("\n" + "="*80)
    log("TEST 1: PUBLIC ENDPOINT - GET /api/site-features")
    log("="*80)
    
    try:
        resp = make_request("GET", "/site-features")
        
        if not resp:
            log("Public endpoint request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 200:
            log(f"Expected 200, got {resp.status_code}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        data = resp.json()
        
        # Verify structure
        if "flags" not in data:
            log(f"Missing 'flags' key in response: {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        flags = data["flags"]
        
        # Verify both keys exist
        if "telc" not in flags:
            log("Missing 'telc' key in flags", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if "german_visitors" not in flags:
            log("Missing 'german_visitors' key in flags", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        # Verify types
        if not isinstance(flags["telc"], bool):
            log(f"telc flag is not boolean: {type(flags['telc'])}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if not isinstance(flags["german_visitors"], bool):
            log(f"german_visitors flag is not boolean: {type(flags['german_visitors'])}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        # Store original flags for restoration
        test_state["original_flags"] = flags.copy()
        
        log(f"Public endpoint working correctly: {flags}", "PASS")
        log(f"telc: {flags['telc']}, german_visitors: {flags['german_visitors']}", "INFO")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 1 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_2_admin_get_without_auth():
    """Test 2: Admin GET without auth should return 401"""
    log("\n" + "="*80)
    log("TEST 2: ADMIN GET WITHOUT AUTH - Should return 401")
    log("="*80)
    
    try:
        resp = make_request("GET", "/admin/site-features")
        
        if not resp:
            log("Admin endpoint request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 401:
            log(f"Expected 401, got {resp.status_code}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("Admin endpoint correctly requires authentication (401)", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 2 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_3_admin_get_with_auth():
    """Test 3: Admin GET with super_admin cookie"""
    log("\n" + "="*80)
    log("TEST 3: ADMIN GET WITH AUTH - GET /api/admin/site-features")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("Skipping test - no admin cookie available", "INFO")
        return False
    
    try:
        resp = make_request("GET", "/admin/site-features", cookie=test_state["admin_cookie"])
        
        if not resp:
            log("Admin GET request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 200:
            log(f"Expected 200, got {resp.status_code}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        data = resp.json()
        
        # Verify structure
        if "features" not in data:
            log(f"Missing 'features' key in response: {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        features = data["features"]
        
        if not isinstance(features, list):
            log(f"features is not a list: {type(features)}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        # Verify both features exist
        feature_keys = [f["key"] for f in features]
        
        if "telc" not in feature_keys:
            log("Missing 'telc' in features list", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if "german_visitors" not in feature_keys:
            log("Missing 'german_visitors' in features list", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        # Verify each feature has required fields
        for feature in features:
            if "key" not in feature:
                log(f"Feature missing 'key' field: {feature}", "FAIL")
                test_state["tests_failed"] += 1
                return False
            
            if "enabled" not in feature:
                log(f"Feature missing 'enabled' field: {feature}", "FAIL")
                test_state["tests_failed"] += 1
                return False
            
            if "updatedAt" not in feature:
                log(f"Feature missing 'updatedAt' field: {feature}", "FAIL")
                test_state["tests_failed"] += 1
                return False
        
        log(f"Admin GET working correctly, found {len(features)} features", "PASS")
        for f in features:
            log(f"  - {f['key']}: enabled={f['enabled']}, updatedAt={f['updatedAt']}", "INFO")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 3 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_4_admin_patch_toggle_telc_off():
    """Test 4: Admin PATCH — toggle telc OFF"""
    log("\n" + "="*80)
    log("TEST 4: ADMIN PATCH - Toggle telc OFF")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("Skipping test - no admin cookie available", "INFO")
        return False
    
    try:
        # Toggle telc OFF
        resp = make_request("PATCH", "/admin/site-features/telc", 
                          {"enabled": False}, 
                          cookie=test_state["admin_cookie"])
        
        if not resp:
            log("PATCH request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 200:
            log(f"Expected 200, got {resp.status_code}: {resp.text}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        data = resp.json()
        
        # Verify response structure
        if not data.get("ok"):
            log(f"Response ok is not true: {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if data.get("key") != "telc":
            log(f"Response key is not 'telc': {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if data.get("enabled") != False:
            log(f"Response enabled is not False: {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("PATCH response correct: telc toggled OFF", "PASS")
        
        # Immediately verify public endpoint reflects the change
        time.sleep(0.5)  # Small delay to ensure DB write completes
        
        resp_public = make_request("GET", "/site-features")
        if not resp_public or resp_public.status_code != 200:
            log("Failed to verify public endpoint after toggle", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        public_data = resp_public.json()
        if public_data.get("flags", {}).get("telc") != False:
            log(f"Public endpoint did not reflect change: {public_data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("Public endpoint correctly shows telc=false", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 4 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_5_admin_patch_invalid_key():
    """Test 5: Admin PATCH — invalid key rejected"""
    log("\n" + "="*80)
    log("TEST 5: ADMIN PATCH - Invalid key should return 400")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("Skipping test - no admin cookie available", "INFO")
        return False
    
    try:
        resp = make_request("PATCH", "/admin/site-features/some_invalid_key", 
                          {"enabled": False}, 
                          cookie=test_state["admin_cookie"])
        
        if not resp:
            log("PATCH request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 400:
            log(f"Expected 400, got {resp.status_code}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        data = resp.json()
        
        # Verify error message
        if "error" not in data:
            log(f"Missing error message in response: {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if "مفتاح غير معروف" not in data["error"]:
            log(f"Unexpected error message: {data['error']}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("Invalid key correctly rejected with 400 and Arabic error", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 5 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_6_admin_patch_restore_telc():
    """Test 6: Admin PATCH — restore telc back to ON"""
    log("\n" + "="*80)
    log("TEST 6: ADMIN PATCH - Restore telc back to ON")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("Skipping test - no admin cookie available", "INFO")
        return False
    
    try:
        # Toggle telc ON
        resp = make_request("PATCH", "/admin/site-features/telc", 
                          {"enabled": True}, 
                          cookie=test_state["admin_cookie"])
        
        if not resp:
            log("PATCH request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 200:
            log(f"Expected 200, got {resp.status_code}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        data = resp.json()
        
        if not data.get("ok") or data.get("enabled") != True:
            log(f"Response incorrect: {data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("PATCH response correct: telc toggled ON", "PASS")
        
        # Verify public endpoint
        time.sleep(0.5)
        resp_public = make_request("GET", "/site-features")
        if not resp_public or resp_public.status_code != 200:
            log("Failed to verify public endpoint", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        public_data = resp_public.json()
        if public_data.get("flags", {}).get("telc") != True:
            log(f"Public endpoint did not reflect change: {public_data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("Public endpoint correctly shows telc=true", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 6 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_7_admin_patch_german_visitors_roundtrip():
    """Test 7: Admin PATCH — toggle german_visitors OFF then back ON"""
    log("\n" + "="*80)
    log("TEST 7: ADMIN PATCH - german_visitors full round trip (OFF → ON)")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("Skipping test - no admin cookie available", "INFO")
        return False
    
    try:
        # Toggle german_visitors OFF
        log("Step 1: Toggle german_visitors OFF")
        resp = make_request("PATCH", "/admin/site-features/german_visitors", 
                          {"enabled": False}, 
                          cookie=test_state["admin_cookie"])
        
        if not resp or resp.status_code != 200:
            log(f"Failed to toggle OFF: {resp.status_code if resp else 'no response'}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("  ✓ PATCH OFF successful")
        
        # Verify public endpoint shows OFF
        time.sleep(0.5)
        resp_public = make_request("GET", "/site-features")
        if not resp_public or resp_public.status_code != 200:
            log("Failed to verify public endpoint after OFF", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        public_data = resp_public.json()
        if public_data.get("flags", {}).get("german_visitors") != False:
            log(f"Public endpoint did not show OFF: {public_data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("  ✓ Public endpoint shows german_visitors=false")
        
        # Toggle german_visitors ON
        log("Step 2: Toggle german_visitors ON")
        resp = make_request("PATCH", "/admin/site-features/german_visitors", 
                          {"enabled": True}, 
                          cookie=test_state["admin_cookie"])
        
        if not resp or resp.status_code != 200:
            log(f"Failed to toggle ON: {resp.status_code if resp else 'no response'}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("  ✓ PATCH ON successful")
        
        # Verify public endpoint shows ON
        time.sleep(0.5)
        resp_public = make_request("GET", "/site-features")
        if not resp_public or resp_public.status_code != 200:
            log("Failed to verify public endpoint after ON", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        public_data = resp_public.json()
        if public_data.get("flags", {}).get("german_visitors") != True:
            log(f"Public endpoint did not show ON: {public_data}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log("  ✓ Public endpoint shows german_visitors=true")
        log("Full round trip successful", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 7 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_8_activity_log_audit():
    """Test 8: Activity Log audit"""
    log("\n" + "="*80)
    log("TEST 8: ACTIVITY LOG AUDIT")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("Skipping test - no admin cookie available", "INFO")
        return False
    
    try:
        resp = make_request("GET", "/admin/activity-logs", cookie=test_state["admin_cookie"])
        
        if not resp:
            log("Activity logs request failed", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        if resp.status_code != 200:
            log(f"Expected 200, got {resp.status_code}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        data = resp.json()
        logs = data.get("logs", [])
        
        # Find site_feature.toggle actions
        toggle_logs = [log for log in logs if log.get("action") == "site_feature.toggle"]
        
        if len(toggle_logs) < 2:
            log(f"Expected at least 2 toggle logs, found {len(toggle_logs)}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        
        log(f"Found {len(toggle_logs)} site_feature.toggle logs", "PASS")
        
        # Verify structure of toggle logs
        for tlog in toggle_logs[:3]:  # Check first 3
            if tlog.get("entity") != "site_features":
                log(f"Log entity is not 'site_features': {tlog}", "FAIL")
                test_state["tests_failed"] += 1
                return False
            
            meta = tlog.get("meta", {})
            if "enabled" not in meta:
                log(f"Log meta missing 'enabled' field: {tlog}", "FAIL")
                test_state["tests_failed"] += 1
                return False
            
            if not isinstance(meta["enabled"], bool):
                log(f"Log meta.enabled is not boolean: {tlog}", "FAIL")
                test_state["tests_failed"] += 1
                return False
        
        log("Activity logs have correct structure with meta.enabled", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 8 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def test_9_non_regression_checks():
    """Test 9: Non-regression checks (existing endpoints must still work)"""
    log("\n" + "="*80)
    log("TEST 9: NON-REGRESSION CHECKS")
    log("="*80)
    
    try:
        # Test 1: GET /api/courses
        log("Checking GET /api/courses...")
        resp = make_request("GET", "/courses")
        if not resp or resp.status_code != 200:
            log(f"GET /api/courses failed: {resp.status_code if resp else 'no response'}", "FAIL")
            test_state["tests_failed"] += 1
            return False
        log("  ✓ GET /api/courses working")
        
        # Test 2: GET /api/admin/users (with auth)
        if test_state["admin_cookie"]:
            log("Checking GET /api/admin/users...")
            resp = make_request("GET", "/admin/users", cookie=test_state["admin_cookie"])
            if not resp or resp.status_code != 200:
                log(f"GET /api/admin/users failed: {resp.status_code if resp else 'no response'}", "FAIL")
                test_state["tests_failed"] += 1
                return False
            log("  ✓ GET /api/admin/users working")
        
        # Test 3: GET /api/admin/site-features (with auth)
        if test_state["admin_cookie"]:
            log("Checking GET /api/admin/site-features...")
            resp = make_request("GET", "/admin/site-features", cookie=test_state["admin_cookie"])
            if not resp or resp.status_code != 200:
                log(f"GET /api/admin/site-features failed: {resp.status_code if resp else 'no response'}", "FAIL")
                test_state["tests_failed"] += 1
                return False
            log("  ✓ GET /api/admin/site-features working")
        
        log("All non-regression checks passed", "PASS")
        test_state["tests_passed"] += 1
        return True
        
    except Exception as e:
        log(f"Test 9 exception: {str(e)}", "FAIL")
        test_state["tests_failed"] += 1
        return False

def ensure_final_state():
    """Ensure both flags are enabled: true at the end"""
    log("\n" + "="*80)
    log("FINAL STATE RESTORATION")
    log("="*80)
    
    if not test_state["admin_cookie"]:
        log("No admin cookie - cannot restore final state", "INFO")
        return
    
    try:
        # Get current state
        resp = make_request("GET", "/site-features")
        if not resp or resp.status_code != 200:
            log("Failed to get current state", "FAIL")
            return
        
        current_flags = resp.json().get("flags", {})
        log(f"Current flags: {current_flags}")
        
        # Ensure both are enabled
        for key in ["telc", "german_visitors"]:
            if not current_flags.get(key, False):
                log(f"Restoring {key} to enabled=true...")
                resp = make_request("PATCH", f"/admin/site-features/{key}", 
                                  {"enabled": True}, 
                                  cookie=test_state["admin_cookie"])
                if resp and resp.status_code == 200:
                    log(f"  ✓ {key} restored to enabled=true")
                else:
                    log(f"  ✗ Failed to restore {key}", "FAIL")
        
        # Final verification
        time.sleep(0.5)
        resp = make_request("GET", "/site-features")
        if resp and resp.status_code == 200:
            final_flags = resp.json().get("flags", {})
            log(f"Final state: {final_flags}", "PASS")
            if final_flags.get("telc") and final_flags.get("german_visitors"):
                log("Both flags are enabled - site fully functional", "PASS")
            else:
                log("Warning: Not all flags are enabled", "FAIL")
        
    except Exception as e:
        log(f"Final state restoration exception: {str(e)}", "FAIL")

def main():
    """Main test execution"""
    log("\n" + "="*80)
    log("FEATURE FLAGS API TESTING")
    log("="*80)
    log(f"Base URL: {BASE_URL}")
    log(f"Testing site-features API for telc and german_visitors pages")
    
    # Test 1: Public endpoint (CRITICAL - no auth required)
    test_1_public_endpoint()
    
    # Test 2: Admin GET without auth
    test_2_admin_get_without_auth()
    
    # Try admin login
    admin_logged_in = try_admin_login()
    
    if admin_logged_in:
        # Test 3: Admin GET with auth
        test_3_admin_get_with_auth()
        
        # Test 4: Toggle telc OFF
        test_4_admin_patch_toggle_telc_off()
        
        # Test 5: Invalid key
        test_5_admin_patch_invalid_key()
        
        # Test 6: Restore telc ON
        test_6_admin_patch_restore_telc()
        
        # Test 7: german_visitors round trip
        test_7_admin_patch_german_visitors_roundtrip()
        
        # Test 8: Activity log audit
        test_8_activity_log_audit()
        
        # Test 9: Non-regression checks
        test_9_non_regression_checks()
        
        # Ensure final state
        ensure_final_state()
    else:
        log("\n⚠️  Admin login failed - skipping auth-based tests", "INFO")
        log("However, the CRITICAL public endpoint test was completed", "INFO")
    
    # Summary
    log("\n" + "="*80)
    log("TEST SUMMARY")
    log("="*80)
    log(f"Tests Passed: {test_state['tests_passed']}")
    log(f"Tests Failed: {test_state['tests_failed']}")
    total = test_state['tests_passed'] + test_state['tests_failed']
    if total > 0:
        success_rate = (test_state['tests_passed'] / total) * 100
        log(f"Success Rate: {success_rate:.1f}%")
    
    if test_state['tests_failed'] == 0:
        log("✅ ALL TESTS PASSED", "PASS")
    else:
        log(f"❌ {test_state['tests_failed']} TEST(S) FAILED", "FAIL")
    
    if admin_logged_in:
        log(f"Admin credentials used: {test_state['admin_email']}", "INFO")
    else:
        log("Admin credentials: ALL FAILED", "INFO")

if __name__ == "__main__":
    main()
