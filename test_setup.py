"""
Test Setup Script - Verify TradingAgents Installation

This script checks if everything is properly configured.
"""

import sys
import os

def print_status(message, status):
    """Print a status message with color."""
    symbol = "✓" if status else "✗"
    print(f"{symbol} {message}")

def main():
    print("="*60)
    print("  TRADINGAGENTS SETUP VERIFICATION")
    print("="*60)
    print()
    
    # Test 1: Python Version
    print("1. Checking Python version...")
    python_version = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print(f"   Python {python_version}")
    version_ok = sys.version_info >= (3, 10)
    print_status(f"Python version {python_version} (need 3.10+)", version_ok)
    print()
    
    # Test 2: Environment Variables
    print("2. Checking environment variables...")
    
    # Check for .env file
    env_file_exists = os.path.exists('.env')
    print_status(".env file exists", env_file_exists)
    
    if env_file_exists:
        from dotenv import load_dotenv
        load_dotenv()
    
    openai_key = os.getenv('OPENAI_API_KEY')
    alpha_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    
    openai_ok = openai_key and openai_key != 'openai_api_key_placeholder' and len(openai_key) > 20
    alpha_ok = alpha_key and alpha_key != 'alpha_vantage_api_key_placeholder' and len(alpha_key) > 5
    
    print_status(f"OPENAI_API_KEY configured", openai_ok)
    if openai_ok:
        print(f"   Key starts with: {openai_key[:15]}...")
    
    print_status(f"ALPHA_VANTAGE_API_KEY configured", alpha_ok)
    if alpha_ok:
        print(f"   Key: {alpha_key}")
    print()
    
    # Test 3: Required Packages
    print("3. Checking required packages...")
    
    packages = {
        'langchain': 'langchain',
        'langchain-openai': 'langchain_openai',
        'langgraph': 'langgraph',
        'openai': 'openai',
        'yfinance': 'yfinance',
        'pandas': 'pandas',
        'requests': 'requests',
        'python-dotenv': 'dotenv'
    }
    
    missing_packages = []
    for package_name, import_name in packages.items():
        try:
            __import__(import_name)
            print_status(f"{package_name} installed", True)
        except ImportError:
            print_status(f"{package_name} installed", False)
            missing_packages.append(package_name)
    print()
    
    # Test 4: TradingAgents Module
    print("4. Checking TradingAgents module...")
    try:
        from tradingagents.graph.trading_graph import TradingAgentsGraph
        from tradingagents.default_config import DEFAULT_CONFIG
        print_status("TradingAgents module can be imported", True)
        print()
    except ImportError as e:
        print_status("TradingAgents module can be imported", False)
        print(f"   Error: {e}")
        print()
    
    # Summary
    print("="*60)
    print("  SUMMARY")
    print("="*60)
    print()
    
    if not version_ok:
        print("❌ Python version too old. Please upgrade to Python 3.10+")
        print()
    
    if missing_packages:
        print("❌ Missing packages. Install them with:")
        print(f"   python -m pip install -r requirements.txt")
        print()
        print("   Or install individually:")
        for pkg in missing_packages:
            print(f"   python -m pip install {pkg}")
        print()
    
    if not openai_ok or not alpha_ok:
        print("❌ API keys not configured properly.")
        print()
        print("   Edit your .env file and add:")
        if not openai_ok:
            print("   OPENAI_API_KEY=your_actual_key_here")
        if not alpha_ok:
            print("   ALPHA_VANTAGE_API_KEY=your_actual_key_here")
        print()
    
    if version_ok and not missing_packages and openai_ok and alpha_ok:
        print("✅ ALL CHECKS PASSED!")
        print()
        print("You're ready to run TradingAgents!")
        print()
        print("Next steps:")
        print("  1. Run the demo: python demo_complete_system.py")
        print("  2. Or try basic: python main.py")
        print()
    else:
        print("⚠️  Some issues found. Please fix them above.")
        print()
    
    print("="*60)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"\n❌ Error running test: {e}")
        print("\nThis might mean some packages are missing.")
        print("Try: python -m pip install -r requirements.txt")
