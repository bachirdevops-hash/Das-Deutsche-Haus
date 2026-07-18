#!/usr/bin/env python3
"""
Focused RBAC test to verify the issue is resolved
"""

import requests
import time

BASE_URL = "https://telc-academy.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

def make_request(method, endpoint, data=None, session=None):
    """Make HTTP request with proper error handling"""
    url = f"{API_URL}/{endpoint.lstrip('/')}"
    req_session = session or requests
    
    try:
        if method.upper() == 'GET':
            response = req_session.get(url, timeout=30)
        elif method.upper() == 'POST':
            response = req_session.post(url, json=data, timeout=30)
        elif method.upper() == 'PATCH':
            response = req_session.patch(url, json=data, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
            
        return response
    except Exception as e:
        print(f"Request error for {method} {endpoint}: {e}")
        return None

def test_rbac():
    print("=== FOCUSED RBAC TEST ===")
    
    # Login as super admin
    admin_session = requests.Session()
    login_response = make_request('POST', 'auth/login', {
        'email': SUPER_ADMIN_EMAIL,
        'password': SUPER_ADMIN_PASSWORD
    }, admin_session)
    
    if not login_response or login_response.status_code != 200:
        print("❌ Admin login failed")
        return
    
    print("✅ Admin login successful")
    
    # Create test users
    timestamp = str(int(time.time()))
    test_users = []
    
    for role in ['student', 'manager', 'teacher']:
        email = f"rbac_test_{role}_{timestamp}@example.com"
        response = make_request('POST', 'admin/users', {
            'name': f'RBAC Test {role.title()}',
            'email': email,
            'password': 'password123',
            'role': role
        }, admin_session)
        
        if response and response.status_code == 200:
            user_data = response.json().get('user')
            test_users.append({'role': role, 'email': email, 'data': user_data})
            print(f"✅ Created {role} user: {email}")
        else:
            print(f"❌ Failed to create {role} user")
            return
    
    # Test RBAC isolation
    for user in test_users:
        print(f"\n--- Testing {user['role']} access ---")
        
        # Login as test user
        user_session = requests.Session()
        user_login = make_request('POST', 'auth/login', {
            'email': user['email'],
            'password': 'password123'
        }, user_session)
        
        if not user_login or user_login.status_code != 200:
            print(f"❌ {user['role']} login failed")
            continue
        
        print(f"✅ {user['role']} login successful")
        
        # Test forbidden endpoints based on role
        forbidden_tests = {
            'student': [
                ('GET', 'admin/users', 'admin endpoint'),
                ('GET', 'manager/courses', 'manager endpoint'),
                ('GET', 'teacher/courses', 'teacher endpoint')
            ],
            'manager': [
                ('GET', 'admin/users', 'admin endpoint'),
                ('GET', 'teacher/courses', 'teacher endpoint')
            ],
            'teacher': [
                ('GET', 'admin/users', 'admin endpoint'),
                ('GET', 'manager/courses', 'manager endpoint')
            ]
        }
        
        for method, endpoint, description in forbidden_tests.get(user['role'], []):
            response = make_request(method, endpoint, session=user_session)
            
            if response is None:
                print(f"❌ No response for {description}")
            elif response.status_code == 403:
                print(f"✅ Correctly forbidden from {description}")
            else:
                print(f"❌ Expected 403 for {description}, got {response.status_code}")

if __name__ == "__main__":
    test_rbac()