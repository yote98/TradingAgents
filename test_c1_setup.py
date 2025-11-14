"""
Quick C1 Setup Diagnostic
Tests each component to find what's blocking you
"""
import os
import sys
import requests
from pathlib import Path

print("=" * 60)
print("C1 SETUP DIAGNOSTIC")
print("=" * 60)

# Test 1: Check Thesys API Key
print("\n1️⃣ Checking Thesys API Key...")
env_file = Path("c1-template/.env")
if env_file.exists():
    with open(env_file) as f:
        content = f.read()
        if "THESYS_API_KEY=sk-th-" in content and len(content.split("THESYS_API_KEY=")[1].split("\n")[0]) > 20:
            print("   ✅ API key found in .env")
        else:
            print("   ❌ API key missing or invalid")
            print("   → Get key from: https://chat.thesys.dev/console/keys")
else:
    print("   ❌ .env file not found")
    print("   → Create c1-template/.env with your THESYS_API_KEY")

# Test 2: Check if TradingAgents can initialize
print("\n2️⃣ Testing TradingAgents initialization...")
try:
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from tradingagents.graph.trading_graph import TradingAgentsGraph
    from tradingagents.default_config import DEFAULT_CONFIG
    
    config = DEFAULT_CONFIG.copy()
    config["quick_think_llm"] = "gpt-4o-mini"
    config["deep_think_llm"] = "gpt-4o-mini"
    config["max_debate_rounds"] = 1
    config["enable_coaches"] = False
    config["enable_memory"] = False
    
    graph = TradingAgentsGraph(config=config)
    print("   ✅ TradingAgents initialized successfully")
except Exception as e:
    print(f"   ❌ TradingAgents failed: {e}")
    print("   → Check if OPENAI_API_KEY is set in your environment")

# Test 3: Check if Flask API is running
print("\n3️⃣ Checking if TradingAgents API is running...")
try:
    response = requests.get("http://localhost:5000/health", timeout=2)
    if response.status_code == 200:
        print("   ✅ API is running on port 5000")
    else:
        print(f"   ⚠️ API responded with status {response.status_code}")
except requests.exceptions.ConnectionError:
    print("   ❌ API not running")
    print("   → Start it with: python tradingagents_api.py")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Check Node.js and pnpm
print("\n4️⃣ Checking Node.js environment...")
try:
    import subprocess
    
    # Check Node version
    node_version = subprocess.run(["node", "--version"], capture_output=True, text=True)
    if node_version.returncode == 0:
        version = node_version.stdout.strip()
        print(f"   ✅ Node.js {version}")
    else:
        print("   ❌ Node.js not found")
        
    # Check pnpm
    pnpm_version = subprocess.run(["pnpm", "--version"], capture_output=True, text=True)
    if pnpm_version.returncode == 0:
        version = pnpm_version.stdout.strip()
        print(f"   ✅ pnpm {version}")
    else:
        print("   ⚠️ pnpm not found")
        print("   → Install with: npm install -g pnpm")
        
except Exception as e:
    print(f"   ❌ Error checking Node: {e}")

# Test 5: Check if c1-template dependencies are installed
print("\n5️⃣ Checking c1-template dependencies...")
node_modules = Path("c1-template/node_modules")
if node_modules.exists():
    print("   ✅ node_modules exists")
else:
    print("   ❌ Dependencies not installed")
    print("   → Run: cd c1-template && pnpm install")

print("\n" + "=" * 60)
print("NEXT STEPS:")
print("=" * 60)

# Provide actionable next steps
steps = []

if not env_file.exists() or "sk-th-" not in open(env_file).read():
    steps.append("1. Add your Thesys API key to c1-template/.env")

try:
    requests.get("http://localhost:5000/health", timeout=1)
except:
    steps.append("2. Start TradingAgents API: python tradingagents_api.py")

if not node_modules.exists():
    steps.append("3. Install dependencies: cd c1-template && pnpm install")

if not steps:
    print("\n✅ Everything looks good!")
    print("\nStart the C1 frontend:")
    print("   cd c1-template")
    print("   pnpm run dev")
    print("\nThen open: http://localhost:3000")
else:
    print("\nFix these issues:\n")
    for step in steps:
        print(f"   {step}")

print("\n" + "=" * 60)
