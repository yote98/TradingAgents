#!/usr/bin/env python3
"""Wait for deployment and test together"""
import time
import requests

PROD_URL = "https://www.ai-trades.my"

print("=" * 70)
print("⏳ WAITING FOR VERCEL DEPLOYMENT")
print("=" * 70)
print()
print("Waiting 2 minutes for deployment to complete...")
print()

for i in range(120, 0, -30):
    mins = i // 60
    secs = i % 60
    print(f"⏳ {mins}:{secs:02d} remaining...", end='\r')
    time.sleep(30)

print("\n✅ Deployment should be ready!")
print()
print("=" * 70)
print("🧪 RUNNING TESTS")
print("=" * 70)
print()

# Quick test of the analyze endpoint
print("Testing AI Analysis for NVDA...")
print()

try:
    response = requests.post(
        f"{PROD_URL}/api/analyze",
        json={"ticker": "NVDA"},
        timeout=90
    )
    
    if response.status_code == 200:
        data = response.json()
        
        current_price = data.get('current_price', 0)
        recommendation = data.get('final_decision', 'N/A')
        target = data.get('target_price', 0)
        stop = data.get('stop_loss', 0)
        confidence = data.get('confidence', 0)
        
        print(f"✅ Analysis successful!")
        print()
        print(f"💰 Current Price: ${current_price:.2f}")
        print(f"🎯 Recommendation: {recommendation}")
        print(f"💪 Confidence: {confidence}%")
        print(f"🎯 Target: ${target:.2f}")
        print(f"🛑 Stop Loss: ${stop:.2f}")
        print()
        
        # Validate
        print("=" * 70)
        print("✅ VALIDATION")
        print("=" * 70)
        print()
        
        all_good = True
        
        if recommendation != 'SELL':
            print(f"✅ Recommendation is {recommendation} (not SELL)")
        else:
            print(f"❌ Still showing SELL")
            all_good = False
        
        if target > current_price or (recommendation == 'HOLD' and abs(target - current_price) < current_price * 0.15):
            pct = ((target / current_price) - 1) * 100
            print(f"✅ Target ${target:.2f} makes sense ({pct:+.1f}%)")
        else:
            print(f"❌ Target ${target:.2f} is wrong")
            all_good = False
        
        if stop < current_price:
            pct = ((stop / current_price) - 1) * 100
            print(f"✅ Stop loss ${stop:.2f} is below current ({pct:.1f}%)")
        else:
            print(f"❌ Stop loss ${stop:.2f} is above current (WRONG!)")
            all_good = False
        
        print()
        
        if all_good:
            print("🎉 SUCCESS! All checks passed!")
            print()
            print("Your app is working correctly!")
            print("The AI is giving sensible recommendations.")
        else:
            print("⚠️  Some issues detected")
            print()
            print("The AI recommendations still need work.")
    else:
        print(f"❌ Failed: Status {response.status_code}")
        print(response.text[:500])
        
except Exception as e:
    print(f"❌ ERROR: {e}")

print()
print("=" * 70)
print("Want to run the full comprehensive test? (y/n)")
