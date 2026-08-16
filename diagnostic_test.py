#!/usr/bin/env python3
"""
Diagnostic test to see what's actually happening with the vocational applications endpoint
"""

import requests
import json

BASE_URL = "https://www.das-deutsche-haus.com/api"

# Test 1: Get jobs
print("=" * 80)
print("Test 1: GET /api/vocational/jobs")
print("=" * 80)
response = requests.get(f"{BASE_URL}/vocational/jobs", timeout=20)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
print()

# Get a job ID
jobs = response.json().get("jobs", [])
if jobs:
    job_id = jobs[0]["id"]
    print(f"Using job ID: {job_id}")
    print()
    
    # Test 2: Invalid email
    print("=" * 80)
    print("Test 2: POST with invalid email 'abc'")
    print("=" * 80)
    response = requests.post(
        f"{BASE_URL}/vocational/applications",
        json={
            "jobId": job_id,
            "name": "Test User",
            "email": "abc",
            "phone": "+491234567",
            "germanLevel": "B1",
            "education": "Abitur"
        },
        timeout=20
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test 3: Invalid germanLevel
    print("=" * 80)
    print("Test 3: POST with invalid germanLevel 'X9'")
    print("=" * 80)
    response = requests.post(
        f"{BASE_URL}/vocational/applications",
        json={
            "jobId": job_id,
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+491234567",
            "germanLevel": "X9",
            "education": "Abitur"
        },
        timeout=20
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test 4: Missing education
    print("=" * 80)
    print("Test 4: POST with missing education")
    print("=" * 80)
    response = requests.post(
        f"{BASE_URL}/vocational/applications",
        json={
            "jobId": job_id,
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+491234567",
            "germanLevel": "B1"
        },
        timeout=20
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test 5: German error message
    print("=" * 80)
    print("Test 5: POST with lang=de and missing name")
    print("=" * 80)
    response = requests.post(
        f"{BASE_URL}/vocational/applications",
        json={
            "jobId": job_id,
            "email": "test@example.com",
            "phone": "+491234567",
            "germanLevel": "B1",
            "education": "Abitur",
            "lang": "de"
        },
        timeout=20
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
    
    # Test 6: Nonexistent job
    print("=" * 80)
    print("Test 6: POST with nonexistent job ID")
    print("=" * 80)
    response = requests.post(
        f"{BASE_URL}/vocational/applications",
        json={
            "jobId": "nonexistent-id",
            "name": "Test User",
            "email": "test@example.com",
            "phone": "+491234567",
            "germanLevel": "B1",
            "education": "Abitur"
        },
        timeout=20
    )
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    print()
