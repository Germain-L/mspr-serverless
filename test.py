#!/usr/bin/env python3
"""
Test script for OpenFaaS authentication functions
"""

import requests
import json
import time
import pyotp
from typing import Dict, Any

# Configuration
BASE_URL = "https://openfaas.germainleignel.com/function"
FUNCTIONS = {
    "generate-password": f"{BASE_URL}/generate-password",
    "generate-2fa": f"{BASE_URL}/generate-2fa",
    "authenticate-user": f"{BASE_URL}/authenticate-user",
    "check-user-status": f"{BASE_URL}/check-user-status"
}

# Test data
TEST_USERNAME = f"testuser_{int(time.time())}"
TEST_PASSWORD = None
TEST_2FA_SECRET = None

def make_request(url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    """Make a POST request to an OpenFaaS function."""
    try:
        response = requests.post(
            url,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"Request to {url}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        print(f"Status Code: {response.status_code}")
        
        try:
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            return result
        except json.JSONDecodeError:
            print(f"Response (raw): {response.text}")
            return {"error": "Invalid JSON response", "raw": response.text}
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return {"error": str(e)}

def test_generate_password():
    """Test password generation function."""
    print("\n" + "="*50)
    print("TESTING: generate-password")
    print("="*50)
    
    global TEST_PASSWORD
    
    # Test 1: Valid username
    print("\n1. Testing valid username...")
    result = make_request(FUNCTIONS["generate-password"], {
        "username": TEST_USERNAME
    })
    
    if result.get("status") == "success":
        TEST_PASSWORD = result.get("password")
        print(f"✅ Password generated successfully: {TEST_PASSWORD}")
    else:
        print("❌ Failed to generate password")
        return False
    
    # Test 2: Empty username
    print("\n2. Testing empty username...")
    result = make_request(FUNCTIONS["generate-password"], {
        "username": ""
    })
    
    if result.get("error"):
        print("✅ Correctly rejected empty username")
    else:
        print("❌ Should have rejected empty username")
    
    # Test 3: Duplicate username
    print("\n3. Testing duplicate username...")
    result = make_request(FUNCTIONS["generate-password"], {
        "username": TEST_USERNAME
    })
    
    if result.get("error") and "already exists" in result.get("error", ""):
        print("✅ Correctly rejected duplicate username")
    else:
        print("❌ Should have rejected duplicate username")
    
    # Test 4: Invalid JSON
    print("\n4. Testing invalid JSON...")
    try:
        response = requests.post(
            FUNCTIONS["generate-password"],
            data="invalid json",
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        result = response.json()
        if result.get("error") and "Invalid JSON" in result.get("error", ""):
            print("✅ Correctly handled invalid JSON")
        else:
            print("❌ Should have handled invalid JSON")
    except:
        print("❌ Error testing invalid JSON")
    
    return True

def test_check_user_status():
    """Test user status checking function."""
    print("\n" + "="*50)
    print("TESTING: check-user-status")
    print("="*50)
    
    # Test 1: Existing user
    print("\n1. Testing existing user...")
    result = make_request(FUNCTIONS["check-user-status"], {
        "username": TEST_USERNAME
    })
    
    if result.get("exists") is True:
        print("✅ Correctly found existing user")
    else:
        print("❌ Should have found existing user")
    
    # Test 2: Non-existing user
    print("\n2. Testing non-existing user...")
    result = make_request(FUNCTIONS["check-user-status"], {
        "username": "nonexistent_user_12345"
    })
    
    if result.get("exists") is False:
        print("✅ Correctly identified non-existing user")
    else:
        print("❌ Should have identified non-existing user")
    
    # Test 3: Empty username
    print("\n3. Testing empty username...")
    result = make_request(FUNCTIONS["check-user-status"], {
        "username": ""
    })
    
    if result.get("error"):
        print("✅ Correctly rejected empty username")
    else:
        print("❌ Should have rejected empty username")

def test_generate_2fa():
    """Test 2FA generation function."""
    print("\n" + "="*50)
    print("TESTING: generate-2fa")
    print("="*50)
    
    global TEST_2FA_SECRET
    
    # Test 1: Valid username
    print("\n1. Testing 2FA generation for existing user...")
    result = make_request(FUNCTIONS["generate-2fa"], {
        "username": TEST_USERNAME
    })
    
    if result.get("status") == "success":
        TEST_2FA_SECRET = result.get("secret")
        print(f"✅ 2FA secret generated successfully: {TEST_2FA_SECRET}")
    else:
        print("❌ Failed to generate 2FA secret")
        return False
    
    # Test 2: Non-existing user
    print("\n2. Testing 2FA generation for non-existing user...")
    result = make_request(FUNCTIONS["generate-2fa"], {
        "username": "nonexistent_user_12345"
    })
    
    if result.get("error") and "not found" in result.get("error", ""):
        print("✅ Correctly rejected non-existing user")
    else:
        print("❌ Should have rejected non-existing user")
    
    # Test 3: Empty username
    print("\n3. Testing empty username...")
    result = make_request(FUNCTIONS["generate-2fa"], {
        "username": ""
    })
    
    if result.get("error"):
        print("✅ Correctly rejected empty username")
    else:
        print("❌ Should have rejected empty username")
    
    return True

def test_authenticate_user():
    """Test user authentication function."""
    print("\n" + "="*50)
    print("TESTING: authenticate-user")
    print("="*50)
    
    # Test 1: Valid credentials without 2FA
    print("\n1. Testing authentication with valid password only...")
    result = make_request(FUNCTIONS["authenticate-user"], {
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD
    })
    
    if result.get("error") and "TOTP code is required" in result.get("error", ""):
        print("✅ Correctly required 2FA code")
    else:
        print("❌ Should have required 2FA code since we set it up")
    
    # Test 2: Valid credentials with valid 2FA
    if TEST_2FA_SECRET:
        print("\n2. Testing authentication with valid password and 2FA...")
        totp = pyotp.TOTP(TEST_2FA_SECRET)
        current_totp = totp.now()
        
        result = make_request(FUNCTIONS["authenticate-user"], {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD,
            "totp_code": current_totp
        })
        
        if result.get("status") == "success":
            print("✅ Authentication successful with 2FA")
        else:
            print(f"❌ Authentication failed: {result}")
    
    # Test 3: Invalid password
    print("\n3. Testing authentication with invalid password...")
    result = make_request(FUNCTIONS["authenticate-user"], {
        "username": TEST_USERNAME,
        "password": "wrong_password"
    })
    
    if result.get("error") and "Invalid username or password" in result.get("error", ""):
        print("✅ Correctly rejected invalid password")
    else:
        print("❌ Should have rejected invalid password")
    
    # Test 4: Invalid 2FA code
    if TEST_2FA_SECRET:
        print("\n4. Testing authentication with invalid 2FA code...")
        result = make_request(FUNCTIONS["authenticate-user"], {
            "username": TEST_USERNAME,
            "password": TEST_PASSWORD,
            "totp_code": "123456"
        })
        
        if result.get("error") and "Invalid TOTP code" in result.get("error", ""):
            print("✅ Correctly rejected invalid TOTP code")
        else:
            print("❌ Should have rejected invalid TOTP code")
    
    # Test 5: Non-existing user
    print("\n5. Testing authentication with non-existing user...")
    result = make_request(FUNCTIONS["authenticate-user"], {
        "username": "nonexistent_user_12345",
        "password": "some_password"
    })
    
    if result.get("error") and "Invalid username or password" in result.get("error", ""):
        print("✅ Correctly rejected non-existing user")
    else:
        print("❌ Should have rejected non-existing user")
    
    # Test 6: Missing required fields
    print("\n6. Testing authentication with missing fields...")
    result = make_request(FUNCTIONS["authenticate-user"], {
        "username": TEST_USERNAME
        # Missing password
    })
    
    if result.get("error") and "required" in result.get("error", ""):
        print("✅ Correctly rejected missing password")
    else:
        print("❌ Should have rejected missing password")

def test_complete_flow():
    """Test the complete user flow."""
    print("\n" + "="*60)
    print("TESTING: Complete User Flow")
    print("="*60)
    
    flow_username = f"flowtest_{int(time.time())}"
    
    # Step 1: Create user
    print("\n1. Creating new user...")
    result = make_request(FUNCTIONS["generate-password"], {
        "username": flow_username
    })
    
    if result.get("status") != "success":
        print("❌ Failed to create user for flow test")
        return
    
    flow_password = result.get("password")
    print(f"✅ User created with password: {flow_password}")
    
    # Step 2: Check user status (should exist, no 2FA)
    print("\n2. Checking user status...")
    result = make_request(FUNCTIONS["check-user-status"], {
        "username": flow_username
    })
    
    if result.get("exists") and not result.get("has_2fa"):
        print("✅ User exists without 2FA")
    else:
        print("❌ Unexpected user status")
    
    # Step 3: Authenticate without 2FA
    print("\n3. Authenticating without 2FA...")
    result = make_request(FUNCTIONS["authenticate-user"], {
        "username": flow_username,
        "password": flow_password
    })
    
    if result.get("status") == "success":
        print("✅ Authentication successful without 2FA")
    else:
        print(f"❌ Authentication failed: {result}")
    
    # Step 4: Setup 2FA
    print("\n4. Setting up 2FA...")
    result = make_request(FUNCTIONS["generate-2fa"], {
        "username": flow_username
    })
    
    if result.get("status") != "success":
        print("❌ Failed to setup 2FA")
        return
    
    flow_2fa_secret = result.get("secret")
    print(f"✅ 2FA setup with secret: {flow_2fa_secret}")
    
    # Step 5: Check user status (should exist, has 2FA)
    print("\n5. Checking user status after 2FA setup...")
    result = make_request(FUNCTIONS["check-user-status"], {
        "username": flow_username
    })
    
    if result.get("exists") and result.get("has_2fa"):
        print("✅ User exists with 2FA")
    else:
        print("❌ Unexpected user status after 2FA setup")
    
    # Step 6: Authenticate with 2FA
    print("\n6. Authenticating with 2FA...")
    totp = pyotp.TOTP(flow_2fa_secret)
    current_totp = totp.now()
    
    result = make_request(FUNCTIONS["authenticate-user"], {
        "username": flow_username,
        "password": flow_password,
        "totp_code": current_totp
    })
    
    if result.get("status") == "success":
        print("✅ Authentication successful with 2FA")
        print("✅ Complete flow test passed!")
    else:
        print(f"❌ Authentication with 2FA failed: {result}")

def main():
    """Run all tests."""
    print("Starting OpenFaaS Authentication Functions Test Suite")
    print(f"Base URL: {BASE_URL}")
    print(f"Test Username: {TEST_USERNAME}")
    
    try:
        # Test individual functions
        if test_generate_password():
            test_check_user_status()
            if test_generate_2fa():
                test_authenticate_user()
        
        # Test complete flow with a separate user
        test_complete_flow()
        
        print("\n" + "="*60)
        print("TEST SUITE COMPLETED")
        print("="*60)
        
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")

if __name__ == "__main__":
    main()
