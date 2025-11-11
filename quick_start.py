"""
Quick Start Script for Discord Integration

Automatically sets up and starts the Discord bot server with
interactive configuration.
"""

import os
import sys
from pathlib import Path


def print_banner():
    """Print welcome banner."""
    print("\n" + "=" * 60)
    print("  Discord Integration - Quick Start")
    print("=" * 60 + "\n")


def check_dependencies():
    """Check if required packages are installed."""
    print("Checking dependencies...")
    
    required = ['discord', 'flask', 'flask_cors', 'requests']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            print(f"  ✗ {package} (missing)")
            missing.append(package)
    
    if missing:
        print(f"\n⚠ Missing packages: {', '.join(missing)}")
        print("\nInstall with:")
        print("  pip install discord.py flask flask-cors requests")
        
        response = input("\nInstall now? (y/n): ").lower()
        if response == 'y':
            import subprocess
            subprocess.check_call([
                sys.executable, '-m', 'pip', 'install',
                'discord.py', 'flask', 'flask-cors', 'requests'
            ])
            print("\n✓ Dependencies installed!")
        else:
            print("\nPlease install dependencies manually and run again.")
            sys.exit(1)
    else:
        print("\n✓ All dependencies installed!\n")


def configure_system():
    """Interactive configuration."""
    print("Configuration Setup")
    print("-" * 60)
    
    # Check for existing token
    existing_token = os.getenv('DISCORD_BOT_TOKEN')
    
    if existing_token:
        print(f"\n✓ Discord bot token is already set")
        masked = f"{existing_token[:8]}...{existing_token[-4:]}"
        print(f"  Token: {masked}")
        
        response = input("\nUse this token? (y/n): ").lower()
        if response != 'y':
            existing_token = None
    
    if not existing_token:
        print("\nDiscord Bot Token Setup:")
        print("1. Go to: https://discord.com/developers/applications")
        print("2. Create a new application")
        print("3. Go to 'Bot' section and copy the token")
        print("4. Enable 'MESSAGE CONTENT INTENT' in bot settings")
        print("5. Invite bot to your server")
        
        print("\nOptions:")
        print("  1. Enter Discord bot token")
        print("  2. Use mock mode (no Discord required)")
        
        choice = input("\nChoice (1/2): ").strip()
        
        if choice == '1':
            token = input("\nEnter Discord bot token: ").strip()
            if token:
                os.environ['DISCORD_BOT_TOKEN'] = token
                print("\n✓ Token set!")
            else:
                print("\n⚠ No token entered. Using mock mode.")
                os.environ['MOCK_MODE'] = 'true'
        else:
            print("\n✓ Mock mode enabled (no Discord connection)")
            os.environ['MOCK_MODE'] = 'true'
    
    # Set other defaults
    if not os.getenv('DATABASE_PATH'):
        os.environ['DATABASE_PATH'] = './data/coach_plans.db'
    
    if not os.getenv('API_PORT'):
        os.environ['API_PORT'] = '5000'
    
    if not os.getenv('LOG_LEVEL'):
        os.environ['LOG_LEVEL'] = 'INFO'
    
    print("\nConfiguration:")
    print(f"  Database: {os.getenv('DATABASE_PATH')}")
    print(f"  API Port: {os.getenv('API_PORT')}")
    print(f"  Log Level: {os.getenv('LOG_LEVEL')}")
    print(f"  Mock Mode: {os.getenv('MOCK_MODE', 'false')}")


def run_diagnostics():
    """Run diagnostic tests."""
    print("\n" + "=" * 60)
    print("Running Diagnostics...")
    print("=" * 60 + "\n")
    
    response = input("Run diagnostic tests? (y/n): ").lower()
    if response == 'y':
        import subprocess
        result = subprocess.run([sys.executable, 'test_discord_system.py'])
        
        if result.returncode != 0:
            print("\n⚠ Some tests failed. Continue anyway? (y/n): ", end='')
            if input().lower() != 'y':
                sys.exit(1)


def start_server():
    """Start the Discord bot server."""
    print("\n" + "=" * 60)
    print("Starting Discord Bot Server")
    print("=" * 60 + "\n")
    
    print("The server will start with:")
    print(f"  • API: http://localhost:{os.getenv('API_PORT', '5000')}")
    print(f"  • Database: {os.getenv('DATABASE_PATH')}")
    print(f"  • Mock Mode: {os.getenv('MOCK_MODE', 'false')}")
    
    print("\nPress Ctrl+C to stop the server")
    print("\nStarting in 3 seconds...")
    
    import time
    time.sleep(3)
    
    # Start server
    import subprocess
    try:
        subprocess.run([
            sys.executable,
            'examples/discord_bot_server_enhanced.py'
        ])
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")


def show_next_steps():
    """Show what to do next."""
    print("\n" + "=" * 60)
    print("Next Steps")
    print("=" * 60 + "\n")
    
    print("1. Test Discord Commands:")
    print("   !plan d Watch for breakout above $950")
    print("   !plans")
    print("   !myplans")
    
    print("\n2. Test API:")
    print("   curl http://localhost:5000/health")
    print("   curl http://localhost:5000/api/coach-plans/?coach=d")
    
    print("\n3. Use Enhanced Client:")
    print("   python examples/use_enhanced_client.py")
    
    print("\n4. Read Documentation:")
    print("   • DISCORD_SETUP_AND_TEST.md - Complete testing guide")
    print("   • DISCORD_ENHANCEMENT_SUMMARY.md - System overview")
    
    print("\n5. Build Website:")
    print("   • Use the REST API we built")
    print("   • Display plans, charts, metrics")
    
    print("\n")


def main():
    """Main quick start flow."""
    print_banner()
    
    try:
        # Step 1: Check dependencies
        check_dependencies()
        
        # Step 2: Configure
        configure_system()
        
        # Step 3: Run diagnostics
        run_diagnostics()
        
        # Step 4: Start server
        start_server()
        
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n⚠ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        show_next_steps()


if __name__ == '__main__':
    main()
