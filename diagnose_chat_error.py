#!/usr/bin/env python3
"""Diagnose why chat API is failing"""
import requests
import time

PROD_URL = "https://www.ai-trades.my"

print("=" * 70)
print("🔍 DIAGNOSING CHAT API ERROR")
print("=" * 70)
print()

# Test 1: Check if site is up
print("1. Testing if site is accessible...")
try:
    response = requests.get(PROD_URL, timeout=10)
    print(f"   ✅ Site is up (Status: {response.status_code})")
except Exception as e:
    print(f"   ❌ Site is down: {e}")
print()

# Test 2: Check quote API (we know this works)
print("2. Testing quote API...")
try:
    response = requests.get(f"{PROD_URL}/api/quote?symbol=NVDA", timeout=10)
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ Quote API works: ${data.get('price', 'N/A')}")
    else:
        print(f"   ❌ Quote API failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error: {e}")
print()

# Test 3: Try chat API with minimal request
print("3. Testing chat API with minimal request...")
try:
    response = requests.post(
        f"{PROD_URL}/api/chat",
        json={"messages": [{"role": "user", "content": "hello"}]},
        timeout=30
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Chat API works!")
        print(f"   Response length: {len(response.text)} chars")
    else:
        print(f"   ❌ Chat API failed")
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ❌ Error: {e}")
print()

# Test 4: Try with stock analysis
print("4. Testing chat API with stock analysis...")
try:
    response = requests.post(
        f"{PROD_URL}/api/chat",
        json={"messages": [{"role": "user", "content": "What is NVDA price?"}]},
        timeout=60
    )
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✅ Stock query works!")
        # Check if it mentions the correct price
        if "180" in response.text or "181" in response.text:
            print(f"   ✅ Response mentions current price (~$180)")
        else:
            print(f"   ⚠️  Response doesn't mention current price")
            print(f"   First 300 chars: {response.text[:300]}")
    else:
        print(f"   ❌ Failed: {response.status_code}")
        print(f"   Response: {response.text[:500]}")
except Exception as e:
    print(f"   ❌ Error: {e}")
print()

print("=" * 70)
print("💡 DIAGNOSIS")
print("=" * 70)
print()
print("If chat API returns 500:")
print("  → Server-side error in the chat route")
print("  → Check Vercel logs for error details")
print("  → Possible causes:")
print("    - OpenAI API key issue")
print("    - Agent orchestration error")
print("    - Data fetching timeout")
print()
print("If chat works but gives wrong prices:")
print("  → AI is using training data instead of real-time data")
print("  → Need to strengthen system prompt")
print()
print("Check Vercel logs at:")
print("https://vercel.com/dashboard → Your Project → Logs")
