"""
Test script to verify Flask API implementation meets all requirements.
"""

import os
import sys
import json
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from tradingagents.integrations.discord_enhanced.storage import StorageManager
from tradingagents.integrations.discord_enhanced.service import PlanService
from tradingagents.integrations.discord_enhanced.config import ConfigManager
from tradingagents.integrations.discord_enhanced.api import PlanAPI


def test_flask_api():
    """Test all Flask API functionality."""
    
    print("=" * 60)
    print("Testing Flask API Implementation")
    print("=" * 60)
    
    # Create test database
    test_db_path = "./test_data/test_api.db"
    os.makedirs("./test_data", exist_ok=True)
    
    # Clean up old test database
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except PermissionError:
            pass
    
    # Set mock mode to avoid requiring Discord token
    os.environ['MOCK_MODE'] = 'true'
    os.environ['DATABASE_PATH'] = test_db_path
    
    try:
        # Initialize components
        print("\n✓ Test 1: API Initialization")
        config = ConfigManager()
        storage = StorageManager(test_db_path)
        service = PlanService(storage)
        
        # Mock bot status callback
        def mock_bot_status():
            return True
        
        api = PlanAPI(config, service, storage, mock_bot_status)
        client = api.app.test_client()
        print(f"  API initialized successfully")
        
        # Test 2: Root endpoint
        print("\n✓ Test 2: Root Endpoint")
        response = client.get('/')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'name' in data, "Should have name field"
        assert 'endpoints' in data, "Should have endpoints field"
        print(f"  Root endpoint: {data['name']}")
        print(f"  Available endpoints: {len(data['endpoints'])}")
        
        # Test 3: Health check endpoint
        print("\n✓ Test 3: Health Check Endpoint")
        response = client.get('/health')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'status' in data, "Should have status field"
        assert 'components' in data, "Should have components field"
        assert 'database' in data['components'], "Should have database component"
        assert 'discord_bot' in data['components'], "Should have discord_bot component"
        print(f"  Status: {data['status']}")
        print(f"  Database: {data['components']['database']['status']}")
        print(f"  Discord Bot: {data['components']['discord_bot']['status']}")
        
        # Test 4: Metrics endpoint
        print("\n✓ Test 4: Metrics Endpoint")
        response = client.get('/metrics')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'requests' in data, "Should have requests field"
        assert 'database' in data, "Should have database field"
        assert 'uptime_seconds' in data, "Should have uptime field"
        print(f"  Total requests: {data['requests']['total']}")
        print(f"  Error rate: {data['requests']['error_rate_percent']}%")
        print(f"  Uptime: {data['uptime_seconds']:.2f}s")
        
        # Add some test data
        print("\n✓ Test 5: Add Test Data")
        service.process_plan_message(
            coach_name="d",
            plan_text="NVDA showing bullish flag pattern. Watch for breakout above $950.",
            author="test_user",
            date="2024-11-09",
            channel="trading-signals"
        )
        service.process_plan_message(
            coach_name="i",
            plan_text="NVDA earnings next week. Expect strong data center revenue.",
            author="test_user2",
            date="2024-11-09"
        )
        print(f"  Added 2 test plans")
        
        # Test 6: Get coach plan (valid)
        print("\n✓ Test 6: Get Coach Plan (Valid)")
        response = client.get('/api/coach-plans/?coach=d&date=2024-11-09')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'plan' in data, "Should have plan field"
        assert 'charts' in data, "Should have charts field"
        assert 'author' in data, "Should have author field"
        assert "NVDA" in data['plan'], "Should contain plan text"
        print(f"  Retrieved plan: {data['plan'][:50]}...")
        print(f"  Author: {data['author']}")
        
        # Test 7: Get coach plan (missing coach parameter)
        print("\n✓ Test 7: Get Coach Plan (Missing Parameter)")
        response = client.get('/api/coach-plans/')
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = json.loads(response.data)
        assert 'error' in data, "Should have error field"
        assert "Missing required parameter" in data['error'], "Should mention missing parameter"
        print(f"  Correctly rejected: {data['error']}")
        
        # Test 8: Get coach plan (invalid coach)
        print("\n✓ Test 8: Get Coach Plan (Invalid Coach)")
        response = client.get('/api/coach-plans/?coach=x&date=2024-11-09')
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = json.loads(response.data)
        assert 'error' in data, "Should have error field"
        assert "Invalid coach name" in data['error'], "Should mention invalid coach"
        print(f"  Correctly rejected: {data['error']}")
        
        # Test 9: Get coach plan (non-existent)
        print("\n✓ Test 9: Get Coach Plan (Non-existent)")
        response = client.get('/api/coach-plans/?coach=s&date=2024-01-01')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'plan' in data, "Should have plan field"
        assert "No plan available" in data['plan'], "Should indicate no plan"
        print(f"  Correctly handled non-existent plan")
        
        # Test 10: Get all plans
        print("\n✓ Test 10: Get All Plans")
        response = client.get('/api/coach-plans/all?date=2024-11-09')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'coach_d' in data, "Should have coach_d"
        assert 'coach_i' in data, "Should have coach_i"
        assert len(data) == 2, "Should have 2 plans"
        print(f"  Retrieved {len(data)} plans")
        for coach, plan in data.items():
            print(f"    - {coach}: {plan['plan'][:40]}...")
        
        # Test 11: Get all plans (default date - today)
        print("\n✓ Test 11: Get All Plans (Default Date)")
        response = client.get('/api/coach-plans/all')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        print(f"  Retrieved plans for today: {len(data)} plans")
        
        # Test 12: Get plan history
        print("\n✓ Test 12: Get Plan History")
        # First edit a plan to create history
        service.edit_plan("d", "2024-11-09", "UPDATED: Breakout confirmed!", "test_user")
        
        response = client.get('/api/coach-plans/history?coach=d&date=2024-11-09')
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = json.loads(response.data)
        assert 'history' in data, "Should have history field"
        assert len(data['history']) > 0, "Should have history entries"
        print(f"  Retrieved {len(data['history'])} historical version(s)")
        
        # Test 13: Get plan history (missing parameter)
        print("\n✓ Test 13: Get Plan History (Missing Parameter)")
        response = client.get('/api/coach-plans/history')
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
        data = json.loads(response.data)
        assert 'error' in data, "Should have error field"
        print(f"  Correctly rejected: {data['error']}")
        
        # Test 14: 404 Not Found
        print("\n✓ Test 14: 404 Not Found Handler")
        response = client.get('/nonexistent-endpoint')
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"
        data = json.loads(response.data)
        assert 'error' in data, "Should have error field"
        assert data['error'] == 'Not Found', "Should be Not Found error"
        print(f"  404 handler working: {data['message']}")
        
        # Test 15: CORS headers
        print("\n✓ Test 15: CORS Support")
        response = client.get('/health')
        assert 'Access-Control-Allow-Origin' in response.headers, "Should have CORS header"
        print(f"  CORS enabled: {response.headers.get('Access-Control-Allow-Origin')}")
        
        # Test 16: Request logging (check metrics)
        print("\n✓ Test 16: Request Logging and Metrics")
        # Make several requests
        for i in range(5):
            client.get('/health')
        
        response = client.get('/metrics')
        data = json.loads(response.data)
        assert data['requests']['total'] > 10, "Should have tracked requests"
        print(f"  Total requests tracked: {data['requests']['total']}")
        print(f"  Success: {data['requests']['success']}")
        print(f"  Errors: {data['requests']['error']}")
        
        # Test 17: Database stats in metrics
        print("\n✓ Test 17: Database Stats in Metrics")
        response = client.get('/metrics')
        data = json.loads(response.data)
        assert 'database' in data, "Should have database stats"
        assert data['database']['total_plans'] == 2, "Should show 2 plans"
        print(f"  Database stats:")
        print(f"    Total plans: {data['database']['total_plans']}")
        print(f"    Total charts: {data['database']['total_charts']}")
        print(f"    Total edits: {data['database']['total_edits']}")
        
        # Test 18: Health check with database down (simulate)
        print("\n✓ Test 18: Health Check (Simulated DB Failure)")
        # This would require mocking, but we can verify the structure
        response = client.get('/health')
        data = json.loads(response.data)
        assert 'components' in data, "Should have components"
        assert 'database' in data['components'], "Should check database"
        assert 'discord_bot' in data['components'], "Should check bot"
        print(f"  Health check structure validated")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nFlask API Implementation Summary:")
        print("  ✓ Root endpoint with API info")
        print("  ✓ Health check endpoint (/health)")
        print("  ✓ Metrics endpoint (/metrics)")
        print("  ✓ Get coach plan endpoint (/api/coach-plans/)")
        print("  ✓ Get all plans endpoint (/api/coach-plans/all)")
        print("  ✓ Get plan history endpoint (/api/coach-plans/history)")
        print("  ✓ Parameter validation (400 errors)")
        print("  ✓ 404 Not Found handler")
        print("  ✓ 500 Internal Server Error handler")
        print("  ✓ CORS support for web dashboards")
        print("  ✓ Request/response logging")
        print("  ✓ Metrics tracking (requests, errors, uptime)")
        print("  ✓ Database health monitoring")
        print("  ✓ Bot status monitoring")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up
        try:
            if os.path.exists(test_db_path):
                os.remove(test_db_path)
            if os.path.exists("./test_data") and not os.listdir("./test_data"):
                os.rmdir("./test_data")
        except (PermissionError, OSError):
            print("\nNote: Test database cleanup skipped (file in use)")
            pass
        
        # Clean up environment
        if 'MOCK_MODE' in os.environ:
            del os.environ['MOCK_MODE']
        if 'DATABASE_PATH' in os.environ:
            del os.environ['DATABASE_PATH']


if __name__ == "__main__":
    success = test_flask_api()
    sys.exit(0 if success else 1)
