"""
Quick Start Deployment Script
Helps you get the Discord Enhancement API running quickly
"""

import os
import sys
import subprocess
import time

def print_header(text):
    """Print formatted header"""
    print(f"\n{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}\n")

def check_python():
    """Check Python version"""
    print("Checking Python version...")
    version = sys.version_info
    if version.major >= 3 and version.minor >= 10:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro}")
        print("   Python 3.10+ required")
        return False

def check_dependencies():
    """Check if required packages are installed"""
    print("\nChecking dependencies...")
    required = ['flask', 'requests']
    missing = []
    
    for package in required:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package} - not installed")
            missing.append(package)
    
    return missing

def install_dependencies(missing):
    """Install missing dependencies"""
    if not missing:
        return True
    
    print(f"\nInstalling missing packages: {', '.join(missing)}")
    try:
        subprocess.check_call([
            sys.executable, '-m', 'pip', 'install', 
            '-r', 'requirements-discord-api.txt'
        ])
        print("✅ Dependencies installed")
        return True
    except subprocess.CalledProcessError:
        print("❌ Failed to install dependencies")
        return False

def setup_environment():
    """Setup environment variables"""
    print("\nSetting up environment...")
    
    # Check if .env exists
    if os.path.exists('.env'):
        print("✅ .env file found")
        return True
    
    # Create .env with defaults
    print("Creating .env file with defaults...")
    env_content = """# Discord Enhancement API Configuration

# Mock mode (set to false to use real Discord)
MOCK_MODE=true

# Database path
DATABASE_PATH=./data/coach_plans.db

# API port
API_PORT=5000

# Discord bot token (only needed if MOCK_MODE=false)
# DISCORD_BOT_TOKEN=your_token_here

# Log level
LOG_LEVEL=INFO
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ .env file created with mock mode enabled")
    return True

def create_data_directory():
    """Create data directory for database"""
    print("\nCreating data directory...")
    os.makedirs('data', exist_ok=True)
    print("✅ Data directory ready")

def test_server():
    """Test if server is running"""
    print("\nTesting server...")
    time.sleep(2)  # Give server time to start
    
    try:
        import requests
        response = requests.get('http://localhost:5000/health', timeout=5)
        if response.status_code == 200:
            print("✅ Server is running!")
            return True
    except:
        pass
    
    print("⚠️  Could not connect to server")
    return False

def main():
    """Main deployment flow"""
    print_header("TradingAgents Discord API - Quick Start")
    
    # Step 1: Check Python
    print_header("Step 1: System Check")
    if not check_python():
        print("\n❌ Please upgrade to Python 3.10 or higher")
        return False
    
    # Step 2: Check dependencies
    print_header("Step 2: Dependencies")
    missing = check_dependencies()
    
    if missing:
        print("\nWould you like to install missing dependencies? (y/n): ", end='')
        if input().lower() == 'y':
            if not install_dependencies(missing):
                return False
        else:
            print("❌ Cannot proceed without dependencies")
            return False
    
    # Step 3: Setup environment
    print_header("Step 3: Environment Setup")
    setup_environment()
    create_data_directory()
    
    # Step 4: Start server
    print_header("Step 4: Starting Server")
    print("\nStarting Discord Enhancement API server...")
    print("Press Ctrl+C to stop the server\n")
    
    try:
        # Set environment variable for mock mode
        os.environ['MOCK_MODE'] = 'true'
        
        # Start the server
        subprocess.run([
            sys.executable, 
            'examples/discord_bot_server_enhanced.py'
        ])
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        return False
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user")
        sys.exit(1)
