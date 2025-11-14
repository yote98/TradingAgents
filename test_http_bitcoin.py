"""
Simple test script to analyze Bitcoin via HTTP API
"""
import requests
import json

# API endpoint
url = "http://127.0.0.1:8000/analyze"

# Request data
data = {
    "ticker": "BTC-USD"
}

print("🚀 Analyzing Bitcoin (BTC-USD)...")
print(f"Sending request to: {url}")
print(f"Data: {json.dumps(data, indent=2)}")
print("\n" + "="*60 + "\n")

try:
    # Make the request
    response = requests.post(url, json=data, timeout=300)
    
    # Check if successful
    if response.status_code == 200:
        result = response.json()
        print("✅ SUCCESS!")
        print("\n" + "="*60)
        print("ANALYSIS RESULTS:")
        print("="*60 + "\n")
        print(json.dumps(result, indent=2))
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
except requests.exceptions.Timeout:
    print("⏱️ Request timed out (analysis takes a while)")
except requests.exceptions.ConnectionError:
    print("❌ Could not connect to server. Is it running?")
    print("Start it with: python mcp_http_server.py")
except Exception as e:
    print(f"❌ Error: {e}")
