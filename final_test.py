#!/usr/bin/env python3
"""
Final comprehensive test for German Visitors endpoints
"""

import requests
import json
import time

BASE_URL = "https://telc-academy.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")
    print()

def comprehensive_test():
    """Run comprehensive test of all German Visitors functionality"""
    print("🇩🇪 COMPREHENSIVE GERMAN VISITORS TEST")
    print("=" * 60)
    
    results = []
    
    # Test 1: GET /api/german/page-data
    print("1️⃣ Testing GET /api/german/page-data")
    try:
        response = requests.get(f"{API_BASE}/german/page-data", timeout=10)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            # Verify structure
            required_keys = ['settings', 'why', 'packages', 'experiences', 'faq', 'flashcards', 'testimonials', 'gallery', 'emergency']
            missing_keys = [k for k in required_keys if k not in data]
            
            if missing_keys:
                success = False
                details = f"Missing keys: {missing_keys}"
            else:
                # Verify hero title
                hero_title = data.get('settings', {}).get('hero_title', '')
                if hero_title == 'Willkommen in Syrien 🇸🇾':
                    details = f"All 9 collections present, hero title correct"
                else:
                    success = False
                    details = f"Wrong hero title: {hero_title}"
        else:
            details = f"HTTP {response.status_code}"
            
        print_test_result("GET /api/german/page-data", success, details)
        results.append(success)
        
    except Exception as e:
        print_test_result("GET /api/german/page-data", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test 2: POST /api/german/bookings (success case)
    print("2️⃣ Testing POST /api/german/bookings (valid data)")
    try:
        timestamp = int(time.time())
        booking_data = {
            "name": "Klaus Müller",
            "email": f"klaus{timestamp}@test.de",
            "phone": "+491234567890",
            "dateFrom": "2026-09-01",
            "dateTo": "2026-09-10",
            "travelers": 2,
            "requests": "Vegetarisch",
            "source": "Google"
        }
        
        response = requests.post(f"{API_BASE}/german/bookings", json=booking_data, timeout=10)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            expected_message = 'Vielen Dank! Wir melden uns innerhalb von 24 Stunden.'
            if data.get('ok') and data.get('message') == expected_message:
                details = "Booking accepted with correct German message"
            else:
                success = False
                details = f"Unexpected response: {data}"
        else:
            details = f"HTTP {response.status_code}: {response.text}"
            
        print_test_result("POST /api/german/bookings (valid)", success, details)
        results.append(success)
        
    except Exception as e:
        print_test_result("POST /api/german/bookings (valid)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test 3: POST /api/german/bookings (validation)
    print("3️⃣ Testing POST /api/german/bookings (validation)")
    try:
        invalid_data = {"email": "test@example.com"}  # Missing name and phone
        
        response = requests.post(f"{API_BASE}/german/bookings", json=invalid_data, timeout=10)
        success = response.status_code == 400
        
        if success:
            data = response.json()
            expected_error = 'Bitte füllen Sie alle Pflichtfelder aus'
            if data.get('error') == expected_error:
                details = "Correct German validation error message"
            else:
                success = False
                details = f"Wrong error message: {data.get('error')}"
        else:
            details = f"Expected HTTP 400, got {response.status_code}"
            
        print_test_result("POST /api/german/bookings (validation)", success, details)
        results.append(success)
        
    except Exception as e:
        print_test_result("POST /api/german/bookings (validation)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test 4: POST /api/german/service-requests (success)
    print("4️⃣ Testing POST /api/german/service-requests (valid data)")
    try:
        timestamp = int(time.time())
        service_data = {
            "name": "Anna Schmidt",
            "email": f"anna{timestamp}@test.de",
            "whatsapp": f"+49{timestamp % 1000000000}",
            "location": "germany",
            "travelers": 1,
            "services": ["consult", "visa", "pickup", "sim"],
            "notes": "Test service request"
        }
        
        response = requests.post(f"{API_BASE}/german/service-requests", json=service_data, timeout=10)
        success = response.status_code == 200
        
        if success:
            data = response.json()
            if data.get('ok'):
                details = "Service request accepted successfully"
            else:
                success = False
                details = f"Unexpected response: {data}"
        else:
            details = f"HTTP {response.status_code}: {response.text}"
            
        print_test_result("POST /api/german/service-requests (valid)", success, details)
        results.append(success)
        
    except Exception as e:
        print_test_result("POST /api/german/service-requests (valid)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test 5: POST /api/german/service-requests (validation)
    print("5️⃣ Testing POST /api/german/service-requests (validation)")
    try:
        invalid_data = {"name": "Test"}  # Missing email and whatsapp
        
        response = requests.post(f"{API_BASE}/german/service-requests", json=invalid_data, timeout=10)
        success = response.status_code == 400
        
        if success:
            details = "Validation error returned correctly"
        else:
            details = f"Expected HTTP 400, got {response.status_code}"
            
        print_test_result("POST /api/german/service-requests (validation)", success, details)
        results.append(success)
        
    except Exception as e:
        print_test_result("POST /api/german/service-requests (validation)", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Test 6: Regression test - existing endpoints
    print("6️⃣ Testing regression - existing endpoints")
    try:
        # Test courses endpoint
        response = requests.get(f"{API_BASE}/courses", timeout=10)
        courses_ok = response.status_code == 200 and len(response.json().get('courses', [])) == 6
        
        # Test auth login
        login_data = {"email": "bachir.devops@gmail.com", "password": "@26042026Admin"}
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        auth_ok = response.status_code == 200
        
        success = courses_ok and auth_ok
        
        if success:
            details = "Courses (6 items) and auth login working"
        else:
            details = f"Courses OK: {courses_ok}, Auth OK: {auth_ok}"
            
        print_test_result("Regression test", success, details)
        results.append(success)
        
    except Exception as e:
        print_test_result("Regression test", False, f"Exception: {str(e)}")
        results.append(False)
    
    # Summary
    print("=" * 60)
    print("📊 FINAL TEST SUMMARY")
    print("=" * 60)
    
    test_names = [
        "GET /api/german/page-data",
        "POST /api/german/bookings (valid)",
        "POST /api/german/bookings (validation)",
        "POST /api/german/service-requests (valid)",
        "POST /api/german/service-requests (validation)",
        "Regression test"
    ]
    
    passed = sum(results)
    total = len(results)
    
    for i, (name, result) in enumerate(zip(test_names, results)):
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    if passed == total:
        print("🎉 ALL GERMAN VISITORS ENDPOINTS WORKING CORRECTLY!")
        print("✅ Page data endpoint returns all 9 collections")
        print("✅ Booking endpoint accepts valid requests with German messages")
        print("✅ Service request endpoint working with validation")
        print("✅ German validation error messages working")
        print("✅ No regressions in existing endpoints")
    else:
        print(f"⚠️  {total - passed} tests failed")
    
    return passed == total

if __name__ == "__main__":
    success = comprehensive_test()
    exit(0 if success else 1)