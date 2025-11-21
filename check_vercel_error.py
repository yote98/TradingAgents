#!/usr/bin/env python3
"""Check what's causing the 500 error"""
import requests
import time

PROD_URL = "https://www.ai-trades.my"

print("=" * 70)
print("🔍 DIAGNOSING 500 ERROR")
print("=" * 70)
print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print()

# Test the quote endpoint
print("Testing quote endpoint...")
try:
    response = requests.get(f"{PROD_URL}/api/quote?symbol=NVDA", timeout=15)
    print(f"Status: {response.status_code}")
    print(f"Headers: {dict(response.headers)}")
    print()
    print("Response body:")
    print(response.text[:1000])
except Exception as e:
    print(f"ERROR: {e}")

print()
print("=" * 70)
print("Possible causes:")
print("1. Vercel deployment still in progress (wait 2-3 minutes)")
print("2. Environment variables not set on Vercel")
print("3. TypeScript compilation error")
print("4. Missing API keys in Vercel environment")
print()
print("Check Vercel dashboard: https://vercel.com/dashboard")
