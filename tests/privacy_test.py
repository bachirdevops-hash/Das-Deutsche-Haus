#!/usr/bin/env python3
"""
Additional test to verify student privacy for grade notes
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "https://telc-academy.preview.emergentagent.com/api"
SUPER_ADMIN_EMAIL = "bachir.devops@gmail.com"
SUPER_ADMIN_PASSWORD = "@26042026Admin"

class TestSession:
    def __init__(self):
        self.session = requests.Session()
        self.current_user = None
        
    def login(self, email, password):
        """Login and store session cookie"""
        response = self.session.post(f"{BASE_URL}/auth/login", 
                                   json={"email": email, "password": password})
        if response.status_code == 200:
            self.current_user = {"email": email}
            print(f"✅ Logged in as {email}")
            return True
        else:
            print(f"❌ Login failed for {email}: {response.text}")
            return False
    
    def logout(self):
        """Logout and clear session"""
        self.session.post(f"{BASE_URL}/auth/logout")
        self.current_user = None
        print("✅ Logged out")

def test_student_grade_privacy():
    """Test that students cannot see private notes in their grades"""
    print("\n=== TESTING STUDENT GRADE PRIVACY ===")
    
    admin_session = TestSession()
    student_session = TestSession()
    
    try:
        # Login as admin
        if not admin_session.login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD):
            return False
        
        # Create a test student
        timestamp = int(time.time())
        student_email = f"teststudent{timestamp}@example.com"
        student_password = "TestPassword123"
        
        student_data = {
            "name": "Test Student Privacy",
            "email": student_email,
            "password": student_password,
            "role": "student"
        }
        
        create_response = admin_session.session.post(f"{BASE_URL}/admin/users", json=student_data)
        if create_response.status_code != 200:
            print(f"❌ Failed to create test student: {create_response.status_code}")
            return False
        
        student_user = create_response.json()['user']
        student_id = student_user['id']
        print(f"✅ Created test student: {student_email}")
        
        # Get a course to register the student
        courses_response = admin_session.session.get(f"{BASE_URL}/teacher/courses")
        courses = courses_response.json().get('courses', [])
        if not courses:
            print("❌ No courses found")
            return False
        
        course_id = courses[0]['id']
        
        # Register student in course (simulate registration)
        registration_data = {
            "id": f"reg-{timestamp}",
            "userId": student_id,
            "courseId": course_id,
            "level": courses[0]['level'],
            "status": "active",
            "createdAt": datetime.now().isoformat(),
            "price_usd": courses[0].get('price_usd', 100)
        }
        
        # Insert registration directly (simulating student registration)
        # We'll use the admin to create a grade instead
        
        # Create a grade with private note for this student
        grade_data = {
            "studentId": student_id,
            "grade": "B+",
            "comment": "Good progress on grammar exercises",
            "note": "PRIVATE NOTE: Student struggles with article usage, needs extra practice"
        }
        
        grade_response = admin_session.session.post(f"{BASE_URL}/teacher/courses/{course_id}/grades", json=grade_data)
        if grade_response.status_code != 200:
            print(f"❌ Failed to create grade: {grade_response.status_code}")
            return False
        
        print("✅ Created grade with private note")
        
        # Verify admin can see the private note
        admin_grades_response = admin_session.session.get(f"{BASE_URL}/teacher/courses/{course_id}/grades")
        if admin_grades_response.status_code == 200:
            admin_grades = admin_grades_response.json().get('grades', [])
            admin_grade = next((g for g in admin_grades if g['studentId'] == student_id), None)
            if admin_grade and 'note' in admin_grade:
                print(f"✅ Admin can see private note: '{admin_grade['note']}'")
            else:
                print("❌ Admin cannot see private note")
                return False
        
        # Now login as the student
        admin_session.logout()
        
        if not student_session.login(student_email, student_password):
            print("❌ Could not login as student")
            return False
        
        # Try to access student course overview
        overview_response = student_session.session.get(f"{BASE_URL}/student/courses/{course_id}/overview")
        
        if overview_response.status_code == 403:
            print("✅ Student correctly denied access (not enrolled in course)")
            # This is expected since we didn't actually register the student
            # Let's manually register the student first
            
            # Logout student and login as admin to register student
            student_session.logout()
            if not admin_session.login(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD):
                return False
            
            # Register student in course
            reg_data = {"courseId": course_id}
            # We need to login as student to register
            admin_session.logout()
            if not student_session.login(student_email, student_password):
                return False
            
            reg_response = student_session.session.post(f"{BASE_URL}/course-registrations", json=reg_data)
            if reg_response.status_code != 200:
                print(f"❌ Failed to register student: {reg_response.status_code}")
                return False
            
            print("✅ Student registered in course")
            
            # Now try overview again
            overview_response = student_session.session.get(f"{BASE_URL}/student/courses/{course_id}/overview")
        
        if overview_response.status_code != 200:
            print(f"❌ Student overview failed: {overview_response.status_code} - {overview_response.text}")
            return False
        
        overview_data = overview_response.json()
        student_grades = overview_data.get('grades', [])
        
        if not student_grades:
            print("❌ No grades found in student overview")
            return False
        
        # Check if any grade has a 'note' field
        for grade in student_grades:
            if 'note' in grade:
                print(f"❌ PRIVACY VIOLATION: Student can see private note: '{grade['note']}'")
                return False
            
            if 'comment' not in grade:
                print("❌ Student cannot see public comment")
                return False
        
        print("✅ PRIVACY VERIFIED: Student cannot see private notes but can see public comments")
        print(f"   Student sees {len(student_grades)} grades with comments but no private notes")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with exception: {e}")
        return False
    finally:
        admin_session.logout()
        student_session.logout()

if __name__ == "__main__":
    success = test_student_grade_privacy()
    if success:
        print("\n🎉 STUDENT PRIVACY TEST PASSED!")
    else:
        print("\n❌ STUDENT PRIVACY TEST FAILED!")
    exit(0 if success else 1)