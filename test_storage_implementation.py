"""
Test script to verify StorageManager implementation meets all requirements.
"""

import os
import sys
from datetime import datetime
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from tradingagents.integrations.discord_enhanced.storage import StorageManager


def test_storage_manager():
    """Test all StorageManager functionality."""
    
    print("=" * 60)
    print("Testing StorageManager Implementation")
    print("=" * 60)
    
    # Create test database
    test_db_path = "./test_data/test_coach_plans.db"
    os.makedirs("./test_data", exist_ok=True)
    
    # Clean up old test database
    if os.path.exists(test_db_path):
        os.remove(test_db_path)
    
    try:
        # Test 1: Database initialization
        print("\n✓ Test 1: Database Initialization")
        storage = StorageManager(test_db_path)
        print(f"  Database created at: {test_db_path}")
        assert os.path.exists(test_db_path), "Database file should exist"
        
        # Test 2: Save a plan
        print("\n✓ Test 2: Save Plan")
        plan_id = storage.save_plan(
            coach_name="coach_d",
            date="2024-11-09",
            plan="NVDA showing bullish flag pattern. Watch for breakout above $950.",
            author="test_user",
            channel="trading-signals",
            chart_urls=["https://example.com/chart1.png", "https://example.com/chart2.png"]
        )
        print(f"  Plan saved with ID: {plan_id}")
        assert plan_id > 0, "Plan ID should be positive"
        
        # Test 3: Get plan
        print("\n✓ Test 3: Get Plan")
        plan = storage.get_plan("coach_d", "2024-11-09")
        assert plan is not None, "Plan should be retrieved"
        assert plan['coach_name'] == "coach_d", "Coach name should match"
        assert plan['date'] == "2024-11-09", "Date should match"
        assert len(plan['charts']) == 2, "Should have 2 charts"
        print(f"  Retrieved plan: {plan['plan'][:50]}...")
        print(f"  Charts: {len(plan['charts'])}")
        
        # Test 4: Update plan
        print("\n✓ Test 4: Update Plan")
        success = storage.update_plan(
            coach_name="coach_d",
            date="2024-11-09",
            plan="NVDA showing bullish flag pattern. UPDATED: Breakout confirmed!",
            author="test_user"
        )
        assert success, "Update should succeed"
        
        updated_plan = storage.get_plan("coach_d", "2024-11-09")
        assert "UPDATED" in updated_plan['plan'], "Plan should be updated"
        assert updated_plan['edited_at'] is not None, "Should have edited_at timestamp"
        print(f"  Plan updated successfully")
        print(f"  Edited at: {updated_plan['edited_at']}")
        
        # Test 5: Save multiple plans
        print("\n✓ Test 5: Save Multiple Plans")
        storage.save_plan(
            coach_name="coach_i",
            date="2024-11-09",
            plan="NVDA earnings next week. Expect strong data center revenue.",
            author="test_user2",
            chart_urls=["https://example.com/chart3.png"]
        )
        storage.save_plan(
            coach_name="coach_s",
            date="2024-11-09",
            plan="Social media sentiment extremely bullish (8/10).",
            author="test_user3"
        )
        print(f"  Saved plans for coach_i and coach_s")
        
        # Test 6: Get plans by date
        print("\n✓ Test 6: Get Plans by Date")
        all_plans = storage.get_plans_by_date("2024-11-09")
        assert len(all_plans) == 3, "Should have 3 plans for this date"
        assert "coach_d" in all_plans, "Should include coach_d"
        assert "coach_i" in all_plans, "Should include coach_i"
        assert "coach_s" in all_plans, "Should include coach_s"
        print(f"  Retrieved {len(all_plans)} plans for 2024-11-09")
        for coach, plan in all_plans.items():
            print(f"    - {coach}: {plan['plan'][:40]}...")
        
        # Test 7: Delete plan
        print("\n✓ Test 7: Delete Plan")
        success = storage.delete_plan("coach_s", "2024-11-09")
        assert success, "Delete should succeed"
        
        deleted_plan = storage.get_plan("coach_s", "2024-11-09")
        assert deleted_plan is None, "Deleted plan should not be retrieved"
        print(f"  Plan deleted successfully")
        
        # Test 8: Get plan history
        print("\n✓ Test 8: Get Plan History")
        history = storage.get_plan_history("coach_d", "2024-11-09")
        assert len(history) > 0, "Should have edit history"
        print(f"  Found {len(history)} historical version(s)")
        for i, version in enumerate(history, 1):
            print(f"    Version {i}: Edited by {version['edited_by']} at {version['edited_at']}")
        
        # Test 9: Get statistics
        print("\n✓ Test 9: Get Statistics")
        stats = storage.get_stats()
        assert stats['total_plans'] == 2, "Should have 2 active plans (1 deleted)"
        assert stats['total_charts'] == 3, "Should have 3 charts total"
        assert stats['total_edits'] == 1, "Should have 1 edit"
        print(f"  Total plans: {stats['total_plans']}")
        print(f"  Total charts: {stats['total_charts']}")
        print(f"  Total edits: {stats['total_edits']}")
        print(f"  Latest plan: {stats['latest_plan']}")
        
        # Test 10: Connection management
        print("\n✓ Test 10: Connection Management")
        # Test that multiple operations work correctly
        for i in range(5):
            plan = storage.get_plan("coach_d", "2024-11-09")
            assert plan is not None, f"Should retrieve plan on iteration {i+1}"
        print(f"  Successfully handled 5 consecutive operations")
        
        # Test 11: Error handling - non-existent plan
        print("\n✓ Test 11: Error Handling")
        non_existent = storage.get_plan("coach_x", "2024-01-01")
        assert non_existent is None, "Should return None for non-existent plan"
        print(f"  Correctly handled non-existent plan")
        
        # Test 12: Database migration support (schema version)
        print("\n✓ Test 12: Schema Version")
        import sqlite3
        conn = sqlite3.connect(test_db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT version FROM schema_version")
        version = cursor.fetchone()[0]
        conn.close()
        assert version == 1, "Schema version should be 1"
        print(f"  Schema version: {version}")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nStorageManager Implementation Summary:")
        print("  ✓ Database initialization with proper schema")
        print("  ✓ CRUD operations (Create, Read, Update, Delete)")
        print("  ✓ Chart attachment support")
        print("  ✓ Edit history tracking")
        print("  ✓ Connection management")
        print("  ✓ Error handling")
        print("  ✓ Statistics and monitoring")
        print("  ✓ Schema versioning for migrations")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up test database (skip on Windows if file is locked)
        try:
            if os.path.exists(test_db_path):
                os.remove(test_db_path)
            if os.path.exists("./test_data"):
                os.rmdir("./test_data")
        except PermissionError:
            print("\nNote: Test database cleanup skipped (file in use)")
            pass


if __name__ == "__main__":
    success = test_storage_manager()
    sys.exit(0 if success else 1)
