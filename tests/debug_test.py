#!/usr/bin/env python3
"""
Debug test to investigate None response issues
"""

import requests
import json

BASE_URL = "https://telc-academy.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

def debug_request(method, endpoint, data=None, session=None):
    """Debug HTTP request"""
    url = f"{API_URL}/{endpoint.lstrip('/')}"
    req_session = session or requests
    
    print(f"\n--- DEBUG REQUEST ---")
    print(f"Method: {method}")
    print(f"URL: {url}")
    print(f"Data: {data}")
    print(f"Session: {type(req_session)}")
    
    try:
        if method.upper() == 'GET':
            response = req_session.get(url, timeout=30)
        elif method.upper() == 'POST':
            response = req_session.post(url, json=data, timeout=30)
        else:
            response = req_session.patch(url, json=data, timeout=30)
        
        print(f"Response Status: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Text: {response.text[:500]}")
        return response
        
    except requests.exceptions.Timeout:
        print("ERROR: Request timed out")
        return None
    except requests.exceptions.ConnectionError as e:
        print(f"ERROR: Connection error: {e}")
        return None
    except Exception as e:
        print(f"ERROR: {e}")
        return None

def main():
    print("=== DEBUGGING API CONNECTIVITY ===")
    
    # Test 1: Basic health check
    print("\n1. Testing health endpoint...")
    health_response = debug_request('GET', 'health')
    
    # Test 2: Super admin login
    print("\n2. Testing super admin login...")
    admin_session = requests.Session()
    login_response = debug_request('POST', 'auth/login', {
        'email': SUPER_ADMIN_EMAIL,
        'password': SUPER_ADMIN_PASSWORD
    }, admin_session)
    
    if login_response and login_response.status_code == 200:
        print("✅ Login successful")
        
        # Test 3: Test authenticated endpoint
        print("\n3. Testing authenticated endpoint...")
        users_response = debug_request('GET', 'admin/users', session=admin_session)
        
        # Test 4: Create a test user
        print("\n4. Testing user creation...")
        import time
        timestamp = str(int(time.time()))
        test_email = f"debug_test_{timestamp}@example.com"
        
        create_response = debug_request('POST', 'admin/users', {
            'name': 'Debug Test User',
            'email': test_email,
            'password': 'password123',
            'role': 'student'
        }, admin_session)
        
        if create_response and create_response.status_code == 200:
            user_data = create_response.json()
            user_id = user_data.get('user', {}).get('id')
            print(f"✅ User created with ID: {user_id}")
            
            # Test 5: Login as new user
            print("\n5. Testing new user login...")
            student_session = requests.Session()
            student_login_response = debug_request('POST', 'auth/login', {
                'email': test_email,
                'password': 'password123'
            }, student_session)
            
            if student_login_response and student_login_response.status_code == 200:
                print("✅ Student login successful")
                
                # Test 6: Test forbidden access
                print("\n6. Testing forbidden access...")
                forbidden_response = debug_request('GET', 'admin/users', session=student_session)
                
                if forbidden_response:
                    if forbidden_response.status_code == 403:
                        print("✅ Forbidden access correctly blocked")
                    else:
                        print(f"❌ Expected 403, got {forbidden_response.status_code}")
                else:
                    print("❌ No response received for forbidden access test")
            else:
                print("❌ Student login failed")
        else:
            print("❌ User creation failed")
    else:
        print("❌ Admin login failed")

if __name__ == "__main__":
    main()