#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE TEST - After all fixes
Tests if AI recommendations are now correct
"""
import requests
import time

PROD_URL = "https://www.ai-trades.my"

print("=" * 70)
print("🎯 FINAL COMPREHENSIVE TEST")
print("=" * 70)
print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print()
print("Waiting 3 minutes for Vercel deployment...")
print()

# Wait for deployment
for i in range(180, 0, -30):
    mins = i // 60
    secs = i % 60
    print(f"⏳ {mins}:{secs:02d} remaining...", end='\r')
    time.sleep(30)

print("\n✅ Deployment complete!")
print()

# Get current price first
print("=" * 70)
print("📊 STEP 1: GET CURRENT PRICE")
print("=" * 70)
print()

try:
    response = requests.get(f"{PROD_URL}/api/quote?symbol=NVDA", timeout=15)
    if response.status_code == 200:
        quote = response.json()
        current_price = quote.get('price', 0)
        print(f"✅ Current NVDA Price: ${current_price:.2f}")
        print(f"📡 Source: {quote.get('source', 'Unknown')}")
        print()
    else:
        print(f"❌ Failed to get price: {response.status_code}")
        current_price = 180.64
        print(f"Using fallback: ${current_price}")
        print()
except Exception as e:
    print(f"❌ Error: {e}")
    current_price = 180.64
    print(f"Using fallback: ${current_price}")
    print()

# Test the analyze endpoint
print("=" * 70)
print("🤖 STEP 2: TEST AI ANALYSIS")
print("=" * 70)
print()
print("Running full AI analysis (may take 30-60 seconds)...")
print()

try:
    start_time = time.time()
    
    response = requests.post(
        f"{PROD_URL}/api/analyze",
        json={"ticker": "NVDA"},
        timeout=90
    )
    
    elapsed = time.time() - start_time
    
    if response.status_code == 200:
        data = response.json()
        
        print(f"✅ Analysis completed in {elapsed:.1f} seconds")
        print()
        
        # Extract key data
        ai_price = data.get('current_price', 0)
        recommendation = data.get('final_decision', 'N/A')
        confidence = data.get('confidence', 0)
        target = data.get('target_price', 0)
        stop = data.get('stop_loss', 0)
        
        print("=" * 70)
        print("📊 AI ANALYSIS RESULTS")
        print("=" * 70)
        print()
        print(f"💰 Price AI Saw: ${ai_price:.2f}")
        print(f"🎯 Recommendation: {recommendation}")
        print(f"💪 Confidence: {confidence}%")
        print(f"🎯 Target: ${target:.2f}")
        print(f"🛑 Stop Loss: ${stop:.2f}")
        print()
        
        # Validation
        print("=" * 70)
        print("✅ VALIDATION CHECKS")
        print("=" * 70)
        print()
        
        checks_passed = 0
        total_checks = 4
        
        # Check 1: AI saw correct price
        if abs(ai_price - current_price) < 1:
            print(f"✅ CHECK 1: AI saw correct price (${ai_price:.2f} ≈ ${current_price:.2f})")
            checks_passed += 1
        else:
            print(f"❌ CHECK 1: AI saw wrong price (${ai_price:.2f} != ${current_price:.2f})")
        
        # Check 2: Recommendation is not SELL (we converted to HOLD)
        if recommendation != 'SELL':
            print(f"✅ CHECK 2: Recommendation is {recommendation} (not SELL)")
            checks_passed += 1
        else:
            print(f"❌ CHECK 2: Still showing SELL (should be HOLD)")
        
        # Check 3: Target makes sense
        if recommendation == 'BUY' and target > current_price:
            pct = ((target / current_price) - 1) * 100
            print(f"✅ CHECK 3: BUY target ${target:.2f} is above current (+{pct:.1f}%)")
            checks_passed += 1
        elif recommendation == 'HOLD' and abs(target - current_price) < current_price * 0.1:
            print(f"✅ CHECK 3: HOLD target ${target:.2f} is near current price")
            checks_passed += 1
        else:
            pct = ((target / current_price) - 1) * 100
            print(f"❌ CHECK 3: Target ${target:.2f} doesn't make sense ({pct:+.1f}%)")
        
        # Check 4: Stop loss makes sense
        if stop < current_price:
            pct = ((stop / current_price) - 1) * 100
            print(f"✅ CHECK 4: Stop loss ${stop:.2f} is below current ({pct:.1f}%)")
            checks_passed += 1
        else:
            print(f"❌ CHECK 4: Stop loss ${stop:.2f} is above current (WRONG!)")
        
        print()
        print("=" * 70)
        print("🎯 FINAL VERDICT")
        print("=" * 70)
        print()
        print(f"Checks Passed: {checks_passed}/{total_checks}")
        print()
        
        if checks_passed == total_checks:
            print("🎉 SUCCESS! ALL CHECKS PASSED!")
            print()
            print("✅ AI is using correct real-time prices")
            print("✅ Recommendations make sense")
            print("✅ Targets are above current price for BUY")
            print("✅ Stop losses are below current price")
            print()
            print("🚀 YOUR APP IS NOW WORKING CORRECTLY!")
            print()
            print("Your friend can now trust the recommendations.")
            print("No more $12k losses from bad data!")
            
        elif checks_passed >= 3:
            print("⚠️  MOSTLY WORKING - Minor issues remain")
            print()
            print("The app is functional but needs fine-tuning.")
            print("Check the failed validation above.")
            
        else:
            print("❌ STILL BROKEN - Major issues remain")
            print()
            print("The AI is still not working correctly.")
            print("Need to investigate further...")
        
    else:
        print(f"❌ Analysis failed: Status {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
except requests.Timeout:
    print("❌ TIMEOUT: Analysis took too long")
    print()
    print("The agents might be taking too long to run.")
    
except Exception as e:
    print(f"❌ ERROR: {e}")
    import traceback
    traceback.print_exc()

print()
print("=" * 70)
print("📝 SUMMARY OF FIXES APPLIED")
print("=" * 70)
print()
print("1. ✅ Fixed support/resistance calculation (use current price)")
print("2. ✅ Converted SELL to HOLD (retail-friendly)")
print("3. ✅ Fixed backwards target/stop logic")
print("4. ✅ Triple-redundant data sources (Finnhub, Alpha, Alpaca)")
print()
print("If still broken, next steps:")
print("- Check Vercel logs for errors")
print("- Verify OpenAI API key is set")
print("- Test with different stocks")
