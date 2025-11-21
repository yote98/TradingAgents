#!/usr/bin/env python3
"""
Verify that triple-redundant system is working on production
Run this AFTER adding keys to Vercel and redeploying
"""
import requests
import time

PROD_URL = "https://www.ai-trades.my"

print("=" * 70)
print("🔍 VERIFYING TRIPLE-REDUNDANT SYSTEM")
print("=" * 70)
print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print()
print("Testing production deployment at:", PROD_URL)
print()

# Test verification mode (should show all 3 sources)
print("📊 Testing Verification Mode (all sources)...")
print()

try:
    response = requests.get(
        f"{PROD_URL}/api/quote?symbol=NVDA&verify=true",
        timeout=30
    )
    
    if response.status_code == 200:
        data = response.json()
        
        print("✅ SUCCESS! Verification endpoint working")
        print()
        print(f"💰 Average Price: ${data.get('price', 'N/A'):.2f}")
        print(f"📊 Variance: {data.get('variance', 0):.4f}%")
        print(f"✅ Reliable: {data.get('reliable', False)}")
        print()
        
        if 'sources' in data:
            num_sources = len(data['sources'])
            print(f"📡 Active Sources: {num_sources}/3")
            print()
            
            for source in data['sources']:
                print(f"   • {source['source']}: ${source['price']:.2f}")
            
            print()
            print("=" * 70)
            
            if num_sources == 3:
                print("🎉 PERFECT! All 3 sources working!")
                print()
                print("✅ Finnhub (fastest)")
                print("✅ Alpha Vantage (reliable)")
                print("✅ Alpaca (institutional)")
                print()
                print("🛡️  Triple redundancy active!")
                print("🎯 Bulletproof accuracy!")
                print("💪 Professional-grade setup!")
                
            elif num_sources == 2:
                print("⚠️  GOOD: 2 sources working (redundancy active)")
                print()
                print("Missing sources might need keys added to Vercel:")
                all_sources = {'Finnhub', 'Alpha Vantage', 'Alpaca'}
                active = {s['source'].split(' ')[0] for s in data['sources']}
                missing = all_sources - active
                for m in missing:
                    print(f"   ❌ {m} - check if key is in Vercel")
                
            elif num_sources == 1:
                print("⚠️  WARNING: Only 1 source working (no redundancy)")
                print()
                print("Add these keys to Vercel for full redundancy:")
                print("   • FINNHUB_API_KEY")
                print("   • ALPACA_API_KEY")
                print("   • ALPACA_SECRET_KEY")
                print()
                print("See: VERCEL_ENV_SETUP_GUIDE.md")
            
            print()
            
            # Check variance
            variance = data.get('variance', 0)
            if variance < 0.5:
                print(f"✅ Variance {variance:.4f}% < 0.5% = RELIABLE")
            else:
                print(f"⚠️  Variance {variance:.4f}% > 0.5% = Check sources")
                
        else:
            print("❌ No sources data in response")
            
    else:
        print(f"❌ FAILED: Status {response.status_code}")
        print()
        print("Response:", response.text[:500])
        print()
        print("Possible issues:")
        print("1. Deployment still in progress (wait 2-3 minutes)")
        print("2. Keys not added to Vercel yet")
        print("3. Need to redeploy after adding keys")
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    print()
    print("Possible issues:")
    print("1. Network connection")
    print("2. Deployment not ready yet")
    print("3. API endpoint not responding")

print()
print("=" * 70)
print("📚 NEXT STEPS")
print("=" * 70)
print()
print("If you see < 3 sources:")
print("1. Check VERCEL_ENV_SETUP_GUIDE.md")
print("2. Add missing keys to Vercel")
print("3. Redeploy")
print("4. Wait 2-3 minutes")
print("5. Run this script again")
print()
print("If you see 3 sources:")
print("🎉 You're done! System is bulletproof!")
