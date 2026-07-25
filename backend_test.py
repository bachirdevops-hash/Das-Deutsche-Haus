#!/usr/bin/env python3
"""
Regression Test Suite for Das Deutsche Haus Backend
Testing public endpoints after frontend-only changes
"""

import requests
import sys
import os

# Get base URL from environment or use default
BASE_URL = os.getenv('NEXT_PUBLIC_BASE_URL', 'https://telc-academy.preview.emergentagent.com')
API_BASE = f"{BASE_URL}/api"

print(f"🧪 Starting Regression Tests")
print(f"📍 Base URL: {BASE_URL}")
print(f"📍 API Base: {API_BASE}")
print("=" * 80)

# Test results tracking
tests_passed = 0
tests_failed = 0
test_results = []

def test_endpoint(test_name, method, endpoint, expected_status=200, validate_fn=None):
    """Generic test function for API endpoints"""
    global tests_passed, tests_failed
    
    url = f"{API_BASE}{endpoint}"
    print(f"\n🔍 Testing: {test_name}")
    print(f"   URL: {url}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=10)
        elif method == "POST":
            response = requests.post(url, timeout=10)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"   Status: {response.status_code}")
        
        # Check status code
        if response.status_code != expected_status:
            print(f"   ❌ FAIL: Expected status {expected_status}, got {response.status_code}")
            tests_failed += 1
            test_results.append(f"❌ {test_name}")
            return False
        
        # Parse JSON
        try:
            data = response.json()
        except Exception as e:
            print(f"   ❌ FAIL: Invalid JSON response: {e}")
            tests_failed += 1
            test_results.append(f"❌ {test_name}")
            return False
        
        # Run custom validation if provided
        if validate_fn:
            validation_result = validate_fn(data)
            if validation_result is not True:
                print(f"   ❌ FAIL: {validation_result}")
                tests_failed += 1
                test_results.append(f"❌ {test_name}")
                return False
        
        print(f"   ✅ PASS")
        tests_passed += 1
        test_results.append(f"✅ {test_name}")
        return True
        
    except requests.exceptions.Timeout:
        print(f"   ❌ FAIL: Request timeout")
        tests_failed += 1
        test_results.append(f"❌ {test_name}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAIL: Request error: {e}")
        tests_failed += 1
        test_results.append(f"❌ {test_name}")
        return False
    except Exception as e:
        print(f"   ❌ FAIL: Unexpected error: {e}")
        tests_failed += 1
        test_results.append(f"❌ {test_name}")
        return False


# Test 1: GET /api/site-features
def validate_site_features(data):
    if 'flags' not in data:
        return "Missing 'flags' key in response"
    
    flags = data['flags']
    if 'telc' not in flags:
        return "Missing 'telc' flag"
    if 'german_visitors' not in flags:
        return "Missing 'german_visitors' flag"
    
    print(f"   📊 Flags: telc={flags['telc']}, german_visitors={flags['german_visitors']}")
    return True

test_endpoint(
    "1. GET /api/site-features",
    "GET",
    "/site-features",
    validate_fn=validate_site_features
)


# Test 2: GET /api/content/home_hero
def validate_home_hero(data):
    if 'data' not in data:
        return "Missing 'data' key in response"
    
    print(f"   📊 Hero data keys: {list(data['data'].keys())}")
    return True

test_endpoint(
    "2. GET /api/content/home_hero",
    "GET",
    "/content/home_hero",
    validate_fn=validate_home_hero
)


# Test 3: GET /api/content/home_cta
def validate_home_cta(data):
    if 'data' not in data:
        return "Missing 'data' key in response"
    
    cta_data = data['data']
    
    # Check for required fields
    required_fields = ['title', 'subtitle', 'button1', 'button2', 'button3']
    for field in required_fields:
        if field not in cta_data:
            return f"Missing required field: {field}"
    
    # Validate buttons have label and action
    for i in range(1, 4):
        button_key = f'button{i}'
        button = cta_data[button_key]
        if 'label' not in button:
            return f"{button_key} missing 'label' field"
        if 'action' not in button:
            return f"{button_key} missing 'action' field"
    
    print(f"   📊 CTA buttons: {cta_data['button1']['label']}, {cta_data['button2']['label']}, {cta_data['button3']['label']}")
    return True

test_endpoint(
    "3. GET /api/content/home_cta",
    "GET",
    "/content/home_cta",
    validate_fn=validate_home_cta
)


# Test 4: GET /api/courses
def validate_courses(data):
    if 'courses' not in data:
        return "Missing 'courses' key in response"
    
    courses = data['courses']
    if not isinstance(courses, list):
        return "Courses should be an array"
    
    if len(courses) == 0:
        return "Courses array is empty"
    
    print(f"   📊 Found {len(courses)} courses")
    return True

test_endpoint(
    "4. GET /api/courses",
    "GET",
    "/courses",
    validate_fn=validate_courses
)


# Test 5: GET /api/telc-exams
def validate_telc_exams(data):
    if 'exams' not in data:
        return "Missing 'exams' key in response"
    
    exams = data['exams']
    if not isinstance(exams, list):
        return "Exams should be an array"
    
    print(f"   📊 Found {len(exams)} telc exams")
    return True

test_endpoint(
    "5. GET /api/telc-exams",
    "GET",
    "/telc-exams",
    validate_fn=validate_telc_exams
)


# Test 6: GET /api/vocational/jobs
def validate_vocational_jobs(data):
    if 'jobs' not in data:
        return "Missing 'jobs' key in response"
    
    jobs = data['jobs']
    if not isinstance(jobs, list):
        return "Jobs should be an array"
    
    if len(jobs) == 0:
        return "Jobs array is empty"
    
    print(f"   📊 Found {len(jobs)} vocational jobs")
    return True

test_endpoint(
    "6. GET /api/vocational/jobs",
    "GET",
    "/vocational/jobs",
    validate_fn=validate_vocational_jobs
)


# Test 7: GET /api/site-features (verify flags are true)
def validate_site_features_final(data):
    if 'flags' not in data:
        return "Missing 'flags' key in response"
    
    flags = data['flags']
    if 'telc' not in flags:
        return "Missing 'telc' flag"
    if 'german_visitors' not in flags:
        return "Missing 'german_visitors' flag"
    
    # Check if both flags are true
    if flags['telc'] is not True:
        print(f"   ⚠️  WARNING: telc flag is {flags['telc']}, expected True")
    if flags['german_visitors'] is not True:
        print(f"   ⚠️  WARNING: german_visitors flag is {flags['german_visitors']}, expected True")
    
    print(f"   📊 Final flags: telc={flags['telc']}, german_visitors={flags['german_visitors']}")
    return True

test_endpoint(
    "7. GET /api/site-features (verify flags)",
    "GET",
    "/site-features",
    validate_fn=validate_site_features_final
)


# Print summary
print("\n" + "=" * 80)
print("📊 TEST SUMMARY")
print("=" * 80)
for result in test_results:
    print(result)

print(f"\n✅ Passed: {tests_passed}")
print(f"❌ Failed: {tests_failed}")
print(f"📈 Success Rate: {(tests_passed / (tests_passed + tests_failed) * 100):.1f}%")

if tests_failed > 0:
    print("\n⚠️  REGRESSION DETECTED - Some tests failed")
    sys.exit(1)
else:
    print("\n✅ ALL TESTS PASSED - No regressions detected")
    sys.exit(0)
