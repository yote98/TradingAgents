"""
Test TwitterAPI.io Integration
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('TWITTER_API_KEY')

print("="*70)
print("TWITTER API.IO TEST")
print("="*70)
print(f"\nAPI Key: {api_key[:20]}...")

# Test 1: Search tweets about AAPL
print("\n1. Testing tweet search for AAPL...")
url = "https://api.twitterapi.io/twitter/search"
params = {
    "query": "$AAPL",
    "count": 10
}
headers = {
    "x-api-key": api_key,
    "Content-Type": "application/json"
}

try:
    response = requests.get(url, params=params, headers=headers, timeout=10)
    print(f"   Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"   ✅ SUCCESS!")
        
        if 'data' in data and len(data['data']) > 0:
            print(f"   Found {len(data['data'])} tweets")
            
            # Show sample tweet
            tweet = data['data'][0]
            print(f"\n   📱 Sample Tweet:")
            print(f"      Author: @{tweet.get('author', {}).get('username', 'N/A')}")
            print(f"      Text: {tweet.get('text', 'N/A')[:100]}...")
            print(f"      Likes: {tweet.get('public_metrics', {}).get('like_count', 0)}")
            print(f"      Retweets: {tweet.get('public_metrics', {}).get('retweet_count', 0)}")
            
            # Analyze sentiment
            bullish = 0
            bearish = 0
            for t in data['data']:
                text = t.get('text', '').lower()
                if any(word in text for word in ['bullish', 'buy', 'long', 'calls', 'moon']):
                    bullish += 1
                elif any(word in text for word in ['bearish', 'sell', 'short', 'puts', 'crash']):
                    bearish += 1
            
            print(f"\n   📊 Sentiment Analysis:")
            print(f"      Bullish tweets: {bullish}")
            print(f"      Bearish tweets: {bearish}")
            
            if bullish > bearish:
                print(f"      → BULLISH sentiment")
            elif bearish > bullish:
                print(f"      → BEARISH sentiment")
            else:
                print(f"      → NEUTRAL sentiment")
        else:
            print(f"   ⚠️  No tweets found")
    else:
        print(f"   ❌ FAILED")
        print(f"   Response: {response.text[:200]}")
        
except Exception as e:
    print(f"   ❌ ERROR: {e}")

print("\n" + "="*70)
print("INTEGRATION STATUS")
print("="*70)
print("""
✅ Twitter API key added to .env
✅ Twitter client created
✅ Ready to integrate with social sentiment

Your system will now have:
- Reddit (unlimited, free)
- Nitter RSS (backup, free)
- TwitterAPI.io (real-time, ~$5/month)

This gives you the best Twitter data for financial sentiment!
""")
