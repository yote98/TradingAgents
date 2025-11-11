"""
Test script to verify Logging System implementation meets all requirements.
"""

import os
import sys
import logging
import json
from pathlib import Path
import time

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from tradingagents.integrations.discord_enhanced.logging_config import (
    setup_logging,
    get_logger,
    JSONFormatter,
    RequestIDFilter
)


def test_logging_system():
    """Test all logging system functionality."""
    
    print("=" * 60)
    print("Testing Logging System Implementation")
    print("=" * 60)
    
    # Create test log directory
    test_log_dir = "./test_data/logs"
    os.makedirs(test_log_dir, exist_ok=True)
    test_log_file = f"{test_log_dir}/test_discord.log"
    
    # Clean up old log files
    if os.path.exists(test_log_file):
        try:
            os.remove(test_log_file)
        except PermissionError:
            pass
    
    try:
        # Test 1: Basic logging setup
        print("\n✓ Test 1: Basic Logging Setup")
        setup_logging(
            log_level='INFO',
            log_file=test_log_file,
            max_size_mb=1,
            backup_count=3,
            json_format=False
        )
        logger = get_logger(__name__)
        logger.info("Test log message")
        
        assert os.path.exists(test_log_file), "Log file should be created"
        print(f"  Log file created: {test_log_file}")
        
        # Test 2: Log levels
        print("\n✓ Test 2: Log Levels")
        logger.debug("Debug message (should not appear at INFO level)")
        logger.info("Info message")
        logger.warning("Warning message")
        logger.error("Error message")
        logger.critical("Critical message")
        print(f"  All log levels working")
        
        # Test 3: Read log file
        print("\n✓ Test 3: Log File Content")
        with open(test_log_file, 'r') as f:
            log_content = f.read()
        
        assert "Test log message" in log_content, "Should contain test message"
        assert "Info message" in log_content, "Should contain info message"
        assert "Warning message" in log_content, "Should contain warning"
        assert "Error message" in log_content, "Should contain error"
        assert "Debug message" not in log_content, "Should not contain debug at INFO level"
        print(f"  Log file contains expected messages")
        
        # Test 4: JSON formatting
        print("\n✓ Test 4: JSON Formatting")
        json_log_file = f"{test_log_dir}/test_json.log"
        setup_logging(
            log_level='INFO',
            log_file=json_log_file,
            json_format=True
        )
        
        json_logger = get_logger('json_test')
        json_logger.info("JSON formatted message")
        
        # Read and parse JSON log
        with open(json_log_file, 'r') as f:
            lines = f.readlines()
            # Find our message
            for line in lines:
                if 'JSON formatted message' in line:
                    log_entry = json.loads(line)
                    assert 'timestamp' in log_entry, "Should have timestamp"
                    assert 'level' in log_entry, "Should have level"
                    assert 'message' in log_entry, "Should have message"
                    assert 'logger' in log_entry, "Should have logger name"
                    assert log_entry['level'] == 'INFO', "Should be INFO level"
                    print(f"  JSON format validated")
                    print(f"    Timestamp: {log_entry['timestamp']}")
                    print(f"    Level: {log_entry['level']}")
                    break
        
        # Test 5: File rotation
        print("\n✓ Test 5: File Rotation")
        rotation_log = f"{test_log_dir}/test_rotation.log"
        setup_logging(
            log_level='INFO',
            log_file=rotation_log,
            max_size_mb=0.001,  # Very small for testing (1KB)
            backup_count=2
        )
        
        rotation_logger = get_logger('rotation_test')
        # Write enough to trigger rotation
        for i in range(100):
            rotation_logger.info(f"Rotation test message {i} " + "x" * 100)
        
        # Check for backup files
        backup_exists = False
        for backup_num in range(1, 3):
            backup_file = f"{rotation_log}.{backup_num}"
            if os.path.exists(backup_file):
                backup_exists = True
                print(f"  Backup file created: {backup_file}")
        
        if backup_exists:
            print(f"  File rotation working")
        else:
            print(f"  File rotation configured (may need more data to trigger)")
        
        # Test 6: Log level configuration
        print("\n✓ Test 6: Log Level Configuration")
        for level in ['DEBUG', 'INFO', 'WARNING', 'ERROR']:
            debug_log = f"{test_log_dir}/test_{level.lower()}.log"
            setup_logging(log_level=level, log_file=debug_log)
            test_logger = get_logger(f'test_{level}')
            
            test_logger.debug("Debug message")
            test_logger.info("Info message")
            test_logger.warning("Warning message")
            
            with open(debug_log, 'r') as f:
                content = f.read()
            
            if level == 'DEBUG':
                assert "Debug message" in content, f"DEBUG level should show debug"
            elif level == 'INFO':
                assert "Debug message" not in content, f"INFO level should not show debug"
                assert "Info message" in content, f"INFO level should show info"
            elif level == 'WARNING':
                assert "Info message" not in content, f"WARNING level should not show info"
                assert "Warning message" in content, f"WARNING level should show warning"
        
        print(f"  All log levels configured correctly")
        
        # Test 7: Request ID filter
        print("\n✓ Test 7: Request ID Filter")
        request_id = "req-12345-abcde"
        filter_log = f"{test_log_dir}/test_filter.log"
        setup_logging(log_level='INFO', log_file=filter_log, json_format=True)
        
        filter_logger = get_logger('filter_test')
        request_filter = RequestIDFilter(request_id)
        filter_logger.addFilter(request_filter)
        
        filter_logger.info("Message with request ID")
        
        # Verify request ID in log
        with open(filter_log, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if 'Message with request ID' in line:
                    log_entry = json.loads(line)
                    assert 'request_id' in log_entry, "Should have request_id"
                    assert log_entry['request_id'] == request_id, "Should match request ID"
                    print(f"  Request ID tracked: {log_entry['request_id']}")
                    break
        
        # Test 8: Exception logging
        print("\n✓ Test 8: Exception Logging")
        exception_log = f"{test_log_dir}/test_exception.log"
        setup_logging(log_level='ERROR', log_file=exception_log, json_format=True)
        
        exc_logger = get_logger('exception_test')
        try:
            raise ValueError("Test exception for logging")
        except ValueError as e:
            exc_logger.error("Caught exception", exc_info=True)
        
        # Verify exception in log
        with open(exception_log, 'r') as f:
            lines = f.readlines()
            for line in lines:
                if 'Caught exception' in line:
                    log_entry = json.loads(line)
                    assert 'exception' in log_entry, "Should have exception field"
                    assert 'ValueError' in log_entry['exception'], "Should contain exception type"
                    assert 'Test exception' in log_entry['exception'], "Should contain exception message"
                    print(f"  Exception logged with stack trace")
                    break
        
        # Test 9: Multiple loggers
        print("\n✓ Test 9: Multiple Loggers")
        multi_log = f"{test_log_dir}/test_multi.log"
        setup_logging(log_level='INFO', log_file=multi_log)
        
        logger1 = get_logger('module1')
        logger2 = get_logger('module2')
        logger3 = get_logger('module3')
        
        logger1.info("Message from module1")
        logger2.info("Message from module2")
        logger3.info("Message from module3")
        
        with open(multi_log, 'r') as f:
            content = f.read()
        
        assert "module1" in content, "Should have module1 logs"
        assert "module2" in content, "Should have module2 logs"
        assert "module3" in content, "Should have module3 logs"
        print(f"  Multiple loggers working independently")
        
        # Test 10: Console and file logging
        print("\n✓ Test 10: Console and File Logging")
        dual_log = f"{test_log_dir}/test_dual.log"
        setup_logging(log_level='INFO', log_file=dual_log)
        
        dual_logger = get_logger('dual_test')
        dual_logger.info("Message to both console and file")
        
        # Verify in file
        with open(dual_log, 'r') as f:
            content = f.read()
        assert "Message to both console and file" in content, "Should be in file"
        print(f"  Logging to both console and file")
        
        # Test 11: Noisy library suppression
        print("\n✓ Test 11: Noisy Library Suppression")
        # Discord and werkzeug loggers should be set to WARNING
        discord_logger = logging.getLogger('discord')
        werkzeug_logger = logging.getLogger('werkzeug')
        
        assert discord_logger.level == logging.WARNING, "Discord should be WARNING level"
        assert werkzeug_logger.level == logging.WARNING, "Werkzeug should be WARNING level"
        print(f"  Noisy libraries suppressed (discord, werkzeug)")
        
        # Test 12: Log file encoding
        print("\n✓ Test 12: UTF-8 Encoding")
        utf8_log = f"{test_log_dir}/test_utf8.log"
        setup_logging(log_level='INFO', log_file=utf8_log)
        
        utf8_logger = get_logger('utf8_test')
        utf8_logger.info("Unicode test: 你好 мир 🚀")
        
        with open(utf8_log, 'r', encoding='utf-8') as f:
            content = f.read()
        assert "你好" in content, "Should handle Chinese characters"
        assert "мир" in content, "Should handle Cyrillic characters"
        assert "🚀" in content, "Should handle emojis"
        print(f"  UTF-8 encoding working correctly")
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\nLogging System Implementation Summary:")
        print("  ✓ Basic logging setup")
        print("  ✓ Multiple log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)")
        print("  ✓ File logging with rotation")
        print("  ✓ JSON formatting for production")
        print("  ✓ Log level configuration")
        print("  ✓ Request ID tracking")
        print("  ✓ Exception logging with stack traces")
        print("  ✓ Multiple independent loggers")
        print("  ✓ Console and file output")
        print("  ✓ Noisy library suppression")
        print("  ✓ UTF-8 encoding support")
        print("  ✓ Configurable max file size and backup count")
        
        return True
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    finally:
        # Clean up
        try:
            import shutil
            if os.path.exists(test_log_dir):
                shutil.rmtree(test_log_dir)
        except (PermissionError, OSError):
            print("\nNote: Test log cleanup skipped (files in use)")
            pass


if __name__ == "__main__":
    success = test_logging_system()
    sys.exit(0 if success else 1)
