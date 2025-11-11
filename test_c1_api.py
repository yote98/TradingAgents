"""
Test script for C1 Backend API

Tests all endpoints to verify the API is working correctly.
"""

import requests
import json
from datetime import datetime


API_BASE_URL = "http://localhost:5000"


def print_section(title):
    """Print a section header."""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)


def test_health():
    """Test health check endpoint."""
    print_section("Testing Health Check")
    
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Health check passed!")
            return True
        else:
            print("❌ Health check failed!")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API server!")
        print("   Make sure the server is running: python c1_api_server.py")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_metrics():
    """Test metrics endpoint."""
    print_section("Testing Metrics")
    
    try:
        response = requests.get(f"{API_BASE_URL}/metrics", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Metrics endpoint working!")
            return True
        else:
            print("❌ Metrics endpoint failed!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_all_coach_plans():
    """Test getting all coach plans."""
    print_section("Testing Get All Coach Plans")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/coach-plans/all", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Number of coaches: {len(data)}")
            
            for coach_id, plan in data.items():
                print(f"\n{coach_id}:")
                print(f"  Plan length: {len(plan['plan'])} characters")
                print(f"  Created at: {plan['created_at']}")
                print(f"  Charts: {len(plan['charts'])}")
                print(f"  Preview: {plan['plan'][:100]}...")
            
            print("\n✅ All coach plans retrieved successfully!")
            return True
        else:
            print(f"❌ Failed to get coach plans!")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_specific_coach_plan():
    """Test getting a specific coach plan."""
    print_section("Testing Get Specific Coach Plan")
    
    coach_id = "coach_d"
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/coach-plans/{coach_id}", timeout=5)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nCoach: {coach_id}")
            print(f"Plan: {data['plan'][:200]}...")
            print(f"Created at: {data['created_at']}")
            print(f"Charts: {data['charts']}")
            
            print(f"\n✅ Coach {coach_id} plan retrieved successfully!")
            return True
        else:
            print(f"❌ Failed to get coach plan!")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_invalid_coach():
    """Test getting an invalid coach (should return 400)."""
    print_section("Testing Invalid Coach ID (Expected to Fail)")
    
    coach_id = "coach_invalid"
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/coach-plans/{coach_id}", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 400:
            print("✅ Correctly rejected invalid coach ID!")
            return True
        else:
            print("❌ Should have returned 400 for invalid coach!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def test_service_info():
    """Test service info endpoint."""
    print_section("Testing Service Info")
    
    try:
        response = requests.get(f"{API_BASE_URL}/api/coach-plans/info", timeout=5)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 200:
            print("✅ Service info retrieved successfully!")
            return True
        else:
            print("❌ Failed to get service info!")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def run_all_tests():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("  C1 Backend API Test Suite")
    print("=" * 60)
    print(f"Testing API at: {API_BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    tests = [
        ("Health Check", test_health),
        ("Metrics", test_metrics),
        ("All Coach Plans", test_all_coach_plans),
        ("Specific Coach Plan", test_specific_coach_plan),
        ("Invalid Coach ID", test_invalid_coach),
        ("Service Info", test_service_info),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"\n❌ Test '{test_name}' crashed: {e}")
            results.append((test_name, False))
    
    # Print summary
    print_section("Test Summary")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Your API is working perfectly!")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Check the output above for details.")
    
    return passed == total


if __name__ == "__main__":
    success = run_all_tests()
    exit(0 if success else 1)
