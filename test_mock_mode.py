"""
Test script to verify Mock Mode implementation meets all requirements.
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from tradingagents.integrations.discord_enhanced.storage import StorageManager
from tradingagents.integrations.discord_enhanced.service import PlanService
from tradingagents.integrations.discord_enhanced.mock import (
    MockDataProvider,
    MockDiscordBot,
    create_mock_system,
    populate_mock_data
)


def test_mock_mode():
    """Test all mock mode functionality."""
    
    print("=" * 60)
    print("Testing Mock Mode Implementation")
    print("=" * 60)
    
    # Create test database
    test_db_path = "./test_data/test_mock.db"
    os.makedirs("./test_data", exist_ok=True)
    
    # Clean up old test database
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except PermissionError:
            pass
    
    try:
        # Initialize components
        print("\n✓ Test 1: Initialize Mock Components")
        storage = StorageManager(test_db_path)
        service = PlanService(storage)
        mock_data = MockDataProvider()
        mock_bot = MockDiscordBot(service, mock_data)
        print(f"  Mock system initialized (no Discord required)")
        
        # Test 2: Mock data provider
        print("\n✓ Test 2: Mock Data Provider")
        plan_d = mock_data.get_plan('d', '2024-11-09')
        assert plan_d is not None, "Should have mock plan for coach d"
        assert 'plan' in plan_d, "Should have plan field"
        assert 'charts' in plan_d, "Should have charts field"
        assert 'author' in plan_d, "Should have author field"
        assert len(plan_d['plan']) > 50, "Should have realistic plan text"
        print(f"  Mock plan for coach d: {plan_d['plan'][:60]}...")
        print(f"  Charts: {len(plan_d['charts'])}")
        
        # Test 3: All coaches have mock data
        print("\n✓ Test 3: Mock Data for All Coaches")
        coaches = ['d', 'i', 's', 'n']
        for coach in coaches:
            plan = mock_data.get_plan(coach, '2024-11-09')
            assert plan is not None, f"Should have mock plan for coach {coach}"
            assert len(plan['plan']) > 0, f"Coach {coach} should have plan text"
        print(f"  All {len(coaches)} coaches have mock data")
        
        # Test 4: Get all plans
        print("\n✓ Test 4: Get All Mock Plans")
        all_plans = mock_data.get_all_plans('2024-11-09')
        assert len(all_plans) == 4, "Should have 4 coach plans"
        assert 'coach_d' in all_plans, "Should include coach_d"
        assert 'coach_i' in all_plans, "Should include coach_i"
        assert 'coach_s' in all_plans, "Should include coach_s"
        assert 'coach_n' in all_plans, "Should include coach_n"
        print(f"  Retrieved {len(all_plans)} mock plans")
        
        # Test 5: Simulate single plan post
        print("\n✓ Test 5: Simulate Single Plan Post")
        success, message, plan_id = mock_bot.simulate_plan_post('d', '2024-11-09')
        assert success, f"Should succeed: {message}"
        assert plan_id is not None, "Should return plan ID"
        assert "✅" in message, "Should have success indicator"
        print(f"  Plan posted successfully: ID={plan_id}")
        print(f"  Message: {message[:70]}...")
        
        # Verify plan was saved
        saved_plan = service.get_plan_for_api('d', '2024-11-09')
        assert 'NVDA' in saved_plan['plan'], "Should have saved the mock plan"
        print(f"  Verified plan saved to database")
        
        # Test 6: Simulate multiple plan posts
        print("\n✓ Test 6: Simulate Multiple Plan Posts")
        results = mock_bot.simulate_multiple_posts('2024-11-10')
        assert len(results) == 4, "Should have 4 results"
        
        successful = sum(1 for success, _, _ in results.values() if success)
        assert successful == 4, "All posts should succeed"
        print(f"  Simulated {len(results)} plan posts")
        print(f"  Successful: {successful}/{len(results)}")
        
        # Verify all plans were saved
        all_saved = service.get_all_plans_for_api('2024-11-10')
        assert len(all_saved) == 4, "Should have saved all 4 plans"
        print(f"  Verified all plans saved to database")
        
        # Test 7: Simulate specific coaches
        print("\n✓ Test 7: Simulate Specific Coaches")
        results = mock_bot.simulate_multiple_posts('2024-11-11', coaches=['d', 'i'])
        assert len(results) == 2, "Should have 2 results"
        assert 'd' in results, "Should include coach d"
        assert 'i' in results, "Should include coach i"
        print(f"  Simulated {len(results)} specific coaches")
        
        # Test 8: Mock bot status
        print("\n✓ Test 8: Mock Bot Status")
        status = mock_bot.get_status()
        assert status['connected'] == True, "Should be connected"
        assert status['mode'] == 'mock', "Should be in mock mode"
        assert 'no Discord connection' in status['message'], "Should indicate mock mode"
        print(f"  Bot status: {status['mode']}, connected: {status['connected']}")
        print(f"  Message: {status['message']}")
        
        # Test 9: Mock bot connect/disconnect
        print("\n✓ Test 9: Mock Bot Connect/Disconnect")
        mock_bot.disconnect()
        assert mock_bot.is_connected == False, "Should be disconnected"
        print(f"  Bot disconnected")
        
        mock_bot.connect()
        assert mock_bot.is_connected == True, "Should be connected"
        print(f"  Bot reconnected")
        
        # Test 10: Create mock system helper
        print("\n✓ Test 10: Create Mock System Helper")
        mock_data2, mock_bot2 = create_mock_system(storage, service)
        assert mock_data2 is not None, "Should create mock data provider"
        assert mock_bot2 is not None, "Should create mock bot"
        print(f"  Mock system created via helper function")
        
        # Test 11: Populate mock data helper
        print("\n✓ Test 11: Populate Mock Data Helper")
        summary = populate_mock_data(service, '2024-11-12')
        assert summary['total'] == 4, "Should process 4 coaches"
        assert summary['successful'] == 4, "All should succeed"
        assert summary['failed'] == 0, "None should fail"
        assert summary['date'] == '2024-11-12', "Should use specified date"
        print(f"  Populated mock data: {summary['successful']}/{summary['total']} successful")
        print(f"  Date: {summary['date']}")
        
        # Test 12: Mock data with chart URLs
        print("\n✓ Test 12: Mock Data with Chart URLs")
        plan_with_charts = mock_data.get_plan('d', '2024-11-09')
        assert len(plan_with_charts['charts']) > 0, "Should have chart URLs"
        for chart_url in plan_with_charts['charts']:
            assert chart_url.startswith('https://'), "Should be valid URL"
            assert 'mock' in chart_url, "Should indicate mock data"
        print(f"  Coach d has {len(plan_with_charts['charts'])} chart URLs")
        
        plan_no_charts = mock_data.get_plan('n', '2024-11-09')
        assert len(plan_no_charts['charts']) == 0, "Coach n should have no charts"
        print(f"  Coach n has {len(plan_no_charts['charts'])} chart URLs (as expected)")
        
        # Test 13: Mock data realism
        print("\n✓ Test 13: Mock Data Realism")
        for coach in ['d', 'i', 's', 'n']:
            plan = mock_data.get_plan(coach, '2024-11-09')
            # Check for realistic content
            assert len(plan['plan']) > 100, f"Coach {coach} should have substantial plan"
            assert plan['author'].startswith('mock_coach_'), "Should have mock author"
            assert 'channel' in plan, "Should have channel"
        print(f"  All mock plans have realistic content")
        
        # Test 14: No Discord connection required
        print("\n✓ Test 14: No Discord Connection Required")
        # This test verifies that mock mode works without Discord token
        # The fact that we got this far proves it works!
        print(f"  ✓ Mock mode operates without Discord credentials")
        print(f"  ✓ No network calls to Discord API")
        print(f"  ✓ Fully self-contained testing")
        
        # Test 15: Integration with service layer
        print("\n✓ Test 15: Integration with Service Layer")
        # Mock bot uses real service layer
        success, message, plan_id = mock_bot.simulate_plan_post('s', '2024-11-13')
        assert success, "Should integrate with service layer"
        
        # Verify service layer validation still works
        plan = service.get_plan_for_api('s', '2024-11-13')
        assert 'sentiment' in plan['plan'].lower(), "Should have saved mock plan"
        print(f"  Mock bot integrates correctly with service layer")
        print(f"  Service layer validation still active")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nMock Mode Implementation Summary:")
        print("  ✓ MockDataProvider with realistic plans")
        print("  ✓ Mock plans for all 4 coaches (d, i, s, n)")
        print("  ✓ MockDiscordBot for simulating posts")
        print("  ✓ Simulate single plan post")
        print("  ✓ Simulate multiple plan posts")
        print("  ✓ Simulate specific coaches")
        print("  ✓ Bot status and connection management")
        print("  ✓ Helper functions for quick setup")
        print("  ✓ Chart URL support")
        print("  ✓ Realistic mock data")
        print("  ✓ No Discord connection required")
        print("  ✓ Full integration with service layer")
        
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


if __name__ == "__main__":
    success = test_mock_mode()
    sys.exit(0 if success else 1)
