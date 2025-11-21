"""
Check what the actual Vercel URL is
Based on the screenshots, it looks like localhost:3000
"""
import requests
import json

# Try localhost first (from screenshots)
URLS_TO_TRY = [
    "http://localhost:3000",
    "https://template-c1-next-git-main-cvn-b850i-gamings-projects.vercel.app",
    "https://tradingagents.vercel.app",
]

def test_url(base_url):
    """Test if a URL is accessible"""
    print(f"\n{'='*60}")
    print(f"Testing: {base_url}")
    print('='*60)
    
    # Try debug endpoint
    try:
        url = f"{base_url}/api/debug-price?symbol=NVDA"
        print(f"Trying: {url}")
        response = requests.get(url, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ SUCCESS!")
            print(f"Price: ${data.get('price', 'N/A')}")
            print(f"Source: {data.get('source', 'N/A')}")
            return base_url
        elif response.status_code == 404:
            print(f"❌ 404 - Endpoint not found")
        else:
            print(f"❌ Status {response.status_code}: {response.text[:200]}")
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection refused - server not running")
    except requests.exceptions.Timeout:
        print(f"❌ Timeout")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

if __name__ == "__main__":
    print("FINDING ACTIVE DEPLOYMENT URL")
    
    working_url = None
    for url in URLS_TO_TRY:
        result = test_url(url)
        if result:
            working_url = result
            break
    
    if working_url:
        print(f"\n{'='*60}")
        print(f"✅ FOUND WORKING URL: {working_url}")
        print('='*60)
    else:
        print(f"\n{'='*60}")
        print("❌ NO WORKING URL FOUND")
        print("Is the dev server running? Try: npm run dev")
        print('='*60)
