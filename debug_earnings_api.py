#!/usr/bin/env python3
"""
Debug what Alpha Vantage is actually returning
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("ALPHA_VANTAGE_API_KEY")

if not api_key:
    print("❌ No API key")
    exit(1)

ticker = "NVDA"
url = f"https://www.alphavantage.co/query?function=EARNINGS_CALENDAR&symbol={ticker}&apikey={api_key}"

print(f"🔍 Fetching earnings for {ticker}...")
print(f"URL: {url}\n")

response = requests.get(url, timeout=10)

print(f"Status: {response.status_code}")
print(f"\nRaw Response (first 1000 chars):")
print("=" * 60)
print(response.text[:1000])
print("=" * 60)

# Parse and show all upcoming earnings
lines = response.text.strip().split('\n')
print(f"\nTotal lines: {len(lines)}")

if len(lines) > 1:
    print("\nAll NVDA earnings in calendar:")
    print("=" * 60)
    header = lines[0].split(',')
    print(f"Columns: {', '.join(header)}")
    print("-" * 60)
    
    for i, line in enumerate(lines[1:], 1):
        if line.strip():
            print(f"{i}. {line}")
