#!/usr/bin/env python3
"""
Diagnose Vercel Production Error
"""
import requests
import json

url = "https://trading-agents-roar-vercel.app"

print("🔍 Diagnosing Vercel Production Error")
print("=" * 60)

# Test 1: Check if site is accessible
print("\n1. Testing site accessibility...")
try:
    r = requests.get(f"{url}/chat", timeout=10)
    print(f"✅ Site accessible: {r.status_code}")
except Exception as e:
    print(f"❌ Site not accessible: {e}")

# Test 2: Check API endpoint
print("\n2. Testing API endpoint...")
payload = {
    "prompt": {
        "role": "user",
        "content": "test"
    },
    "threadId": "diag-test",
    "responseId": "diag-1"
}

try:
    r = requests.post(
        f"{url}/api/chat",
        json=payload,
        headers={"Content-Type": "application/json"},
        timeout=30
    )
    print(f"Status: {r.status_code}")
    print(f"\nResponse preview:")
    print(r.text[:1000])
    
    if r.status_code == 401:
        print("\n❌ ISSUE: OpenAI API key not configured or invalid")
        print("   Fix: Check Vercel environment variables")
    elif r.status_code == 500:
        print("\n❌ ISSUE: Server error")
        print("   Check Vercel logs for details")
    elif "error" in r.text.lower():
        print("\n❌ ISSUE: Error in response")
        
except Exception as e:
    print(f"❌ Request failed: {e}")

print("\n" + "=" * 60)
print("\n📋 Next Steps:")
print("1. Check Vercel Dashboard → Logs")
print("2. Look for errors in /api/chat endpoint")
print("3. Verify OPENAI_API_KEY is set correctly")
print("4. Check if deployment completed successfully")
