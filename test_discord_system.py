"""
Discord System Diagnostic and Test Script

Automatically tests all components of the Discord integration system
and provides detailed diagnostics.
"""

import os
import sys
import time
import requests
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))


class Colors:
    """ANSI color codes for terminal output."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(text):
    """Print a formatted header."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'=' * 60}{Colors.RESET}\n")


def print_success(text):
    """Print success message."""
    print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")


def print_error(text):
    """Print error message."""
    print(f"{Colors.RED}✗ {text}{Colors.RESET}")


def print_warning(text):
    """Print warning message."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.RESET}")


def print_info(text):
    """Print info message."""
    print(f"  {text}")


def test_dependencies():
    """Test if required dependencies are installed."""
    print_header("1. Testing Dependencies")
    
    dependencies = {
        'discord': 'discord.py',
        'flask': 'flask',
        'flask_cors': 'flask-cors',
        'requests': 'requests'
    }
    
    all_ok = True
    for module, package in dependencies.items():
        try:
            __import__(module)
            print_success(f"{package} is installed")
        except ImportError:
            print_error(f"{package} is NOT installed")
            print_info(f"Install with: pip install {package}")
            all_ok = False
    
    return all_ok


def test_configuration():
    """Test configuration setup."""
    print_header("2. Testing Configuration")
    
    all_ok = True
    
    # Check for Discord bot token
    token = os.getenv('DISCORD_BOT_TOKEN')
    if token:
        masked_token = f"{token[:8]}...{token[-4:]}" if len(token) > 12 else "***"
        print_success(f"DISCORD_BOT_TOKEN is set: {masked_token}")
    else:
        print_warning("DISCORD_BOT_TOKEN is not set")
        print_info("Set with: $env:DISCORD_BOT_TOKEN='your_token' (Windows)")
        print_info("Or enable mock mode: $env:MOCK_MODE='true'")
        all_ok = False
    
    # Check mock mode
    mock_mode = os.getenv('MOCK_MODE', 'false').lower() in ('true', '1', 'yes')
    if mock_mode:
        print_info("Mock mode is ENABLED (Discord not required)")
        all_ok = True  # Mock mode overrides token requirement
    
    # Check optional config
    db_path = os.getenv('DATABASE_PATH', './data/coach_plans.db')
    print_info(f"Database path: {db_path}")
    
    api_port = os.getenv('API_PORT', '5000')
    print_info(f"API port: {api_port}")
    
    return all_ok


def test_imports():
    """Test if enhanced Discord modules can be imported."""
    print_header("3. Testing Module Imports")
    
    modules = [
        'tradingagents.integrations.discord_enhanced.config',
        'tradingagents.integrations.discord_enhanced.storage',
        'tradingagents.integrations.discord_enhanced.service',
        'tradingagents.integrations.discord_enhanced.bot',
        'tradingagents.integrations.discord_enhanced.api',
        'tradingagents.integrations.discord_enhanced.client',
    ]
    
    all_ok = True
    for module in modules:
        try:
            __import__(module)
            module_name = module.split('.')[-1]
            print_success(f"{module_name}.py imports successfully")
        except Exception as e:
            print_error(f"Failed to import {module}")
            print_info(f"Error: {e}")
            all_ok = False
    
    return all_ok


def test_database():
    """Test database initialization."""
    print_header("4. Testing Database")
    
    try:
        from tradingagents.integrations.discord_enhanced import StorageManager
        
        # Use test database
        test_db = './test_data/diagnostic_test.db'
        
        # Clean up if exists
        if os.path.exists(test_db):
            os.remove(test_db)
        
        # Initialize storage
        storage = StorageManager(test_db)
        print_success("Database initialized successfully")
        
        # Test save operation
        plan_id = storage.save_plan(
            coach_name='coach_d',
            date='2024-01-15',
            plan='Test plan',
            author='TestUser',
            chart_urls=['https://example.com/chart.png']
        )
        print_success(f"Test plan saved (ID: {plan_id})")
        
        # Test retrieve operation
        plan = storage.get_plan('coach_d', '2024-01-15')
        if plan and plan['plan'] == 'Test plan':
            print_success("Test plan retrieved successfully")
        else:
            print_error("Failed to retrieve test plan")
            return False
        
        # Test stats
        stats = storage.get_stats()
        print_info(f"Database stats: {stats['total_plans']} plans, {stats['total_charts']} charts")
        
        # Cleanup
        if os.path.exists(test_db):
            os.remove(test_db)
        test_dir = Path(test_db).parent
        if test_dir.exists() and not any(test_dir.iterdir()):
            test_dir.rmdir()
        
        return True
        
    except Exception as e:
        print_error(f"Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_service_layer():
    """Test service layer."""
    print_header("5. Testing Service Layer")
    
    try:
        from tradingagents.integrations.discord_enhanced import StorageManager, PlanService
        
        # Use test database
        test_db = './test_data/service_test.db'
        if os.path.exists(test_db):
            os.remove(test_db)
        
        storage = StorageManager(test_db)
        service = PlanService(storage)
        print_success("Service layer initialized")
        
        # Test validation
        is_valid, error = service.validate_coach_name('d')
        if is_valid:
            print_success("Coach name validation works")
        else:
            print_error(f"Validation failed: {error}")
            return False
        
        # Test invalid coach
        is_valid, error = service.validate_coach_name('invalid')
        if not is_valid:
            print_success("Invalid coach name rejected correctly")
        else:
            print_error("Invalid coach name was accepted")
            return False
        
        # Test process plan
        success, message, plan_id = service.process_plan_message(
            coach_name='d',
            plan_text='Test plan',
            author='TestUser',
            date='2024-01-15'
        )
        if success:
            print_success(f"Plan processing works (ID: {plan_id})")
        else:
            print_error(f"Plan processing failed: {message}")
            return False
        
        # Cleanup
        if os.path.exists(test_db):
            os.remove(test_db)
        test_dir = Path(test_db).parent
        if test_dir.exists() and not any(test_dir.iterdir()):
            test_dir.rmdir()
        
        return True
        
    except Exception as e:
        print_error(f"Service layer test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_api_server():
    """Test if API server is running."""
    print_header("6. Testing API Server")
    
    api_port = os.getenv('API_PORT', '5000')
    base_url = f"http://localhost:{api_port}"
    
    print_info(f"Checking API at {base_url}")
    print_info("(Make sure the server is running in another terminal)")
    
    try:
        # Test health endpoint
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success(f"Health check: {data.get('status', 'unknown')}")
            
            if 'components' in data:
                db_status = data['components']['database']['status']
                bot_status = data['components']['discord_bot']['status']
                print_info(f"Database: {db_status}")
                print_info(f"Discord bot: {bot_status}")
        else:
            print_error(f"Health check failed: HTTP {response.status_code}")
            return False
        
        # Test metrics endpoint
        response = requests.get(f"{base_url}/metrics", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print_success("Metrics endpoint works")
            print_info(f"Total requests: {data['requests']['total']}")
        else:
            print_warning(f"Metrics endpoint returned: HTTP {response.status_code}")
        
        # Test API endpoint
        response = requests.get(f"{base_url}/api/coach-plans/?coach=d", timeout=5)
        if response.status_code == 200:
            print_success("Coach plans endpoint works")
        else:
            print_warning(f"Coach plans endpoint returned: HTTP {response.status_code}")
        
        return True
        
    except requests.ConnectionError:
        print_error("Cannot connect to API server")
        print_info("Start the server with: python examples/discord_bot_server_enhanced.py")
        return False
    except Exception as e:
        print_error(f"API test failed: {e}")
        return False


def test_webhook_client():
    """Test enhanced webhook client."""
    print_header("7. Testing Webhook Client")
    
    try:
        from tradingagents.integrations.discord_enhanced import create_client
        
        api_port = os.getenv('API_PORT', '5000')
        client = create_client(f"http://localhost:{api_port}")
        print_success("Webhook client created")
        
        # Test health check
        try:
            health = client.check_health()
            if health.get('status') == 'healthy':
                print_success("Client health check works")
            else:
                print_warning(f"Server status: {health.get('status', 'unknown')}")
        except Exception as e:
            print_warning(f"Health check failed (server may not be running): {e}")
        
        # Test metrics
        metrics = client.get_metrics()
        print_success("Client metrics work")
        print_info(f"Cache size: {metrics['cache']['size']}/{metrics['cache']['max_size']}")
        
        return True
        
    except Exception as e:
        print_error(f"Webhook client test failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_file_structure():
    """Test if all required files exist."""
    print_header("8. Testing File Structure")
    
    required_files = [
        'tradingagents/integrations/discord_enhanced/__init__.py',
        'tradingagents/integrations/discord_enhanced/config.py',
        'tradingagents/integrations/discord_enhanced/storage.py',
        'tradingagents/integrations/discord_enhanced/service.py',
        'tradingagents/integrations/discord_enhanced/bot.py',
        'tradingagents/integrations/discord_enhanced/api.py',
        'tradingagents/integrations/discord_enhanced/client.py',
        'tradingagents/integrations/discord_enhanced/logging_config.py',
        'examples/discord_bot_server_enhanced.py',
        'config.example.yaml',
        '.env.example',
    ]
    
    all_ok = True
    for file_path in required_files:
        if os.path.exists(file_path):
            print_success(f"{file_path}")
        else:
            print_error(f"{file_path} is MISSING")
            all_ok = False
    
    return all_ok


def print_summary(results):
    """Print test summary."""
    print_header("Test Summary")
    
    total = len(results)
    passed = sum(1 for r in results.values() if r)
    failed = total - passed
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print(f"\n{Colors.BOLD}Results: {passed}/{total} tests passed{Colors.RESET}")
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 All tests passed! System is ready to use.{Colors.RESET}\n")
        print("Next steps:")
        print("1. Start the server: python examples/discord_bot_server_enhanced.py")
        print("2. Test Discord commands in your server")
        print("3. See DISCORD_SETUP_AND_TEST.md for detailed testing guide")
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠ {failed} test(s) failed. Please fix the issues above.{Colors.RESET}\n")
        print("Common fixes:")
        print("- Install missing dependencies: pip install discord.py flask flask-cors")
        print("- Set Discord bot token: $env:DISCORD_BOT_TOKEN='your_token'")
        print("- Or enable mock mode: $env:MOCK_MODE='true'")
        print("- Start the API server in another terminal")


def main():
    """Run all diagnostic tests."""
    print(f"\n{Colors.BOLD}Discord System Diagnostic Tool{Colors.RESET}")
    print(f"Testing all components...\n")
    
    results = {}
    
    # Run tests
    results['Dependencies'] = test_dependencies()
    results['Configuration'] = test_configuration()
    results['Module Imports'] = test_imports()
    results['Database'] = test_database()
    results['Service Layer'] = test_service_layer()
    results['API Server'] = test_api_server()
    results['Webhook Client'] = test_webhook_client()
    results['File Structure'] = test_file_structure()
    
    # Print summary
    print_summary(results)
    
    # Return exit code
    return 0 if all(results.values()) else 1


if __name__ == '__main__':
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Test interrupted by user{Colors.RESET}")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Unexpected error: {e}{Colors.RESET}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
