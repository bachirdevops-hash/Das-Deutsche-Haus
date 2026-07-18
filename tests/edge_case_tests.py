#!/usr/bin/env python3
"""
Additional Edge Case Tests for Das Deutsche Haus API
Tests specific edge cases and advanced scenarios
"""

import requests
import json
import time
import random
import string

# Configuration
BASE_URL = "https://telc-academy.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

def generate_unique_email():
    timestamp = str(int(time.time()))
    random_str = ''.join(random.choices(string.ascii_lowercase, k=4))
    return f"test_{timestamp}_{random_str}@example.com"

def test_blog_view_increment():
    """Test that blog post views increment correctly"""
    session = requests.Session()
    
    print("🔍 Testing blog view increment...")
    
    # Get a blog post
    response = session.get(f"{API_BASE}/blog")
    if response.status_code == 200:
        data = response.json()
        items = data.get('items', [])
        if items:
            slug = items[0].get('slug')
            
            # Get initial view count
            response1 = session.get(f"{API_BASE}/blog/{slug}")
            if response1.status_code == 200:
                post1 = response1.json().get('post', {})
                views1 = post1.get('views', 0)
                
                # Get again to increment
                response2 = session.get(f"{API_BASE}/blog/{slug}")
                if response2.status_code == 200:
                    post2 = response2.json().get('post', {})
                    views2 = post2.get('views', 0)
                    
                    if views2 > views1:
                        print(f"✅ PASS: Blog view increment ({views1} → {views2})")
                        return True
                    else:
                        print(f"❌ FAIL: Blog view not incremented ({views1} → {views2})")
                        return False
    
    print("❌ FAIL: Could not test blog view increment")
    return False

def test_activity_anti_oversell():
    """Test activity anti-oversell protection"""
    session = requests.Session()
    
    print("🔍 Testing activity anti-oversell protection...")
    
    # Login as admin
    login_data = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    session.post(f"{API_BASE}/auth/login", json=login_data)
    
    # Create a test activity with limited seats
    activity_data = {
        "title": "Test Anti-Oversell Activity",
        "type": "workshop",
        "description": "Test activity for oversell protection",
        "date": "2026-12-31T10:00:00Z",
        "isFree": True,
        "requiresRegistration": True,
        "totalSeats": 2,
        "status": "Published"
    }
    
    response = session.post(f"{API_BASE}/admin/activities", json=activity_data)
    if response.status_code == 200:
        activity = response.json().get('item', {})
        activity_id = activity.get('id')
        slug = activity.get('slug')
        
        try:
            # Try to register 3 people (should fail on 3rd)
            registrations = []
            for i in range(3):
                reg_data = {
                    "name": f"Test User {i+1}",
                    "email": generate_unique_email(),
                    "phone": f"+96398765432{i}",
                    "attendees": 1,
                    "notes": f"Test registration {i+1}"
                }
                
                headers = {'X-Forwarded-For': f"192.168.1.{i+1}"}
                response = session.post(f"{API_BASE}/activities/{slug}/register", 
                                      json=reg_data, headers=headers)
                
                if i < 2:  # First 2 should succeed
                    if response.status_code == 200:
                        registrations.append(response.json().get('registration', {}))
                        print(f"  ✅ Registration {i+1} succeeded")
                    else:
                        print(f"  ❌ Registration {i+1} failed unexpectedly: {response.status_code}")
                        return False
                else:  # 3rd should fail
                    if response.status_code == 400:
                        error_data = response.json()
                        if 'remaining' in error_data:
                            print(f"  ✅ Registration {i+1} correctly blocked (remaining: {error_data['remaining']})")
                            return True
                        else:
                            print(f"  ❌ Registration {i+1} blocked but no remaining info")
                            return False
                    else:
                        print(f"  ❌ Registration {i+1} should have failed but got: {response.status_code}")
                        return False
            
        finally:
            # Cleanup: delete the test activity
            session.delete(f"{API_BASE}/admin/activities/{activity_id}")
    
    print("❌ FAIL: Could not test anti-oversell protection")
    return False

def test_slug_uniqueness():
    """Test that blog post slugs are unique"""
    session = requests.Session()
    
    print("🔍 Testing blog slug uniqueness...")
    
    # Login as admin
    login_data = {"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD}
    session.post(f"{API_BASE}/auth/login", json=login_data)
    
    # Create two blog posts with same title
    blog_data1 = {
        "title": "Test Unique Slug Post",
        "content": "First post content",
        "category": "test",
        "language": "ar",
        "status": "Draft"
    }
    
    blog_data2 = {
        "title": "Test Unique Slug Post",
        "content": "Second post content", 
        "category": "test",
        "language": "ar",
        "status": "Draft"
    }
    
    # Create first post
    response1 = session.post(f"{API_BASE}/admin/blog", json=blog_data1)
    if response1.status_code == 200:
        post1 = response1.json().get('item', {})
        slug1 = post1.get('slug')
        post1_id = post1.get('id')
        
        # Create second post
        response2 = session.post(f"{API_BASE}/admin/blog", json=blog_data2)
        if response2.status_code == 200:
            post2 = response2.json().get('item', {})
            slug2 = post2.get('slug')
            post2_id = post2.get('id')
            
            try:
                if slug1 != slug2:
                    print(f"  ✅ Slugs are unique: '{slug1}' vs '{slug2}'")
                    return True
                else:
                    print(f"  ❌ Slugs are not unique: '{slug1}' == '{slug2}'")
                    return False
            finally:
                # Cleanup
                session.delete(f"{API_BASE}/admin/blog/{post1_id}")
                session.delete(f"{API_BASE}/admin/blog/{post2_id}")
    
    print("❌ FAIL: Could not test slug uniqueness")
    return False

def test_rate_limiting():
    """Test rate limiting on activity registration"""
    session = requests.Session()
    
    print("🔍 Testing rate limiting...")
    
    # Get an activity that requires registration
    response = session.get(f"{API_BASE}/activities")
    if response.status_code == 200:
        data = response.json()
        items = data.get('items', [])
        
        registration_activity = None
        for item in items:
            if item.get('requiresRegistration') and item.get('status') == 'Published':
                registration_activity = item
                break
        
        if registration_activity:
            slug = registration_activity.get('slug')
            
            # Try to make 6 registrations quickly (should hit rate limit)
            same_ip = "192.168.100.100"
            headers = {'X-Forwarded-For': same_ip}
            
            for i in range(6):
                reg_data = {
                    "name": f"Rate Test User {i+1}",
                    "email": generate_unique_email(),
                    "phone": f"+96398765432{i}",
                    "attendees": 1,
                    "notes": f"Rate limit test {i+1}"
                }
                
                response = session.post(f"{API_BASE}/activities/{slug}/register", 
                                      json=reg_data, headers=headers)
                
                if i < 5:  # First 5 should succeed
                    if response.status_code in [200, 400]:  # 400 might be validation error
                        print(f"  ✅ Request {i+1} processed")
                    else:
                        print(f"  ⚠️ Request {i+1} unexpected status: {response.status_code}")
                else:  # 6th should be rate limited
                    if response.status_code == 429:
                        print(f"  ✅ Request {i+1} correctly rate limited (429)")
                        return True
                    else:
                        print(f"  ❌ Request {i+1} should be rate limited but got: {response.status_code}")
                        return False
                
                time.sleep(0.1)  # Small delay between requests
    
    print("❌ FAIL: Could not test rate limiting")
    return False

def test_german_form_submissions():
    """Test German form submissions with validation"""
    session = requests.Session()
    
    print("🔍 Testing German form submissions...")
    
    # Test valid booking
    booking_data = {
        "name": "Klaus Müller",
        "email": "klaus.test@example.com",
        "phone": "+49123456789",
        "dateFrom": "2026-06-01",
        "dateTo": "2026-06-15",
        "travelers": 2,
        "packageId": "package-1",
        "requests": "Vegetarian meals please"
    }
    
    response = session.post(f"{API_BASE}/german/bookings", json=booking_data)
    if response.status_code == 200:
        data = response.json()
        if "Vielen Dank" in data.get('message', ''):
            print("  ✅ German booking submission successful")
        else:
            print(f"  ❌ German booking unexpected response: {data}")
            return False
    else:
        print(f"  ❌ German booking failed: {response.status_code}")
        return False
    
    # Test invalid booking (missing required fields)
    invalid_booking = {
        "name": "",  # Missing name
        "email": "test@example.com",
        "phone": "+49123456789"
    }
    
    response = session.post(f"{API_BASE}/german/bookings", json=invalid_booking)
    if response.status_code == 400:
        data = response.json()
        if "Pflichtfelder" in data.get('error', ''):
            print("  ✅ German booking validation working")
        else:
            print(f"  ❌ German booking validation unexpected error: {data}")
            return False
    else:
        print(f"  ❌ German booking validation should return 400, got: {response.status_code}")
        return False
    
    # Test service request
    service_data = {
        "name": "Anna Schmidt",
        "email": "anna.test@example.com",
        "whatsapp": "+49987654321",
        "location": "Berlin",
        "services": ["translation", "visa_support"],
        "notes": "Need help with visa application"
    }
    
    response = session.post(f"{API_BASE}/german/service-requests", json=service_data)
    if response.status_code == 200:
        print("  ✅ German service request successful")
        return True
    else:
        print(f"  ❌ German service request failed: {response.status_code}")
        return False

def main():
    """Run additional edge case tests"""
    print("🚀 Running additional edge case tests...")
    print("="*50)
    
    tests = [
        test_blog_view_increment,
        test_activity_anti_oversell,
        test_slug_uniqueness,
        test_rate_limiting,
        test_german_form_submissions
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            if test():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"❌ FAIL: {test.__name__} - Exception: {e}")
            failed += 1
        print()
    
    total = passed + failed
    success_rate = (passed / total * 100) if total > 0 else 0
    
    print("="*50)
    print(f"EDGE CASE TESTS: {passed}/{total} passed ({success_rate:.1f}% success rate)")
    print("="*50)
    
    if failed > 0:
        print(f"❌ {failed} edge case tests failed")
        exit(1)
    else:
        print(f"✅ All {passed} edge case tests passed!")
        exit(0)

if __name__ == "__main__":
    main()