#!/usr/bin/env python3
"""
Focused test for German Visitors notifications and database verification
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "https://telc-academy.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

def print_test_result(test_name, success, details=""):
    """Print formatted test results"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} - {test_name}")
    if details:
        print(f"    {details}")
    print()

def login_super_admin():
    """Login as super admin and return session cookies"""
    print("🔍 Logging in as super admin...")
    
    try:
        login_data = {
            "email": "bachir.devops@gmail.com",
            "password": "@26042026Admin"
        }
        
        response = requests.post(f"{API_BASE}/auth/login", json=login_data, timeout=10)
        
        if response.status_code != 200:
            print_test_result("Super admin login", False, f"Status: {response.status_code}")
            return None
            
        cookies = response.cookies
        print_test_result("Super admin login", True, "Successfully logged in")
        return cookies
        
    except Exception as e:
        print_test_result("Super admin login", False, f"Exception: {str(e)}")
        return None

def test_notifications_and_database():
    """Test notifications side-effect and database insertions"""
    print("🔍 Testing notifications side-effect and database insertions")
    
    try:
        # Login as super admin
        cookies = login_super_admin()
        if not cookies:
            return False
            
        # Get current notification count
        response = requests.get(f"{API_BASE}/notifications", cookies=cookies, timeout=10)
        if response.status_code != 200:
            print_test_result("Get notifications", False, f"Status: {response.status_code}")
            return False
            
        initial_data = response.json()
        initial_count = len(initial_data.get('notifications', []))
        print(f"    Initial notification count: {initial_count}")
        
        # Create a unique booking with timestamp
        timestamp = int(time.time())
        booking_data = {
            "name": f"Test Notification User {timestamp}",
            "email": f"notify{timestamp}@test.de",
            "phone": f"+49{timestamp % 1000000000}",
            "dateFrom": "2026-09-01",
            "dateTo": "2026-09-10",
            "travelers": 2,
            "requests": "Test notification booking",
            "source": "Test"
        }
        
        print(f"    Creating booking for: {booking_data['name']}")
        booking_response = requests.post(f"{API_BASE}/german/bookings", json=booking_data, timeout=10)
        if booking_response.status_code != 200:
            print_test_result("Notification test booking", False, f"Booking failed: {booking_response.status_code}, Response: {booking_response.text}")
            return False
            
        booking_result = booking_response.json()
        print(f"    Booking response: {booking_result}")
        
        # Create a unique service request
        service_data = {
            "name": f"Test Service User {timestamp}",
            "email": f"service{timestamp}@test.de",
            "whatsapp": f"+49{timestamp % 1000000000 + 1}",
            "location": "germany",
            "travelers": 1,
            "services": ["consult", "visa"],
            "notes": "Test notification service request"
        }
        
        print(f"    Creating service request for: {service_data['name']}")
        service_response = requests.post(f"{API_BASE}/german/service-requests", json=service_data, timeout=10)
        if service_response.status_code != 200:
            print_test_result("Notification test service", False, f"Service request failed: {service_response.status_code}, Response: {service_response.text}")
            return False
            
        service_result = service_response.json()
        print(f"    Service request response: {service_result}")
        
        # Wait for notifications to be created
        print("    Waiting 2 seconds for notifications to be processed...")
        time.sleep(2)
        
        # Check notifications again
        response = requests.get(f"{API_BASE}/notifications", cookies=cookies, timeout=10)
        if response.status_code != 200:
            print_test_result("Get notifications after", False, f"Status: {response.status_code}")
            return False
            
        final_data = response.json()
        final_count = len(final_data.get('notifications', []))
        new_notifications = final_count - initial_count
        
        print(f"    Final notification count: {final_count}")
        print(f"    New notifications created: {new_notifications}")
        
        # Check for specific notification types in recent notifications
        notifications = final_data.get('notifications', [])
        recent_notifications = notifications[:10]  # Check recent ones
        
        print("    Recent notification titles:")
        for i, notif in enumerate(recent_notifications[:5]):
            print(f"      {i+1}. {notif.get('title', 'No title')}")
        
        booking_notification = any('Buchungsanfrage' in n.get('title', '') for n in recent_notifications)
        service_notification = any('Service-Anfrage' in n.get('title', '') for n in recent_notifications)
        
        success = True
        details = []
        
        if new_notifications >= 2:
            details.append(f"Created {new_notifications} new notifications")
        else:
            success = False
            details.append(f"Expected at least 2 new notifications, got {new_notifications}")
            
        if booking_notification:
            details.append("Found 'Buchungsanfrage' notification")
        else:
            success = False
            details.append("Missing 'Buchungsanfrage' notification")
            
        if service_notification:
            details.append("Found 'Service-Anfrage' notification")
        else:
            success = False
            details.append("Missing 'Service-Anfrage' notification")
            
        print_test_result("Notifications side-effect", success, "; ".join(details))
        return success
        
    except Exception as e:
        print_test_result("Notifications side-effect", False, f"Exception: {str(e)}")
        return False

def test_database_verification():
    """Verify that data was inserted into MongoDB collections"""
    print("🔍 Testing database verification (indirect via API)")
    
    try:
        # We can't directly access MongoDB, but we can verify through the API
        # by checking if the page-data endpoint returns the expected structure
        
        response = requests.get(f"{API_BASE}/german/page-data", timeout=10)
        if response.status_code != 200:
            print_test_result("Database verification", False, f"Page data endpoint failed: {response.status_code}")
            return False
            
        data = response.json()
        
        # Verify all collections exist and have data
        collections_with_data = []
        for collection_name in ['settings', 'why', 'packages', 'experiences', 'faq', 'flashcards', 'testimonials', 'gallery', 'emergency']:
            collection_data = data.get(collection_name)
            if collection_data:
                if isinstance(collection_data, list):
                    collections_with_data.append(f"{collection_name}: {len(collection_data)} items")
                else:
                    collections_with_data.append(f"{collection_name}: object")
            else:
                print_test_result("Database verification", False, f"Missing collection: {collection_name}")
                return False
                
        print_test_result("Database verification", True, f"All collections seeded: {'; '.join(collections_with_data)}")
        return True
        
    except Exception as e:
        print_test_result("Database verification", False, f"Exception: {str(e)}")
        return False

def main():
    """Run focused tests"""
    print("=" * 80)
    print("🔍 FOCUSED GERMAN VISITORS TESTING")
    print("=" * 80)
    print(f"Base URL: {BASE_URL}")
    print()
    
    # Test database verification first
    db_success = test_database_verification()
    
    # Test notifications
    notif_success = test_notifications_and_database()
    
    print("=" * 80)
    print("📊 FOCUSED TEST SUMMARY")
    print("=" * 80)
    
    tests = [
        ("Database verification", db_success),
        ("Notifications side-effect", notif_success)
    ]
    
    passed = sum(1 for _, result in tests if result)
    total = len(tests)
    
    for test_name, result in tests:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print()
    print(f"Results: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)