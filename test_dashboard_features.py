#!/usr/bin/env python3
"""
Dashboard Features Test Script

This script tests the dashboard enhancements by:
1. Checking if the C1 API backend is running
2. Checking if the Next.js frontend is running
3. Providing instructions for manual testing
"""

import sys
import time
import subprocess
import requests
from pathlib import Path

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60 + "\n")

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

def check_backend():
    """Check if C1 API backend is running"""
    print_header("Checking C1 API Backend")
    
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print_success("C1 API backend is running on http://localhost:5000")
            return True
        else:
            print_error(f"C1 API backend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("C1 API backend is NOT running")
        print_info("Start it with: python c1_api_server.py")
        return False
    except Exception as e:
        print_error(f"Error checking backend: {e}")
        return False

def check_frontend():
    """Check if Next.js frontend is running"""
    print_header("Checking Next.js Frontend")
    
    try:
        response = requests.get("http://localhost:3000", timeout=5)
        if response.status_code == 200:
            print_success("Next.js frontend is running on http://localhost:3000")
            return True
        else:
            print_error(f"Next.js frontend returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print_error("Next.js frontend is NOT running")
        print_info("Start it with: cd aiapp && npm run dev")
        return False
    except Exception as e:
        print_error(f"Error checking frontend: {e}")
        return False

def check_coach_plans():
    """Check if coach plans API is accessible"""
    print_header("Checking Coach Plans API")
    
    try:
        response = requests.get("http://localhost:5000/api/coach-plans", timeout=5)
        if response.status_code == 200:
            data = response.json()
            plan_count = len(data)
            print_success(f"Coach plans API is working ({plan_count} plans available)")
            
            # Show coach names
            if plan_count > 0:
                coaches = list(data.keys())
                print_info(f"Available coaches: {', '.join(coaches)}")
            
            return True
        else:
            print_error(f"Coach plans API returned status code: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"Error checking coach plans: {e}")
        return False

def print_manual_test_instructions():
    """Print instructions for manual testing"""
    print_header("Manual Testing Instructions")
    
    print("📋 To test the dashboard features manually:\n")
    
    print("1. Open Dashboard:")
    print("   → Navigate to: http://localhost:3000/dashboard\n")
    
    print("2. Test Notifications:")
    print("   → Click the gear icon (⚙️) in the top-right")
    print("   → Grant notification permission if prompted")
    print("   → Click 'Test Notification' button")
    print("   → You should see a test notification\n")
    
    print("3. Test Charts:")
    print("   → Look at the coach plan cards")
    print("   → Charts should generate automatically for plans with tickers")
    print("   → Try plans mentioning: $AAPL, TSLA, MSFT, etc.\n")
    
    print("4. Test Settings:")
    print("   → Open settings panel (gear icon)")
    print("   → Toggle notification settings")
    print("   → Adjust notification interval")
    print("   → Refresh page - settings should persist\n")
    
    print("5. Test Cache:")
    print("   → Generate a chart (e.g., for AAPL)")
    print("   → Open browser DevTools (F12)")
    print("   → Go to Network tab")
    print("   → Refresh the page")
    print("   → Chart should load instantly (no API call = cache hit)\n")
    
    print("6. Interactive Test Suite:")
    print("   → Navigate to: http://localhost:3000/test-dashboard.html")
    print("   → Click 'Run All Tests'")
    print("   → Review test results\n")

def print_browser_console_tests():
    """Print browser console test commands"""
    print_header("Browser Console Tests")
    
    print("Open browser DevTools (F12) and run these commands:\n")
    
    print("1. Check Notification Support:")
    print("   console.log('Notification API:', 'Notification' in window);")
    print("   console.log('Permission:', Notification.permission);\n")
    
    print("2. Check localStorage:")
    print("   console.log('Preferences:', localStorage.getItem('coach-dashboard-notifications'));")
    print("   console.log('Charts:', localStorage.getItem('coach-dashboard-charts'));\n")
    
    print("3. Test Notification:")
    print("   new Notification('Test', { body: 'Testing from console' });\n")
    
    print("4. Check Storage Usage:")
    print("   let size = 0;")
    print("   for (let key in localStorage) {")
    print("     if (localStorage.hasOwnProperty(key)) {")
    print("       size += key.length + (localStorage.getItem(key)?.length || 0);")
    print("     }")
    print("   }")
    print("   console.log('Storage:', (size / 1024).toFixed(2), 'KB');\n")

def print_troubleshooting():
    """Print troubleshooting tips"""
    print_header("Troubleshooting")
    
    print("If you encounter issues:\n")
    
    print("Backend not running:")
    print("  → Open a terminal in the project root")
    print("  → Run: python c1_api_server.py")
    print("  → Wait for 'Running on http://127.0.0.1:5000'\n")
    
    print("Frontend not running:")
    print("  → Open a terminal in the project root")
    print("  → Run: cd aiapp")
    print("  → Run: npm run dev")
    print("  → Wait for 'Ready on http://localhost:3000'\n")
    
    print("Notifications not working:")
    print("  → Check browser permission settings")
    print("  → Try in Chrome or Firefox (best support)")
    print("  → Disable 'Do Not Disturb' mode\n")
    
    print("Charts not generating:")
    print("  → Verify Alpha Vantage MCP is configured")
    print("  → Check browser console for errors")
    print("  → Try clearing cache: localStorage.clear()\n")

def main():
    """Main test function"""
    print_header("Dashboard Features Test Suite")
    print("Testing dashboard enhancements (notifications + charts)\n")
    
    # Check if services are running
    backend_ok = check_backend()
    time.sleep(0.5)
    
    frontend_ok = check_frontend()
    time.sleep(0.5)
    
    # If both are running, check coach plans
    if backend_ok and frontend_ok:
        check_coach_plans()
        time.sleep(0.5)
        
        print_header("✅ All Services Running!")
        print("You can now test the dashboard features.\n")
        
        print_manual_test_instructions()
        print_browser_console_tests()
    else:
        print_header("⚠️  Services Not Running")
        print("Please start the required services:\n")
        
        if not backend_ok:
            print("Terminal 1 - Start Backend:")
            print("  python c1_api_server.py\n")
        
        if not frontend_ok:
            print("Terminal 2 - Start Frontend:")
            print("  cd aiapp")
            print("  npm run dev\n")
        
        print("Then run this script again to verify.\n")
        
        print_troubleshooting()
    
    # Print documentation links
    print_header("Documentation")
    print("📚 Testing Guides:")
    print("  → aiapp/TESTING_VALIDATION_GUIDE.md (comprehensive manual testing)")
    print("  → aiapp/TESTING_QUICK_REFERENCE.md (quick commands)")
    print("  → aiapp/TESTING_COMPLETE.md (summary and results)\n")
    
    print("🧪 Test Files:")
    print("  → aiapp/src/lib/__tests__/notifications.test.ts")
    print("  → aiapp/src/lib/__tests__/chartGenerator.test.ts")
    print("  → aiapp/public/test-dashboard.html (interactive)\n")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)
