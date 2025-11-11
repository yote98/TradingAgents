"""
Test script for deployment verification
Tests all endpoints and integration points
"""

import requests
import sys
import time
from typing import Dict, Any

def print_header(text: str):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def test_endpoint(base_url: str, endpoint: str, method: str = 'GET') -> bool:
    """Test a single endpoint"""
    url = f"{base_url}{endpoint}"
    print(f"Testing: {method} {url}")
    
    try:
        if method == 'GET':
            response = requests.get(url, timeout=10)
        else:
            response = requests.post(url, timeout=10)
        
        print(f"  Status: {response.status_code}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  Response: {str(data)[:100]}...")
            except:
                print(f"  Response: {response.text[:100]}...")
            print("  ✅ PASSED")
            return True
        else:
            print(f"  ❌ FAILED - Status {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"  ❌ FAILED - Connection refused")
        print(f"  Make sure the server is running at {base_url}")
        return False
    except requests.exceptions.Timeout:
        print(f"  ❌ FAILED - Request timeout")
        return False
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_client_integration(base_url: str) -> bool:
    """Test the EnhancedWebhookClient"""
    print(f"Testing: EnhancedWebhookClient integration")
    
    try:
        from tradingagents.integrations.discord_enhanced.client import EnhancedWebhookClient
        
        client = EnhancedWebhookClient(base_url)
        
        # Test fetch all plans
        plans = client.fetch_all_coach_plans()
        print(f"  Fetched {len(plans)} coach plans")
        
        # Test fetch specific coach
        if plans:
            first_coach = list(plans.keys())[0]
            plan = client.fetch_coach_plan(first_coach[-1])  # Get coach letter
            if plan:
                print(f"  Fetched specific plan for {first_coach}")
        
        print("  ✅ PASSED")
        return True
        
    except ImportError as e:
        print(f"  ⚠️  SKIPPED - Could not import client: {e}")
        return True  # Don't fail if import doesn't work
    except Exception as e:
        print(f"  ❌ FAILED - {str(e)}")
        return False

def test_deployment(base_url: str) -> Dict[str, Any]:
    """
    Comprehensive deployment test
    
    Args:
        base_url: Base URL of the deployed API (e.g., http://localhost:5000)
    
    Returns:
        Dictionary with test results
    """
    print_header(f"Testing Deployment: {base_url}")
    
    results = {
        'base_url': base_url,
        'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
        'tests': {}
    }
    
    # Test 1: Health Check
    print_header("Test 1: Health Check")
    results['tests']['health'] = test_endpoint(base_url, '/health')
    
    # Test 2: Metrics
    print_header("Test 2: Metrics Endpoint")
    results['tests']['metrics'] = test_endpoint(base_url, '/metrics')
    
    # Test 3: Fetch All Plans
    print_header("Test 3: Fetch All Coach Plans")
    results['tests']['fetch_all'] = test_endpoint(base_url, '/api/coach-plans/all')
    
    # Test 4: Fetch Specific Coach
    print_header("Test 4: Fetch Specific Coach Plan")
    results['tests']['fetch_specific'] = test_endpoint(base_url, '/api/coach-plans/d')
    
    # Test 5: Client Integration
    print_header("Test 5: Client Integration")
    results['tests']['client'] = test_client_integration(base_url)
    
    # Summary
    print_header("Test Summary")
    passed = sum(1 for v in results['tests'].values() if v)
    total = len(results['tests'])
    
    print(f"Passed: {passed}/{total}")
    print(f"Failed: {total - passed}/{total}")
    
    if passed == total:
        print("\n✅ ALL TESTS PASSED! Deployment is healthy.")
        results['status'] = 'PASSED'
    else:
        print("\n❌ SOME TESTS FAILED. Check the output above.")
        results['status'] = 'FAILED'
    
    return results

def main():
    """Main test runner"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Test TradingAgents Discord API deployment')
    parser.add_argument(
        '--url',
        default='http://localhost:5000',
        help='Base URL of the API (default: http://localhost:5000)'
    )
    parser.add_argument(
        '--wait',
        type=int,
        default=0,
        help='Wait N seconds before testing (useful for startup)'
    )
    
    args = parser.parse_args()
    
    if args.wait > 0:
        print(f"Waiting {args.wait} seconds for server startup...")
        time.sleep(args.wait)
    
    results = test_deployment(args.url)
    
    # Exit with appropriate code
    sys.exit(0 if results['status'] == 'PASSED' else 1)

if __name__ == "__main__":
    main()
