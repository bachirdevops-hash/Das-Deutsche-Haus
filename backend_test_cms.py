#!/usr/bin/env python3
"""
Site Content CMS Backend Testing Script
Tests NEW Site Content CMS endpoints + smoke tests for existing endpoints
"""

import requests
import json
import time
from typing import Dict, List, Optional

BASE_URL = "https://telc-academy.preview.emergentagent.com"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

# Test results tracking
test_results = {
    "A_public_content": [],
    "B_public_lists": [],
    "C_admin_auth": [],
    "D_admin_content_patch": [],
    "E_admin_crud": [],
    "F_activity_log": [],
    "G_smoke_tests": []
}

def log_test(section: str, test_name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} - {test_name}"
    if details:
        result += f": {details}"
    test_results[section].append(result)
    print(result)

def login_super_admin() -> Optional[str]:
    """Login as super admin and return cookie"""
    try:
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": SUPER_ADMIN_EMAIL, "password": SUPER_ADMIN_PASSWORD},
            timeout=20
        )
        if response.status_code == 200:
            cookie = response.cookies.get("ddh_token")
            print(f"✅ Super admin login successful, cookie: {cookie[:20]}...")
            return cookie
        else:
            print(f"❌ Super admin login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"❌ Super admin login error: {e}")
        return None

def signup_temp_student() -> Optional[tuple]:
    """Create temporary student account, returns (email, password, cookie)"""
    try:
        email = f"test_student_{int(time.time())}@test.com"
        password = "TestPass123!"
        response = requests.post(
            f"{BASE_URL}/api/auth/signup",
            json={
                "name": "Test Student",
                "email": email,
                "phone": "+963999999999",
                "password": password
            },
            timeout=20
        )
        if response.status_code == 200:
            cookie = response.cookies.get("ddh_token")
            print(f"✅ Temp student created: {email}")
            return (email, password, cookie)
        else:
            print(f"❌ Temp student signup failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Temp student signup error: {e}")
        return None

def cleanup_temp_student(email: str, admin_cookie: str):
    """Delete temporary student account"""
    try:
        # Get user ID first
        response = requests.get(
            f"{BASE_URL}/api/admin/users",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            users = response.json().get("users", [])
            user = next((u for u in users if u.get("email") == email), None)
            if user:
                user_id = user.get("id")
                delete_response = requests.delete(
                    f"{BASE_URL}/api/admin/users/{user_id}",
                    cookies={"ddh_token": admin_cookie},
                    timeout=20
                )
                if delete_response.status_code == 200:
                    print(f"✅ Cleaned up temp student: {email}")
                else:
                    print(f"⚠️ Failed to delete temp student: {delete_response.status_code}")
    except Exception as e:
        print(f"⚠️ Cleanup error: {e}")

# ===== SECTION A: Public Content Sections =====
def test_public_content_sections():
    """Test A: Public content endpoints"""
    print("\n" + "="*60)
    print("SECTION A: PUBLIC CONTENT SECTIONS")
    print("="*60)
    
    # A1: GET /api/content - all 7 keys present
    try:
        response = requests.get(f"{BASE_URL}/api/content", timeout=20)
        if response.status_code == 200:
            data = response.json()
            content = data.get("content", {})
            expected_keys = ["home_stats", "home_why", "home_testimonials", "home_cta", 
                           "about_hero", "about_mission", "visa_page"]
            all_present = all(key in content for key in expected_keys)
            log_test("A_public_content", "GET /api/content returns all 7 keys", 
                    all_present, f"Found keys: {list(content.keys())}")
        else:
            log_test("A_public_content", "GET /api/content returns all 7 keys", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content returns all 7 keys", False, str(e))
    
    # A2: GET /api/content/home_stats - has items array
    try:
        response = requests.get(f"{BASE_URL}/api/content/home_stats", timeout=20)
        if response.status_code == 200:
            data = response.json()
            items = data.get("data", {}).get("items", [])
            has_items = len(items) >= 1
            log_test("A_public_content", "GET /api/content/home_stats has items", 
                    has_items, f"Found {len(items)} items")
        else:
            log_test("A_public_content", "GET /api/content/home_stats has items", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content/home_stats has items", False, str(e))
    
    # A3: GET /api/content/home_why - has Arabic title
    try:
        response = requests.get(f"{BASE_URL}/api/content/home_why", timeout=20)
        if response.status_code == 200:
            data = response.json()
            title = data.get("data", {}).get("title", "")
            has_arabic = len(title) > 0 and any('\u0600' <= c <= '\u06FF' for c in title)
            log_test("A_public_content", "GET /api/content/home_why has Arabic title", 
                    has_arabic, f"Title: {title[:50]}")
        else:
            log_test("A_public_content", "GET /api/content/home_why has Arabic title", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content/home_why has Arabic title", False, str(e))
    
    # A4: GET /api/content/home_cta - has button1/button2/button3
    try:
        response = requests.get(f"{BASE_URL}/api/content/home_cta", timeout=20)
        if response.status_code == 200:
            data = response.json().get("data", {})
            has_buttons = all(key in data for key in ["button1", "button2", "button3"])
            log_test("A_public_content", "GET /api/content/home_cta has 3 buttons", 
                    has_buttons, f"Keys: {list(data.keys())}")
        else:
            log_test("A_public_content", "GET /api/content/home_cta has 3 buttons", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content/home_cta has 3 buttons", False, str(e))
    
    # A5: GET /api/content/about_mission - has story/mission/vision fields
    try:
        response = requests.get(f"{BASE_URL}/api/content/about_mission", timeout=20)
        if response.status_code == 200:
            data = response.json().get("data", {})
            required_fields = ["story", "mission", "vision", "storyTitle", "missionTitle", "visionTitle"]
            has_fields = all(key in data for key in required_fields)
            log_test("A_public_content", "GET /api/content/about_mission has required fields", 
                    has_fields, f"Keys: {list(data.keys())}")
        else:
            log_test("A_public_content", "GET /api/content/about_mission has required fields", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content/about_mission has required fields", False, str(e))
    
    # A6: GET /api/content/visa_page - has hero/cards/faq/booking titles
    try:
        response = requests.get(f"{BASE_URL}/api/content/visa_page", timeout=20)
        if response.status_code == 200:
            data = response.json().get("data", {})
            required_fields = ["heroTitle", "cardsTitle", "faqTitle", "bookingTitle"]
            has_fields = all(key in data for key in required_fields)
            log_test("A_public_content", "GET /api/content/visa_page has required fields", 
                    has_fields, f"Keys: {list(data.keys())}")
        else:
            log_test("A_public_content", "GET /api/content/visa_page has required fields", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content/visa_page has required fields", False, str(e))
    
    # A7: GET /api/content/nonexistent_key - returns 400
    try:
        response = requests.get(f"{BASE_URL}/api/content/nonexistent_key", timeout=20)
        is_400 = response.status_code == 400
        has_error = "error" in response.json()
        log_test("A_public_content", "GET /api/content/nonexistent_key returns 400", 
                is_400 and has_error, f"Status: {response.status_code}, Response: {response.json()}")
    except Exception as e:
        log_test("A_public_content", "GET /api/content/nonexistent_key returns 400", False, str(e))

# ===== SECTION B: Public List Resources =====
def test_public_list_resources():
    """Test B: Public list resources"""
    print("\n" + "="*60)
    print("SECTION B: PUBLIC LIST RESOURCES")
    print("="*60)
    
    resources = ["team-members", "partnerships", "visa-types-list", "visa-faqs", "consultation-types"]
    
    for resource in resources:
        # B1: GET returns items array
        try:
            response = requests.get(f"{BASE_URL}/api/{resource}", timeout=20)
            if response.status_code == 200:
                data = response.json()
                items = data.get("items", [])
                has_items = isinstance(items, list)
                log_test("B_public_lists", f"GET /api/{resource} returns items array", 
                        has_items, f"Found {len(items)} items")
                
                # B2: Items sorted by order ASC
                if len(items) > 1:
                    orders = [item.get("order", 999) for item in items]
                    is_sorted = all(orders[i] <= orders[i+1] for i in range(len(orders)-1))
                    log_test("B_public_lists", f"GET /api/{resource} items sorted by order", 
                            is_sorted, f"Orders: {orders[:5]}")
                
                # B3: Only published items (published !== false)
                unpublished = [item for item in items if item.get("published") == False]
                only_published = len(unpublished) == 0
                log_test("B_public_lists", f"GET /api/{resource} only published items", 
                        only_published, f"Unpublished count: {len(unpublished)}")
            else:
                log_test("B_public_lists", f"GET /api/{resource} returns items array", 
                        False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("B_public_lists", f"GET /api/{resource} returns items array", False, str(e))

# ===== SECTION C: Admin Auth Gating =====
def test_admin_auth_gating(admin_cookie: str):
    """Test C: Admin authentication and authorization"""
    print("\n" + "="*60)
    print("SECTION C: ADMIN AUTH GATING")
    print("="*60)
    
    # C1: Without cookie -> 401
    try:
        response = requests.get(f"{BASE_URL}/api/admin/content/home_stats", timeout=20)
        is_401 = response.status_code == 401
        log_test("C_admin_auth", "GET /api/admin/content/home_stats without cookie returns 401", 
                is_401, f"Status: {response.status_code}")
    except Exception as e:
        log_test("C_admin_auth", "GET /api/admin/content/home_stats without cookie returns 401", False, str(e))
    
    # C2: With student cookie -> 403
    student_info = signup_temp_student()
    if student_info:
        email, password, student_cookie = student_info
        try:
            response = requests.get(
                f"{BASE_URL}/api/admin/content/home_stats",
                cookies={"ddh_token": student_cookie},
                timeout=20
            )
            is_403 = response.status_code == 403
            log_test("C_admin_auth", "GET /api/admin/content/home_stats with student cookie returns 403", 
                    is_403, f"Status: {response.status_code}")
        except Exception as e:
            log_test("C_admin_auth", "GET /api/admin/content/home_stats with student cookie returns 403", False, str(e))
        
        # Cleanup temp student
        cleanup_temp_student(email, admin_cookie)
    else:
        log_test("C_admin_auth", "GET /api/admin/content/home_stats with student cookie returns 403", 
                False, "Failed to create temp student")
    
    # C3: With super_admin cookie -> 200
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/content/home_stats",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        is_200 = response.status_code == 200
        log_test("C_admin_auth", "GET /api/admin/content/home_stats with super_admin returns 200", 
                is_200, f"Status: {response.status_code}")
    except Exception as e:
        log_test("C_admin_auth", "GET /api/admin/content/home_stats with super_admin returns 200", False, str(e))
    
    # C4: Same for team-members
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/team-members",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        is_200 = response.status_code == 200
        log_test("C_admin_auth", "GET /api/admin/team-members with super_admin returns 200", 
                is_200, f"Status: {response.status_code}")
    except Exception as e:
        log_test("C_admin_auth", "GET /api/admin/team-members with super_admin returns 200", False, str(e))

# ===== SECTION D: Admin Content PATCH =====
def test_admin_content_patch(admin_cookie: str):
    """Test D: Admin content section PATCH"""
    print("\n" + "="*60)
    print("SECTION D: ADMIN CONTENT PATCH")
    print("="*60)
    
    # D1: Get current home_stats
    original_data = None
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/content/home_stats",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            original_data = response.json().get("data", {})
            log_test("D_admin_content_patch", "GET current home_stats data", 
                    True, f"Captured {len(original_data.get('items', []))} items")
        else:
            log_test("D_admin_content_patch", "GET current home_stats data", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("D_admin_content_patch", "GET current home_stats data", False, str(e))
    
    # D2: PATCH with test data
    test_data = {
        "data": {
            "items": [{
                "id": "test-1",
                "value": "999+",
                "label": "TEST_LABEL_REGRESSION",
                "icon": "Star",
                "color": "#000000",
                "order": 1
            }]
        }
    }
    try:
        response = requests.patch(
            f"{BASE_URL}/api/admin/content/home_stats",
            json=test_data,
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            result = response.json()
            has_items = "items" in result.get("data", {})
            log_test("D_admin_content_patch", "PATCH /api/admin/content/home_stats returns 200", 
                    has_items, f"Response: {result}")
        else:
            log_test("D_admin_content_patch", "PATCH /api/admin/content/home_stats returns 200", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("D_admin_content_patch", "PATCH /api/admin/content/home_stats returns 200", False, str(e))
    
    # D3: Verify public endpoint reflects change
    try:
        time.sleep(0.5)  # Brief delay for consistency
        response = requests.get(f"{BASE_URL}/api/content/home_stats", timeout=20)
        if response.status_code == 200:
            data = response.json().get("data", {})
            items = data.get("items", [])
            has_test_label = any("TEST_LABEL_REGRESSION" in item.get("label", "") for item in items)
            log_test("D_admin_content_patch", "Public GET reflects TEST_LABEL_REGRESSION", 
                    has_test_label, f"Found test label: {has_test_label}")
        else:
            log_test("D_admin_content_patch", "Public GET reflects TEST_LABEL_REGRESSION", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("D_admin_content_patch", "Public GET reflects TEST_LABEL_REGRESSION", False, str(e))
    
    # D4: Restore original data
    if original_data:
        try:
            response = requests.patch(
                f"{BASE_URL}/api/admin/content/home_stats",
                json={"data": original_data},
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            if response.status_code == 200:
                log_test("D_admin_content_patch", "Restore original home_stats data", 
                        True, "Original data restored")
            else:
                log_test("D_admin_content_patch", "Restore original home_stats data", 
                        False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("D_admin_content_patch", "Restore original home_stats data", False, str(e))

# ===== SECTION E: Admin CRUD on List Resources =====
def test_admin_crud_resources(admin_cookie: str):
    """Test E: Admin CRUD on each list resource"""
    print("\n" + "="*60)
    print("SECTION E: ADMIN CRUD ON LIST RESOURCES")
    print("="*60)
    
    test_configs = {
        "team-members": {
            "name": "TEST_REGRESSION_member",
            "role": "Test Role",
            "bio": "Test bio for regression testing",
            "order": 999
        },
        "partnerships": {
            "name": "TEST_REGRESSION_partner",
            "order": 999
        },
        "visa-types-list": {
            "title": "TEST_REGRESSION_visa",
            "description": "Test visa type",
            "emoji": "🧪",
            "order": 999
        },
        "visa-faqs": {
            "question": "TEST_REGRESSION_q?",
            "answer": "Test answer",
            "order": 999
        },
        "consultation-types": {
            "name": "TEST_REGRESSION_ct",
            "description": "Test consultation",
            "durationMinutes": 15,
            "price": 0,
            "order": 999
        }
    }
    
    for resource, payload in test_configs.items():
        created_id = None
        
        # E1: POST create new item
        try:
            response = requests.post(
                f"{BASE_URL}/api/admin/{resource}",
                json=payload,
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            if response.status_code == 200:
                item = response.json().get("item", {})
                created_id = item.get("id")
                has_id = created_id is not None
                log_test("E_admin_crud", f"POST /api/admin/{resource} creates item", 
                        has_id, f"Created ID: {created_id}")
            else:
                log_test("E_admin_crud", f"POST /api/admin/{resource} creates item", 
                        False, f"Status: {response.status_code}")
                continue
        except Exception as e:
            log_test("E_admin_crud", f"POST /api/admin/{resource} creates item", False, str(e))
            continue
        
        # E2: GET single item
        try:
            response = requests.get(
                f"{BASE_URL}/api/admin/{resource}/{created_id}",
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            is_200 = response.status_code == 200
            log_test("E_admin_crud", f"GET /api/admin/{resource}/{created_id} returns item", 
                    is_200, f"Status: {response.status_code}")
        except Exception as e:
            log_test("E_admin_crud", f"GET /api/admin/{resource}/{created_id} returns item", False, str(e))
        
        # E3: PATCH update item
        update_payload = {}
        if "name" in payload:
            update_payload["name"] = payload["name"] + "_UPDATED"
        elif "title" in payload:
            update_payload["title"] = payload["title"] + "_UPDATED"
        elif "question" in payload:
            update_payload["question"] = payload["question"] + "_UPDATED"
        
        try:
            response = requests.patch(
                f"{BASE_URL}/api/admin/{resource}/{created_id}",
                json=update_payload,
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            if response.status_code == 200:
                item = response.json().get("item", {})
                updated = any("_UPDATED" in str(v) for v in item.values())
                log_test("E_admin_crud", f"PATCH /api/admin/{resource}/{created_id} updates item", 
                        updated, f"Updated: {updated}")
            else:
                log_test("E_admin_crud", f"PATCH /api/admin/{resource}/{created_id} updates item", 
                        False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("E_admin_crud", f"PATCH /api/admin/{resource}/{created_id} updates item", False, str(e))
        
        # E4: Verify visible in public GET
        try:
            response = requests.get(f"{BASE_URL}/api/{resource}", timeout=20)
            if response.status_code == 200:
                items = response.json().get("items", [])
                found = any(item.get("id") == created_id for item in items)
                log_test("E_admin_crud", f"Public GET /api/{resource} shows test item", 
                        found, f"Found: {found}")
            else:
                log_test("E_admin_crud", f"Public GET /api/{resource} shows test item", 
                        False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("E_admin_crud", f"Public GET /api/{resource} shows test item", False, str(e))
        
        # E5: PATCH with published=false
        try:
            response = requests.patch(
                f"{BASE_URL}/api/admin/{resource}/{created_id}",
                json={"published": False},
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            is_200 = response.status_code == 200
            log_test("E_admin_crud", f"PATCH /api/admin/{resource}/{created_id} set published=false", 
                    is_200, f"Status: {response.status_code}")
        except Exception as e:
            log_test("E_admin_crud", f"PATCH /api/admin/{resource}/{created_id} set published=false", False, str(e))
        
        # E6: Verify NOT in public GET but in admin GET
        try:
            public_response = requests.get(f"{BASE_URL}/api/{resource}", timeout=20)
            admin_response = requests.get(
                f"{BASE_URL}/api/admin/{resource}",
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            
            if public_response.status_code == 200 and admin_response.status_code == 200:
                public_items = public_response.json().get("items", [])
                admin_items = admin_response.json().get("items", [])
                
                not_in_public = not any(item.get("id") == created_id for item in public_items)
                in_admin = any(item.get("id") == created_id for item in admin_items)
                
                log_test("E_admin_crud", f"Unpublished item hidden from public but visible to admin", 
                        not_in_public and in_admin, 
                        f"Not in public: {not_in_public}, In admin: {in_admin}")
            else:
                log_test("E_admin_crud", f"Unpublished item hidden from public but visible to admin", 
                        False, "Failed to fetch lists")
        except Exception as e:
            log_test("E_admin_crud", f"Unpublished item hidden from public but visible to admin", False, str(e))
        
        # E7: DELETE item
        try:
            response = requests.delete(
                f"{BASE_URL}/api/admin/{resource}/{created_id}",
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            if response.status_code == 200:
                result = response.json()
                is_ok = result.get("ok") == True
                log_test("E_admin_crud", f"DELETE /api/admin/{resource}/{created_id} returns ok:true", 
                        is_ok, f"Response: {result}")
            else:
                log_test("E_admin_crud", f"DELETE /api/admin/{resource}/{created_id} returns ok:true", 
                        False, f"Status: {response.status_code}")
        except Exception as e:
            log_test("E_admin_crud", f"DELETE /api/admin/{resource}/{created_id} returns ok:true", False, str(e))
        
        # E8: Verify 404 after delete
        try:
            response = requests.get(
                f"{BASE_URL}/api/admin/{resource}/{created_id}",
                cookies={"ddh_token": admin_cookie},
                timeout=20
            )
            is_404 = response.status_code == 404
            log_test("E_admin_crud", f"GET /api/admin/{resource}/{created_id} returns 404 after delete", 
                    is_404, f"Status: {response.status_code}")
        except Exception as e:
            log_test("E_admin_crud", f"GET /api/admin/{resource}/{created_id} returns 404 after delete", False, str(e))

# ===== SECTION F: Activity Log =====
def test_activity_log(admin_cookie: str):
    """Test F: Activity log verification"""
    print("\n" + "="*60)
    print("SECTION F: ACTIVITY LOG")
    print("="*60)
    
    try:
        response = requests.get(
            f"{BASE_URL}/api/admin/activity-logs?limit=20",
            cookies={"ddh_token": admin_cookie},
            timeout=20
        )
        if response.status_code == 200:
            logs = response.json().get("logs", [])
            
            # Look for content/resource actions
            cms_actions = [
                "content.update",
                "team-members.create", "team-members.update", "team-members.delete",
                "partnerships.create", "partnerships.update", "partnerships.delete",
                "visa-types-list.create", "visa-types-list.update", "visa-types-list.delete",
                "visa-faqs.create", "visa-faqs.update", "visa-faqs.delete",
                "consultation-types.create", "consultation-types.update", "consultation-types.delete"
            ]
            
            found_actions = [log.get("action") for log in logs if log.get("action") in cms_actions]
            has_cms_logs = len(found_actions) > 0
            
            log_test("F_activity_log", "Activity logs contain CMS actions", 
                    has_cms_logs, f"Found actions: {found_actions[:10]}")
        else:
            log_test("F_activity_log", "Activity logs contain CMS actions", 
                    False, f"Status: {response.status_code}")
    except Exception as e:
        log_test("F_activity_log", "Activity logs contain CMS actions", False, str(e))

# ===== SECTION G: Smoke Tests =====
def test_smoke_existing_endpoints():
    """Test G: Smoke test existing endpoints"""
    print("\n" + "="*60)
    print("SECTION G: SMOKE TESTS - EXISTING ENDPOINTS")
    print("="*60)
    
    smoke_tests = [
        ("GET /api/health", f"{BASE_URL}/api/health"),
        ("GET /api/courses", f"{BASE_URL}/api/courses"),
        ("GET /api/blog?lang=ar&limit=3", f"{BASE_URL}/api/blog?lang=ar&limit=3"),
        ("GET /api/activities", f"{BASE_URL}/api/activities"),
        ("GET /api/german/page-data", f"{BASE_URL}/api/german/page-data"),
        ("GET /api/legal/privacy", f"{BASE_URL}/api/legal/privacy"),
    ]
    
    for test_name, url in smoke_tests:
        try:
            response = requests.get(url, timeout=20)
            # Accept 200 or 404 for legal/privacy (may not be published)
            is_ok = response.status_code == 200 or (response.status_code == 404 and "legal" in url)
            log_test("G_smoke_tests", test_name, 
                    is_ok, f"Status: {response.status_code}")
        except Exception as e:
            log_test("G_smoke_tests", test_name, False, str(e))

# ===== MAIN TEST RUNNER =====
def main():
    print("\n" + "="*80)
    print("SITE CONTENT CMS BACKEND TESTING")
    print("Testing NEW Site Content CMS endpoints + smoke tests")
    print("="*80)
    
    # Login as super admin
    admin_cookie = login_super_admin()
    if not admin_cookie:
        print("\n❌ CRITICAL: Failed to login as super admin. Cannot proceed with tests.")
        return
    
    # Run all test sections
    test_public_content_sections()
    test_public_list_resources()
    test_admin_auth_gating(admin_cookie)
    test_admin_content_patch(admin_cookie)
    test_admin_crud_resources(admin_cookie)
    test_activity_log(admin_cookie)
    test_smoke_existing_endpoints()
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    total_tests = 0
    passed_tests = 0
    
    for section, results in test_results.items():
        section_passed = sum(1 for r in results if "✅ PASS" in r)
        section_total = len(results)
        total_tests += section_total
        passed_tests += section_passed
        
        print(f"\n{section.upper().replace('_', ' ')}:")
        print(f"  {section_passed}/{section_total} tests passed")
        for result in results:
            if "❌ FAIL" in result:
                print(f"  {result}")
    
    print("\n" + "="*80)
    print(f"OVERALL: {passed_tests}/{total_tests} tests passed ({passed_tests*100//total_tests if total_tests > 0 else 0}%)")
    print("="*80)
    
    if passed_tests == total_tests:
        print("\n✅ ALL TESTS PASSED - Site Content CMS is production-ready!")
    else:
        print(f"\n⚠️ {total_tests - passed_tests} test(s) failed - Review failures above")

if __name__ == "__main__":
    main()
