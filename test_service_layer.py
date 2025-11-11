"""
Test script to verify PlanService implementation meets all requirements.
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from tradingagents.integrations.discord_enhanced.storage import StorageManager
from tradingagents.integrations.discord_enhanced.service import PlanService


class MockAttachment:
    """Mock Discord attachment for testing."""
    def __init__(self, url: str, filename: str):
        self.url = url
        self.filename = filename


def test_plan_service():
    """Test all PlanService functionality."""
    
    print("=" * 60)
    print("Testing PlanService Implementation")
    print("=" * 60)
    
    # Create test database
    test_db_path = "./test_data/test_service.db"
    os.makedirs("./test_data", exist_ok=True)
    
    # Clean up old test database
    if os.path.exists(test_db_path):
        try:
            os.remove(test_db_path)
        except PermissionError:
            pass
    
    try:
        # Initialize storage and service
        print("\n✓ Test 1: Service Initialization")
        storage = StorageManager(test_db_path)
        service = PlanService(storage)
        print(f"  Service initialized with storage")
        
        # Test 2: Validate coach names
        print("\n✓ Test 2: Coach Name Validation")
        valid_coaches = ['d', 'i', 's', 'n', 'D', 'I', 'S', 'N']
        for coach in valid_coaches:
            is_valid, error = service.validate_coach_name(coach)
            assert is_valid, f"Coach {coach} should be valid"
        print(f"  Valid coaches accepted: {', '.join(valid_coaches)}")
        
        invalid_coaches = ['x', 'coach_d', '1', '', 'abc']
        for coach in invalid_coaches:
            is_valid, error = service.validate_coach_name(coach)
            assert not is_valid, f"Coach {coach} should be invalid"
            assert error is not None, "Should have error message"
        print(f"  Invalid coaches rejected: {', '.join(invalid_coaches)}")
        
        # Test 3: Extract chart URLs
        print("\n✓ Test 3: Chart URL Extraction")
        attachments = [
            MockAttachment("https://example.com/chart1.png", "chart1.png"),
            MockAttachment("https://example.com/chart2.jpg", "chart2.jpg"),
            MockAttachment("https://example.com/doc.pdf", "doc.pdf"),  # Should be ignored
            MockAttachment("https://example.com/chart3.gif", "chart3.gif"),
        ]
        chart_urls = service.extract_chart_urls(attachments)
        assert len(chart_urls) == 3, "Should extract 3 image URLs"
        assert "chart1.png" in chart_urls[0], "Should include PNG"
        assert "chart2.jpg" in chart_urls[1], "Should include JPG"
        assert "chart3.gif" in chart_urls[2], "Should include GIF"
        print(f"  Extracted {len(chart_urls)} chart URLs from {len(attachments)} attachments")
        
        # Test 4: Process plan message
        print("\n✓ Test 4: Process Plan Message")
        success, message, plan_id = service.process_plan_message(
            coach_name="d",
            plan_text="NVDA showing bullish flag pattern. Watch for breakout above $950.",
            author="test_user",
            date="2024-11-09",
            channel="trading-signals",
            attachments=attachments
        )
        assert success, f"Should succeed: {message}"
        assert plan_id is not None, "Should return plan ID"
        assert "✅" in message, "Success message should have checkmark"
        print(f"  Plan processed successfully: ID={plan_id}")
        print(f"  Message: {message[:80]}...")
        
        # Test 5: Process plan with invalid coach
        print("\n✓ Test 5: Invalid Coach Name Handling")
        success, message, plan_id = service.process_plan_message(
            coach_name="x",
            plan_text="Test plan",
            author="test_user"
        )
        assert not success, "Should fail with invalid coach"
        assert "Invalid coach name" in message, "Should have error message"
        print(f"  Correctly rejected invalid coach: {message}")
        
        # Test 6: Process plan with empty text
        print("\n✓ Test 6: Empty Plan Text Handling")
        success, message, plan_id = service.process_plan_message(
            coach_name="d",
            plan_text="",
            author="test_user"
        )
        assert not success, "Should fail with empty text"
        assert "empty" in message.lower(), "Should mention empty text"
        print(f"  Correctly rejected empty plan: {message}")
        
        # Test 7: Get plan for API
        print("\n✓ Test 7: Get Plan for API")
        plan_data = service.get_plan_for_api("d", "2024-11-09")
        assert 'plan' in plan_data, "Should have plan field"
        assert 'charts' in plan_data, "Should have charts field"
        assert len(plan_data['charts']) == 3, "Should have 3 charts"
        assert plan_data['author'] == "test_user", "Should have author"
        print(f"  Retrieved plan for API: {plan_data['plan'][:50]}...")
        print(f"  Charts: {len(plan_data['charts'])}")
        
        # Test 8: Get non-existent plan
        print("\n✓ Test 8: Non-existent Plan Handling")
        plan_data = service.get_plan_for_api("i", "2024-01-01")
        assert 'plan' in plan_data, "Should have plan field"
        assert "No plan available" in plan_data['plan'], "Should indicate no plan"
        print(f"  Correctly handled non-existent plan")
        
        # Test 9: Edit plan (authorized)
        print("\n✓ Test 9: Edit Plan (Authorized)")
        success, message = service.edit_plan(
            coach_name="d",
            date="2024-11-09",
            new_plan_text="NVDA showing bullish flag pattern. UPDATED: Breakout confirmed!",
            author="test_user"
        )
        assert success, f"Should succeed: {message}"
        assert "✅" in message, "Success message should have checkmark"
        print(f"  Plan edited successfully: {message}")
        
        # Verify edit
        plan_data = service.get_plan_for_api("d", "2024-11-09")
        assert "UPDATED" in plan_data['plan'], "Plan should be updated"
        print(f"  Verified edit: {plan_data['plan'][:60]}...")
        
        # Test 10: Edit plan (unauthorized)
        print("\n✓ Test 10: Edit Plan (Unauthorized)")
        success, message = service.edit_plan(
            coach_name="d",
            date="2024-11-09",
            new_plan_text="Trying to edit someone else's plan",
            author="different_user"
        )
        assert not success, "Should fail with different author"
        assert "Authorization failed" in message, "Should mention authorization"
        print(f"  Correctly rejected unauthorized edit: {message}")
        
        # Test 11: Delete plan (unauthorized)
        print("\n✓ Test 11: Delete Plan (Unauthorized)")
        success, message = service.delete_plan(
            coach_name="d",
            date="2024-11-09",
            author="different_user"
        )
        assert not success, "Should fail with different author"
        assert "Authorization failed" in message, "Should mention authorization"
        print(f"  Correctly rejected unauthorized delete: {message}")
        
        # Test 12: Add more plans for testing get_all
        print("\n✓ Test 12: Multiple Plans")
        service.process_plan_message(
            coach_name="i",
            plan_text="NVDA earnings next week. Expect strong data center revenue.",
            author="test_user2",
            date="2024-11-09"
        )
        service.process_plan_message(
            coach_name="s",
            plan_text="Social media sentiment extremely bullish (8/10).",
            author="test_user3",
            date="2024-11-09"
        )
        print(f"  Added plans for coach_i and coach_s")
        
        # Test 13: Get all plans for API
        print("\n✓ Test 13: Get All Plans for API")
        all_plans = service.get_all_plans_for_api("2024-11-09")
        assert len(all_plans) == 3, "Should have 3 plans"
        assert "coach_d" in all_plans, "Should include coach_d"
        assert "coach_i" in all_plans, "Should include coach_i"
        assert "coach_s" in all_plans, "Should include coach_s"
        print(f"  Retrieved {len(all_plans)} plans for 2024-11-09")
        for coach, plan in all_plans.items():
            print(f"    - {coach}: {plan['plan'][:40]}...")
        
        # Test 14: Delete plan (authorized)
        print("\n✓ Test 14: Delete Plan (Authorized)")
        success, message = service.delete_plan(
            coach_name="s",
            date="2024-11-09",
            author="test_user3"
        )
        assert success, f"Should succeed: {message}"
        assert "✅" in message, "Success message should have checkmark"
        print(f"  Plan deleted successfully: {message}")
        
        # Verify deletion
        plan_data = service.get_plan_for_api("s", "2024-11-09")
        assert "No plan available" in plan_data['plan'], "Plan should be deleted"
        print(f"  Verified deletion")
        
        # Test 15: Get plan history
        print("\n✓ Test 15: Get Plan History")
        success, history = service.get_plan_history("d", "2024-11-09")
        assert success, "Should succeed"
        assert len(history) > 0, "Should have history"
        print(f"  Retrieved {len(history)} historical version(s)")
        
        # Test 16: Date format validation
        print("\n✓ Test 16: Date Format Validation")
        success, message, plan_id = service.process_plan_message(
            coach_name="d",
            plan_text="Test plan",
            author="test_user",
            date="invalid-date"
        )
        assert not success, "Should fail with invalid date"
        assert "Invalid date format" in message, "Should mention date format"
        print(f"  Correctly rejected invalid date format")
        
        # Test 17: Default date (today)
        print("\n✓ Test 17: Default Date (Today)")
        today = datetime.now().strftime('%Y-%m-%d')
        success, message, plan_id = service.process_plan_message(
            coach_name="n",
            plan_text="Fed meeting this week. Watch for hawkish/dovish signals.",
            author="test_user4"
            # No date provided - should use today
        )
        assert success, f"Should succeed: {message}"
        
        # Verify it used today's date
        plan_data = service.get_plan_for_api("n", today)
        assert "Fed meeting" in plan_data['plan'], "Should find plan with today's date"
        print(f"  Correctly used today's date: {today}")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nPlanService Implementation Summary:")
        print("  ✓ Coach name validation (d, i, s, n)")
        print("  ✓ Chart URL extraction from attachments")
        print("  ✓ Plan message processing with validation")
        print("  ✓ Edit authorization (only original author)")
        print("  ✓ Delete authorization (only original author)")
        print("  ✓ API response formatting")
        print("  ✓ Error handling and logging")
        print("  ✓ Date format validation")
        print("  ✓ Default date handling")
        print("  ✓ Plan history retrieval")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up test database
        try:
            if os.path.exists(test_db_path):
                os.remove(test_db_path)
            if os.path.exists("./test_data") and not os.listdir("./test_data"):
                os.rmdir("./test_data")
        except (PermissionError, OSError):
            print("\nNote: Test database cleanup skipped (file in use)")
            pass


if __name__ == "__main__":
    success = test_plan_service()
    sys.exit(0 if success else 1)
