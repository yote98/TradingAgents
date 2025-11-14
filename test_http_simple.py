"""
Quick test of all HTTP endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

print("🧪 Testing TradingAgents HTTP API\n")
print("="*60)

# Test 1: Analyze
print("\n1️⃣ Testing ANALYZE endpoint...")
try:
    response = requests.post(
        f"{BASE_URL}/analyze",
        json={"ticker": "AAPL"},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Analyze endpoint working!")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 2: Backtest
print("\n2️⃣ Testing BACKTEST endpoint...")
try:
    response = requests.post(
        f"{BASE_URL}/backtest",
        json={
            "ticker": "AAPL",
            "start_date": "2024-01-01",
            "end_date": "2024-11-01"
        },
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Backtest endpoint working!")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 3: Risk
print("\n3️⃣ Testing RISK endpoint...")
try:
    response = requests.post(
        f"{BASE_URL}/risk",
        json={
            "ticker": "TSLA",
            "account_value": 10000,
            "risk_per_trade_pct": 2,
            "current_price": 250
        },
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Risk endpoint working!")
        result = response.json()
        print(f"   Position size: {result.get('position_size', 'N/A')}")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Sentiment
print("\n4️⃣ Testing SENTIMENT endpoint...")
try:
    response = requests.post(
        f"{BASE_URL}/sentiment",
        json={"ticker": "NVDA"},
        timeout=10
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print("   ✅ Sentiment endpoint working!")
    else:
        print(f"   Response: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("✅ API testing complete!")
