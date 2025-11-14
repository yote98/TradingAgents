"""
PRE-DEPLOYMENT VALIDATION SUITE
Complete system check before deployment
"""
import os
import sys
import json
from datetime import datetime
import subprocess

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.END}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.END}")

def print_error(text):
    print(f"{Colors.RED}❌ {text}{Colors.END}")

def print_warning(text):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.END}")

def print_info(text):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.END}")

# Test results tracker
test_results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def test_1_environment_variables():
    """Test 1: Check all required environment variables"""
    print_header("TEST 1: Environment Variables")
    
    required_vars = {
        "OPENAI_API_KEY": "OpenAI API access",
        "ALPHA_VANTAGE_API_KEY": "Market data access"
    }
    
    optional_vars = {
        "THESYS_API_KEY": "C1 Chat access",
        "TWITTER_BEARER_TOKEN": "Twitter sentiment",
        "DISCORD_WEBHOOK_URL": "Coach integration"
    }
    
    all_ok = True
    
    # Check required
    for var, purpose in required_vars.items():
        value = os.getenv(var)
        if value:
            print_success(f"{var} is set ({purpose})")
            print_info(f"   Value: {value[:10]}...{value[-4:]}")
        else:
            print_error(f"{var} is MISSING ({purpose})")
            all_ok = False
    
    # Check optional
    for var, purpose in optional_vars.items():
        value = os.getenv(var)
        if value:
            print_success(f"{var} is set ({purpose})")
        else:
            print_warning(f"{var} not set ({purpose}) - Optional")
    
    if all_ok:
        test_results["passed"].append("Environment Variables")
        return True
    else:
        test_results["failed"].append("Environment Variables")
        return False

def test_2_python_dependencies():
    """Test 2: Check Python dependencies"""
    print_header("TEST 2: Python Dependencies")
    
    required_packages = [
        "yfinance",
        "langchain",
        "langchain_openai",
        "langgraph",
        "pandas",
        "requests"
    ]
    
    all_ok = True
    
    for package in required_packages:
        try:
            __import__(package)
            print_success(f"{package} is installed")
        except ImportError:
            print_error(f"{package} is MISSING")
            all_ok = False
    
    if all_ok:
        test_results["passed"].append("Python Dependencies")
        return True
    else:
        test_results["failed"].append("Python Dependencies")
        print_error("\nRun: pip install -r requirements.txt")
        return False

def test_3_live_data_access():
    """Test 3: Verify live data access"""
    print_header("TEST 3: Live Data Access")
    
    try:
        import yfinance as yf
        from datetime import datetime
        
        # Test Bitcoin
        print_info("Fetching Bitcoin price...")
        btc = yf.Ticker("BTC-USD")
        price = btc.info.get('regularMarketPrice')
        
        if price and price > 50000:  # Sanity check
            print_success(f"Bitcoin: ${price:,.2f}")
            print_info(f"   Timestamp: {datetime.now()}")
            print_info(f"   Source: yfinance (Yahoo Finance)")
            
            # Test a stock
            print_info("\nFetching Apple stock price...")
            aapl = yf.Ticker("AAPL")
            aapl_price = aapl.info.get('regularMarketPrice')
            
            if aapl_price:
                print_success(f"Apple: ${aapl_price:.2f}")
                test_results["passed"].append("Live Data Access")
                return True
            else:
                print_error("Could not fetch Apple price")
                test_results["failed"].append("Live Data Access")
                return False
        else:
            print_error(f"Bitcoin price seems wrong: ${price}")
            test_results["failed"].append("Live Data Access")
            return False
            
    except Exception as e:
        print_error(f"Error: {e}")
        test_results["failed"].append("Live Data Access")
        return False

def test_4_tradingagents_core():
    """Test 4: TradingAgents core functionality"""
    print_header("TEST 4: TradingAgents Core")
    
    try:
        from tradingagents.graph.trading_graph import TradingAgentsGraph
        from tradingagents.default_config import DEFAULT_CONFIG
        
        print_success("TradingAgents imports successful")
        
        # Test configuration
        config = DEFAULT_CONFIG.copy()
        config["deep_think_llm"] = "gpt-4o-mini"
        config["quick_think_llm"] = "gpt-4o-mini"
        config["max_debate_rounds"] = 1
        
        print_success("Configuration loaded")
        print_info(f"   Deep Think LLM: {config['deep_think_llm']}")
        print_info(f"   Quick Think LLM: {config['quick_think_llm']}")
        print_info(f"   Max Debate Rounds: {config['max_debate_rounds']}")
        
        # Test initialization (don't run full analysis)
        print_info("\nInitializing TradingAgentsGraph...")
        graph = TradingAgentsGraph(
            selected_analysts=["market"],
            debug=False,
            config=config
        )
        print_success("TradingAgentsGraph initialized successfully")
        
        test_results["passed"].append("TradingAgents Core")
        return True
        
    except Exception as e:
        print_error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        test_results["failed"].append("TradingAgents Core")
        return False

def test_5_mcp_server():
    """Test 5: MCP Server availability"""
    print_header("TEST 5: MCP Server")
    
    try:
        import mcp_server
        from mcp_server.adapters.tradingagents import TradingAgentsAdapter
        
        print_success("MCP Server module found")
        
        # Check MCP configuration
        mcp_config_path = r"C:\Users\CVN B850I GAMING\.kiro\settings\mcp.json"
        
        if os.path.exists(mcp_config_path):
            print_success("MCP configuration file exists")
            
            # Try to read it with PowerShell
            result = subprocess.run(
                ["powershell", "-Command", f"Get-Content '{mcp_config_path}' -Raw | ConvertFrom-Json | ConvertTo-Json -Depth 10"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                config = json.loads(result.stdout)
                if 'tradingagents' in config.get('mcpServers', {}):
                    ta_config = config['mcpServers']['tradingagents']
                    print_success("TradingAgents MCP server configured")
                    print_info(f"   Command: {ta_config.get('command')}")
                    print_info(f"   Disabled: {ta_config.get('disabled', False)}")
                    
                    if ta_config.get('disabled', False):
                        print_error("MCP server is DISABLED!")
                        test_results["failed"].append("MCP Server")
                        return False
                    else:
                        test_results["passed"].append("MCP Server")
                        return True
                else:
                    print_error("TradingAgents not in MCP config")
                    test_results["failed"].append("MCP Server")
                    return False
            else:
                print_warning("Could not parse MCP config")
                test_results["warnings"].append("MCP Server - Config parse failed")
                return True
        else:
            print_error("MCP configuration file not found")
            test_results["failed"].append("MCP Server")
            return False
            
    except Exception as e:
        print_error(f"Error: {e}")
        test_results["failed"].append("MCP Server")
        return False

def test_6_data_accuracy():
    """Test 6: Verify data accuracy (no synthetic data)"""
    print_header("TEST 6: Data Accuracy Verification")
    
    try:
        from tradingagents.dataflows.interface import route_to_vendor
        from datetime import datetime, timedelta
        import yfinance as yf
        
        # Get price from TradingAgents
        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        
        print_info("Fetching AAPL from TradingAgents...")
        ta_result = route_to_vendor("get_stock_data", "AAPL", start_date, end_date)
        
        # Extract price from result
        ta_price = None
        if ta_result:
            lines = ta_result.split('\n')
            for line in reversed(lines):
                if line.startswith('2025-'):
                    parts = line.split(',')
                    if len(parts) >= 5:
                        ta_price = float(parts[4])
                        break
        
        # Get price from yfinance directly
        print_info("Fetching AAPL from yfinance directly...")
        aapl = yf.Ticker("AAPL")
        yf_price = aapl.info.get('regularMarketPrice')
        
        if ta_price and yf_price:
            print_success(f"TradingAgents price: ${ta_price:.2f}")
            print_success(f"yfinance price: ${yf_price:.2f}")
            
            # Check if prices match (within 5% tolerance for timing differences)
            diff_pct = abs(ta_price - yf_price) / yf_price * 100
            
            if diff_pct < 5:
                print_success(f"Prices match within {diff_pct:.2f}% tolerance ✅")
                test_results["passed"].append("Data Accuracy")
                return True
            else:
                print_error(f"Prices differ by {diff_pct:.2f}% - TOO MUCH!")
                test_results["failed"].append("Data Accuracy")
                return False
        else:
            print_error("Could not fetch prices for comparison")
            test_results["failed"].append("Data Accuracy")
            return False
            
    except Exception as e:
        print_error(f"Error: {e}")
        import traceback
        traceback.print_exc()
        test_results["failed"].append("Data Accuracy")
        return False

def test_7_dashboard_files():
    """Test 7: Check dashboard files exist"""
    print_header("TEST 7: Dashboard Files")
    
    required_files = [
        "aiapp/package.json",
        "aiapp/src/app/page.tsx",
        "aiapp/src/app/dashboard/page.tsx",
        "aiapp/src/components/DashboardLayout.tsx",
        "aiapp/src/app/api/chat/route.ts"
    ]
    
    all_ok = True
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print_success(f"{file_path} exists")
        else:
            print_error(f"{file_path} MISSING")
            all_ok = False
    
    if all_ok:
        test_results["passed"].append("Dashboard Files")
        return True
    else:
        test_results["failed"].append("Dashboard Files")
        return False

def test_8_api_configuration():
    """Test 8: Check API configuration"""
    print_header("TEST 8: API Configuration")
    
    # Check if OpenAI API key works
    try:
        from openai import OpenAI
        
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            print_error("OPENAI_API_KEY not set")
            test_results["failed"].append("API Configuration")
            return False
        
        print_info("Testing OpenAI API connection...")
        client = OpenAI(api_key=api_key)
        
        # Simple test call
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": "Say 'API works'"}],
            max_tokens=10
        )
        
        if response.choices[0].message.content:
            print_success("OpenAI API is working")
            print_info(f"   Response: {response.choices[0].message.content}")
            test_results["passed"].append("API Configuration")
            return True
        else:
            print_error("OpenAI API returned empty response")
            test_results["failed"].append("API Configuration")
            return False
            
    except Exception as e:
        print_error(f"OpenAI API Error: {e}")
        test_results["failed"].append("API Configuration")
        return False

def generate_report():
    """Generate final test report"""
    print_header("VALIDATION REPORT")
    
    total_tests = len(test_results["passed"]) + len(test_results["failed"]) + len(test_results["warnings"])
    passed = len(test_results["passed"])
    failed = len(test_results["failed"])
    warnings = len(test_results["warnings"])
    
    print(f"\n{Colors.BOLD}Total Tests: {total_tests}{Colors.END}")
    print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
    print(f"{Colors.RED}Failed: {failed}{Colors.END}")
    print(f"{Colors.YELLOW}Warnings: {warnings}{Colors.END}")
    
    if test_results["passed"]:
        print(f"\n{Colors.GREEN}{Colors.BOLD}✅ PASSED TESTS:{Colors.END}")
        for test in test_results["passed"]:
            print(f"   {Colors.GREEN}✓{Colors.END} {test}")
    
    if test_results["failed"]:
        print(f"\n{Colors.RED}{Colors.BOLD}❌ FAILED TESTS:{Colors.END}")
        for test in test_results["failed"]:
            print(f"   {Colors.RED}✗{Colors.END} {test}")
    
    if test_results["warnings"]:
        print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠️  WARNINGS:{Colors.END}")
        for test in test_results["warnings"]:
            print(f"   {Colors.YELLOW}!{Colors.END} {test}")
    
    print("\n" + "="*70)
    
    if failed == 0:
        print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 ALL TESTS PASSED - READY FOR DEPLOYMENT!{Colors.END}\n")
        return True
    else:
        print(f"\n{Colors.RED}{Colors.BOLD}⚠️  {failed} TEST(S) FAILED - FIX BEFORE DEPLOYMENT!{Colors.END}\n")
        return False

def main():
    print(f"\n{Colors.BOLD}{Colors.BLUE}")
    print("╔═══════════════════════════════════════════════════════════════════╗")
    print("║                                                                   ║")
    print("║         PRE-DEPLOYMENT VALIDATION SUITE                          ║")
    print("║         TradingAgents System Check                               ║")
    print("║                                                                   ║")
    print("╚═══════════════════════════════════════════════════════════════════╝")
    print(f"{Colors.END}\n")
    
    print_info(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print_info("This will take 2-3 minutes...\n")
    
    # Run all tests
    tests = [
        test_1_environment_variables,
        test_2_python_dependencies,
        test_3_live_data_access,
        test_4_tradingagents_core,
        test_5_mcp_server,
        test_6_data_accuracy,
        test_7_dashboard_files,
        test_8_api_configuration
    ]
    
    for test in tests:
        try:
            test()
        except Exception as e:
            print_error(f"Test crashed: {e}")
            import traceback
            traceback.print_exc()
    
    # Generate report
    success = generate_report()
    
    print_info(f"\nCompleted: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
