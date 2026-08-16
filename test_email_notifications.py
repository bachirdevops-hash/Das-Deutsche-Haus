#!/usr/bin/env python3
"""
Email Notifications Test — LOCALHOST ONLY
Tests admin email notifications via Resend for travel consultations and contact form.
"""
import requests
import json
import sys
from datetime import datetime
from pymongo import MongoClient
import os

# CRITICAL: Test ONLY on localhost
BASE_URL = "http://localhost:3000/api"

# MongoDB connection from .env
MONGO_URL = "mongodb+srv://bachirdevops_db_user:9bsusW3oxyzqJ5OO@cluster0.3mqafra.mongodb.net/das_deutsche_haus?appName=Cluster0"
DB_NAME = "das_deutsche_haus"

# Test data
TEST_LEAD_EMAIL = "test.lead@example.com"
TEST_LEAD_NAME = "Test Lead"
TEST_CONTACT_EMAIL = "test.contact@example.com"
TEST_CONTACT_NAME = "Test Contact"

# Global session
session = requests.Session()
session.headers.update({"Content-Type": "application/json"})

# MongoDB client
mongo_client = None
db = None

def log(msg, status="INFO"):
    """Log test messages"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] [{status}] {msg}")

def connect_mongodb():
    """Connect to MongoDB"""
    global mongo_client, db
    try:
        log("Connecting to MongoDB...", "INFO")
        mongo_client = MongoClient(MONGO_URL)
        db = mongo_client[DB_NAME]
        # Test connection
        db.command('ping')
        log("✅ MongoDB connected successfully", "PASS")
        return True
    except Exception as e:
        log(f"❌ MongoDB connection failed: {str(e)}", "FAIL")
        return False

def get_consultation_types():
    """Get consultation types to find required fields"""
    try:
        log("TEST 0: Getting consultation types to understand required fields", "TEST")
        response = session.get(f"{BASE_URL}/travel/consultation-types")
        
        if response.status_code == 404:
            log("⚠️  /travel/consultation-types endpoint not found, will use basic fields", "WARN")
            return None
        
        if response.status_code != 200:
            log(f"⚠️  /travel/consultation-types returned {response.status_code}, will use basic fields", "WARN")
            return None
        
        data = response.json()
        log(f"✅ Got consultation types: {json.dumps(data, indent=2)}", "PASS")
        return data
    except Exception as e:
        log(f"⚠️  Exception getting consultation types: {str(e)}, will use basic fields", "WARN")
        return None

def test_travel_consultation_submission():
    """Test 1: POST /api/travel/consultations creates lead and sends emails"""
    try:
        log("TEST 1: Travel consultation submission", "TEST")
        
        # Prepare payload based on route.js line 463-481
        payload = {
            "name": TEST_LEAD_NAME,
            "email": TEST_LEAD_EMAIL,
            "phone": "+963999123456",
            "visaType": "Student Visa",
            "preferredDate": "2026-08-15",
            "notes": "Test consultation request for email notification testing"
        }
        
        log(f"Submitting travel consultation: {json.dumps(payload, indent=2)}", "INFO")
        response = session.post(f"{BASE_URL}/travel/consultations", json=payload)
        
        if response.status_code != 200:
            log(f"❌ Travel consultation submission failed with status {response.status_code}: {response.text}", "FAIL")
            return False, None
        
        data = response.json()
        log(f"✅ Travel consultation submitted successfully", "PASS")
        log(f"   Response: {json.dumps(data, indent=2)}", "INFO")
        
        consultation_id = data.get("consultation", {}).get("id")
        if not consultation_id:
            log(f"❌ No consultation ID in response", "FAIL")
            return False, None
        
        log(f"   Consultation ID: {consultation_id}", "INFO")
        return True, consultation_id
    except Exception as e:
        log(f"❌ Exception during travel consultation submission: {str(e)}", "FAIL")
        return False, None

def test_contact_form_submission():
    """Test 2: POST /api/contact creates message and sends emails"""
    try:
        log("TEST 2: Contact form submission", "TEST")
        
        # Prepare payload based on route.js line 483-490
        payload = {
            "name": TEST_CONTACT_NAME,
            "email": TEST_CONTACT_EMAIL,
            "message": "Test contact message for email notification testing"
        }
        
        log(f"Submitting contact form: {json.dumps(payload, indent=2)}", "INFO")
        response = session.post(f"{BASE_URL}/contact", json=payload)
        
        if response.status_code != 200:
            log(f"❌ Contact form submission failed with status {response.status_code}: {response.text}", "FAIL")
            return False, None
        
        data = response.json()
        log(f"✅ Contact form submitted successfully", "PASS")
        log(f"   Response: {json.dumps(data, indent=2)}", "INFO")
        
        message_id = data.get("message", {}).get("id")
        if not message_id:
            log(f"❌ No message ID in response", "FAIL")
            return False, None
        
        log(f"   Message ID: {message_id}", "INFO")
        return True, message_id
    except Exception as e:
        log(f"❌ Exception during contact form submission: {str(e)}", "FAIL")
        return False, None

def verify_email_logs(consultation_id, message_id):
    """Test 3: Verify email_logs collection has correct entries"""
    try:
        log("TEST 3: Verifying email_logs in MongoDB", "TEST")
        
        if db is None:
            log("❌ MongoDB not connected", "FAIL")
            return False
        
        # Get latest email logs sorted by createdAt desc
        email_logs = list(db.email_logs.find({}).sort("createdAt", -1).limit(10))
        
        log(f"Found {len(email_logs)} recent email logs", "INFO")
        
        # Look for admin_travel_consultation email
        admin_travel_log = None
        confirm_travel_log = None
        admin_contact_log = None
        confirm_contact_log = None
        
        for log_entry in email_logs:
            log_type = log_entry.get("type")
            log_to = log_entry.get("to")
            log_status = log_entry.get("status")
            
            if log_type == "admin_travel_consultation" and log_to == "info@das-deutsche-haus.com":
                admin_travel_log = log_entry
            elif log_type == "confirm_travel_consultation" and log_to == TEST_LEAD_EMAIL:
                confirm_travel_log = log_entry
            elif log_type == "admin_contact_message" and log_to == "info@das-deutsche-haus.com":
                admin_contact_log = log_entry
            elif log_type == "confirm_contact_message" and log_to == TEST_CONTACT_EMAIL:
                confirm_contact_log = log_entry
        
        # Verify admin_travel_consultation log
        if not admin_travel_log:
            log(f"❌ No admin_travel_consultation email log found for info@das-deutsche-haus.com", "FAIL")
            log(f"   Available log types: {[l.get('type') for l in email_logs]}", "INFO")
            return False
        else:
            log(f"✅ Found admin_travel_consultation email log", "PASS")
            log(f"   To: {admin_travel_log.get('to')}", "INFO")
            log(f"   Status: {admin_travel_log.get('status')}", "INFO")
            log(f"   Subject: {admin_travel_log.get('subject', 'N/A')}", "INFO")
            if admin_travel_log.get("status") != "sent":
                log(f"⚠️  Admin travel email status is '{admin_travel_log.get('status')}' (expected 'sent')", "WARN")
        
        # Verify confirm_travel_consultation log
        if not confirm_travel_log:
            log(f"⚠️  No confirm_travel_consultation email log found for {TEST_LEAD_EMAIL}", "WARN")
        else:
            log(f"✅ Found confirm_travel_consultation email log", "PASS")
            log(f"   To: {confirm_travel_log.get('to')}", "INFO")
            log(f"   Status: {confirm_travel_log.get('status')}", "INFO")
            if confirm_travel_log.get("status") not in ["sent", "failed"]:
                log(f"⚠️  Confirmation travel email status is '{confirm_travel_log.get('status')}'", "WARN")
        
        # Verify admin_contact_message log
        if not admin_contact_log:
            log(f"❌ No admin_contact_message email log found for info@das-deutsche-haus.com", "FAIL")
            return False
        else:
            log(f"✅ Found admin_contact_message email log", "PASS")
            log(f"   To: {admin_contact_log.get('to')}", "INFO")
            log(f"   Status: {admin_contact_log.get('status')}", "INFO")
            log(f"   Subject: {admin_contact_log.get('subject', 'N/A')}", "INFO")
            if admin_contact_log.get("status") != "sent":
                log(f"⚠️  Admin contact email status is '{admin_contact_log.get('status')}' (expected 'sent')", "WARN")
        
        # Verify confirm_contact_message log
        if not confirm_contact_log:
            log(f"⚠️  No confirm_contact_message email log found for {TEST_CONTACT_EMAIL}", "WARN")
        else:
            log(f"✅ Found confirm_contact_message email log", "PASS")
            log(f"   To: {confirm_contact_log.get('to')}", "INFO")
            log(f"   Status: {confirm_contact_log.get('status')}", "INFO")
            if confirm_contact_log.get("status") not in ["sent", "failed"]:
                log(f"⚠️  Confirmation contact email status is '{confirm_contact_log.get('status')}'", "WARN")
        
        # Print all email logs for debugging
        log("All recent email logs:", "INFO")
        for i, log_entry in enumerate(email_logs, 1):
            log(f"  {i}. Type: {log_entry.get('type')}, To: {log_entry.get('to')}, Status: {log_entry.get('status')}", "INFO")
        
        return True
    except Exception as e:
        log(f"❌ Exception verifying email logs: {str(e)}", "FAIL")
        import traceback
        log(traceback.format_exc(), "ERROR")
        return False

def verify_data_stored(consultation_id, message_id):
    """Test 4: Verify data was stored in collections"""
    try:
        log("TEST 4: Verifying data stored in collections", "TEST")
        
        if db is None:
            log("❌ MongoDB not connected", "FAIL")
            return False
        
        # Verify travel_consultations collection
        consultation = db.travel_consultations.find_one({"id": consultation_id})
        if not consultation:
            log(f"❌ Travel consultation {consultation_id} not found in database", "FAIL")
            return False
        else:
            log(f"✅ Travel consultation found in database", "PASS")
            log(f"   Name: {consultation.get('name')}", "INFO")
            log(f"   Email: {consultation.get('email')}", "INFO")
            log(f"   Status: {consultation.get('status')}", "INFO")
        
        # Verify contact_messages collection
        message = db.contact_messages.find_one({"id": message_id})
        if not message:
            log(f"❌ Contact message {message_id} not found in database", "FAIL")
            return False
        else:
            log(f"✅ Contact message found in database", "PASS")
            log(f"   Name: {message.get('name')}", "INFO")
            log(f"   Email: {message.get('email')}", "INFO")
            log(f"   Message: {message.get('message', '')[:50]}...", "INFO")
        
        return True
    except Exception as e:
        log(f"❌ Exception verifying data storage: {str(e)}", "FAIL")
        return False

def cleanup_test_data(consultation_id, message_id):
    """Test 5: Cleanup test data"""
    try:
        log("TEST 5: Cleaning up test data", "TEST")
        
        if db is None:
            log("❌ MongoDB not connected", "FAIL")
            return False
        
        # Delete travel consultation
        result1 = db.travel_consultations.delete_one({"id": consultation_id})
        if result1.deleted_count == 1:
            log(f"✅ Deleted travel consultation {consultation_id}", "PASS")
        else:
            log(f"⚠️  Travel consultation {consultation_id} not deleted (may not exist)", "WARN")
        
        # Delete contact message
        result2 = db.contact_messages.delete_one({"id": message_id})
        if result2.deleted_count == 1:
            log(f"✅ Deleted contact message {message_id}", "PASS")
        else:
            log(f"⚠️  Contact message {message_id} not deleted (may not exist)", "WARN")
        
        # Note: We leave email_logs as-is per instructions
        log("✅ Test data cleanup complete (email_logs left as-is)", "PASS")
        return True
    except Exception as e:
        log(f"❌ Exception during cleanup: {str(e)}", "FAIL")
        return False

def main():
    """Run all tests"""
    log("=" * 80, "INFO")
    log("EMAIL NOTIFICATIONS TEST — LOCALHOST ONLY", "INFO")
    log(f"Base URL: {BASE_URL}", "INFO")
    log("=" * 80, "INFO")
    
    results = []
    consultation_id = None
    message_id = None
    
    # Connect to MongoDB
    if not connect_mongodb():
        log("❌ Cannot proceed without MongoDB connection", "FAIL")
        sys.exit(1)
    
    # Test 0: Get consultation types (optional)
    get_consultation_types()
    
    # Test 1: Travel consultation submission
    success, consultation_id = test_travel_consultation_submission()
    results.append(("Travel Consultation Submission", success))
    
    # Test 2: Contact form submission
    success, message_id = test_contact_form_submission()
    results.append(("Contact Form Submission", success))
    
    # Test 3: Verify email logs
    if consultation_id and message_id:
        success = verify_email_logs(consultation_id, message_id)
        results.append(("Email Logs Verification", success))
    else:
        log("⚠️  Skipping email logs verification (missing IDs)", "WARN")
        results.append(("Email Logs Verification", False))
    
    # Test 4: Verify data stored
    if consultation_id and message_id:
        success = verify_data_stored(consultation_id, message_id)
        results.append(("Data Storage Verification", success))
    else:
        log("⚠️  Skipping data storage verification (missing IDs)", "WARN")
        results.append(("Data Storage Verification", False))
    
    # Test 5: Cleanup
    if consultation_id and message_id:
        success = cleanup_test_data(consultation_id, message_id)
        results.append(("Cleanup", success))
    else:
        log("⚠️  Skipping cleanup (missing IDs)", "WARN")
        results.append(("Cleanup", False))
    
    # Close MongoDB connection
    if mongo_client:
        mongo_client.close()
        log("MongoDB connection closed", "INFO")
    
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
    log(f"TOTAL: {passed}/{total} tests passed ({passed*100//total if total > 0 else 0}%)", "INFO")
    log("=" * 80, "INFO")
    
    # Exit with appropriate code
    sys.exit(0 if passed == total else 1)

if __name__ == "__main__":
    main()
