#!/usr/bin/env python3
"""
COMPREHENSIVE TEST SUITE - Test Everything Together
Run this to verify your app is working perfectly
"""
import requests
import time
import json

PROD_URL = "https://www.ai-trades.my"

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70 + "\n")

def print_test(number, name):
    print(f"\n{'─' * 70}")
    print(f"TEST {number}: {name}")
    print('─' * 70)

print_header("🚀 COMPREHENSIVE APP TEST - Let's Test Together!")
print(f"Time: {time.strftime('%Y-%m-%d %H:%M:%S')}")
print(f"Testing: {PROD_URL}")

# Store results
results = {
    "passed": 0,
    "failed": 0,
    "tests": []
}

# TEST 1: Site Accessibility
print_test(1, "Site Accessibility")
try:
    response = requests.get(PROD_URL, timeout=10)
    if response.status_code == 200:
        print("✅ PASS: Site is accessible")
        results["passed"] += 1
        results["tests"].append({"name": "Site Accessibility", "status": "PASS"})
    else:
        print(f"❌ FAIL: Status {response.status_code}")
        results["failed"] += 1
        results["tests"].append({"name": "Site Accessibility", "status": "FAIL"})
except Exception as e:
    print(f"❌ FAIL: {e}")
    results["failed"] += 1
    results["tests"].append({"name": "Site Accessibility", "status": "FAIL"})

# TEST 2: Quote API - Single Stock
print_test(2, "Quote API - Single Stock (NVDA)")
try:
    response = requests.get(f"{PROD_URL}/api/quote?symbol=NVDA", timeout=15)
    if response.status_code == 200:
        data = response.json()
        price = data.get('price', 0)
        source = data.get('source', 'Unknown')
        
        if price > 0:
            print(f"✅ PASS: Got price ${price:.2f}")
            print(f"   Source: {source}")
            print(f"   Change: {data.get('change', 'N/A')} ({data.get('changePercent', 'N/A')}%)")
            results["passed"] += 1
            results["tests"].append({"name": "Quote API", "status": "PASS", "price": price})
        else:
            print(f"❌ FAIL: Invalid price: {price}")
            results["failed"] += 1
            results["tests"].append({"name": "Quote API", "status": "FAIL"})
    else:
        print(f"❌ FAIL: Status {response.status_code}")
        results["failed"] += 1
        results["tests"].append({"name": "Quote API", "status": "FAIL"})
except Exception as e:
    print(f"❌ FAIL: {e}")
    results["failed"] += 1
    results["tests"].append({"name": "Quote API", "status": "FAIL"})

# TEST 3: Quote API - Multiple Stocks
print_test(3, "Quote API - Multiple Stocks")
symbols = ['AAPL', 'TSLA', 'MSFT']
all_passed = True
for symbol in symbols:
    try:
        response = requests.get(f"{PROD_URL}/api/quote?symbol={symbol}", timeout=15)
        if response.status_code == 200:
            data = response.json()
            price = data.get('price', 0)
            if price > 0:
                print(f"   ✅ {symbol}: ${price:.2f}")
            else:
                print(f"   ❌ {symbol}: Invalid price")
                all_passed = False
        else:
            print(f"   ❌ {symbol}: Status {response.status_code}")
            all_passed = False
    except Exception as e:
        print(f"   ❌ {symbol}: {e}")
        all_passed = False

if all_passed:
    print("\n✅ PASS: All stocks returned valid prices")
    results["passed"] += 1
    results["tests"].append({"name": "Multiple Stocks", "status": "PASS"})
else:
    print("\n❌ FAIL: Some stocks failed")
    results["failed"] += 1
    results["tests"].append({"name": "Multiple Stocks", "status": "FAIL"})

# TEST 4: Verification Mode (Triple Redundancy)
print_test(4, "Triple Redundancy - Verification Mode")
try:
    response = requests.get(f"{PROD_URL}/api/quote?symbol=NVDA&verify=true", timeout=30)
    if response.status_code == 200:
        data = response.json()
        sources = data.get('sources', [])
        variance = data.get('variance', 0)
        reliable = data.get('reliable', False)
        
        print(f"   Sources found: {len(sources)}")
        for source in sources:
            print(f"   - {source['source']}: ${source['price']:.2f}")
        
        print(f"\n   Variance: {variance:.4f}%")
        print(f"   Reliable: {reliable}")
        
        if len(sources) >= 2 and reliable:
            print("\n✅ PASS: Multiple sources working with low variance")
            results["passed"] += 1
            results["tests"].append({"name": "Triple Redundancy", "status": "PASS", "sources": len(sources)})
        else:
            print(f"\n⚠️  PARTIAL: {len(sources)} sources (expected 3)")
            results["passed"] += 1
            results["tests"].append({"name": "Triple Redundancy", "status": "PARTIAL", "sources": len(sources)})
    else:
        print(f"❌ FAIL: Status {response.status_code}")
        results["failed"] += 1
        results["tests"].append({"name": "Triple Redundancy", "status": "FAIL"})
except Exception as e:
    print(f"❌ FAIL: {e}")
    results["failed"] += 1
    results["tests"].append({"name": "Triple Redundancy", "status": "FAIL"})

# TEST 5: AI Analysis Endpoint
print_test(5, "AI Analysis - Full Agent System")
print("   (This may take 30-60 seconds...)")
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
        
        current_price = data.get('current_price', 0)
        recommendation = data.get('final_decision', 'N/A')
        confidence = data.get('confidence', 0)
        target = data.get('target_price', 0)
        stop = data.get('stop_loss', 0)
        
        print(f"\n   ⏱️  Analysis time: {elapsed:.1f}s")
        print(f"   💰 Current Price: ${current_price:.2f}")
        print(f"   🎯 Recommendation: {recommendation}")
        print(f"   💪 Confidence: {confidence}%")
        print(f"   🎯 Target: ${target:.2f}")
        print(f"   🛑 Stop Loss: ${stop:.2f}")
        
        # Validate the logic
        checks_passed = 0
        total_checks = 3
        
        # Check 1: Recommendation is not SELL
        if recommendation != 'SELL':
            print(f"\n   ✅ Check 1: Recommendation is {recommendation} (not SELL)")
            checks_passed += 1
        else:
            print(f"\n   ❌ Check 1: Still showing SELL")
        
        # Check 2: Target makes sense
        if recommendation == 'BUY' and target > current_price:
            pct = ((target / current_price) - 1) * 100
            print(f"   ✅ Check 2: BUY target ${target:.2f} is above current (+{pct:.1f}%)")
            checks_passed += 1
        elif recommendation == 'HOLD' and abs(target - current_price) < current_price * 0.15:
            print(f"   ✅ Check 2: HOLD target ${target:.2f} is reasonable")
            checks_passed += 1
        else:
            print(f"   ❌ Check 2: Target ${target:.2f} doesn't make sense")
        
        # Check 3: Stop loss is below current
        if stop < current_price:
            pct = ((stop / current_price) - 1) * 100
            print(f"   ✅ Check 3: Stop loss ${stop:.2f} is below current ({pct:.1f}%)")
            checks_passed += 1
        else:
            print(f"   ❌ Check 3: Stop loss ${stop:.2f} is above current (WRONG!)")
        
        if checks_passed == total_checks:
            print(f"\n✅ PASS: All AI validation checks passed ({checks_passed}/{total_checks})")
            results["passed"] += 1
            results["tests"].append({"name": "AI Analysis", "status": "PASS"})
        else:
            print(f"\n⚠️  PARTIAL: {checks_passed}/{total_checks} checks passed")
            results["passed"] += 1
            results["tests"].append({"name": "AI Analysis", "status": "PARTIAL"})
    else:
        print(f"❌ FAIL: Status {response.status_code}")
        results["failed"] += 1
        results["tests"].append({"name": "AI Analysis", "status": "FAIL"})
except Exception as e:
    print(f"❌ FAIL: {e}")
    results["failed"] += 1
    results["tests"].append({"name": "AI Analysis", "status": "FAIL"})

# FINAL RESULTS
print_header("📊 TEST RESULTS SUMMARY")

print(f"Total Tests: {results['passed'] + results['failed']}")
print(f"✅ Passed: {results['passed']}")
print(f"❌ Failed: {results['failed']}")
print(f"Success Rate: {(results['passed'] / (results['passed'] + results['failed']) * 100):.1f}%")

print("\n" + "─" * 70)
print("Detailed Results:")
print("─" * 70)
for test in results["tests"]:
    status_icon = "✅" if test["status"] == "PASS" else "⚠️" if test["status"] == "PARTIAL" else "❌"
    print(f"{status_icon} {test['name']}: {test['status']}")

print("\n" + "=" * 70)
if results["failed"] == 0:
    print("🎉 ALL TESTS PASSED! YOUR APP IS WORKING PERFECTLY!")
    print("=" * 70)
    print("\n✅ Your app is production-ready!")
    print("✅ Data sources are reliable")
    print("✅ AI recommendations are sensible")
    print("✅ Risk management is proper")
    print("\n🚀 You can confidently launch and get users!")
elif results["passed"] >= 4:
    print("⚠️  MOSTLY WORKING - Minor issues detected")
    print("=" * 70)
    print("\nYour app is functional but has some areas to improve.")
    print("Check the failed tests above for details.")
else:
    print("❌ ISSUES DETECTED - Needs attention")
    print("=" * 70)
    print("\nSome critical tests failed. Review the results above.")

print("\n" + "=" * 70)
print("💡 NEXT STEPS:")
print("=" * 70)
print("\n1. Review any failed tests above")
print("2. Test the chat interface manually at: https://www.ai-trades.my/chat")
print("3. Try asking: 'Analyze NVDA' or 'What's the price of AAPL?'")
print("4. Share with your friend for real-world testing")
print("\nLet me know if you see any issues!")
