"""
Check Bitcoin's ACTUAL current price and your position
"""
import yfinance as yf
from datetime import datetime

def check_bitcoin_position():
    print("🔍 BITCOIN POSITION CHECK")
    print("=" * 70)
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    # Your position
    entry_price = 103107
    print(f"\n📊 YOUR POSITION:")
    print(f"   Entry Price: ${entry_price:,.2f}")
    
    # Get current Bitcoin price
    try:
        btc = yf.Ticker("BTC-USD")
        current_price = btc.info.get('regularMarketPrice')
        
        if current_price:
            print(f"   Current Price: ${current_price:,.2f}")
            
            # Calculate P&L
            pnl = current_price - entry_price
            pnl_pct = (pnl / entry_price) * 100
            
            print(f"\n💰 PROFIT/LOSS:")
            print(f"   P&L: ${pnl:,.2f}")
            print(f"   P&L %: {pnl_pct:+.2f}%")
            
            if pnl < 0:
                print(f"\n❌ YOU ARE IN THE RED")
                print(f"   Loss: ${abs(pnl):,.2f} ({abs(pnl_pct):.2f}%)")
            else:
                print(f"\n✅ YOU ARE IN PROFIT")
                print(f"   Gain: ${pnl:,.2f} ({pnl_pct:.2f}%)")
            
            # Reality check on $1M claim
            print(f"\n" + "=" * 70)
            print("💡 REALITY CHECK ON $1M CLAIM")
            print("=" * 70)
            
            # How much would you need to invest to make $1M?
            target_profit = 1_000_000
            
            if pnl > 0:
                # If in profit, calculate position size needed
                position_size_for_1m = target_profit / pnl
                investment_needed = position_size_for_1m * entry_price
                
                print(f"\nTo make $1M at current price:")
                print(f"   You'd need to buy: {position_size_for_1m:,.2f} BTC")
                print(f"   Investment needed: ${investment_needed:,.2f}")
                print(f"   That's {investment_needed/1_000_000:.1f} MILLION dollars!")
            else:
                print(f"\n⚠️  You're currently LOSING money, not making it!")
                print(f"   Bitcoin would need to reach ${entry_price + (target_profit / 1):,.2f}")
                print(f"   to make $1M on 1 BTC")
                print(f"   That's a {((target_profit / entry_price) * 100):.0f}% gain!")
            
            # What Bitcoin price would give you $1M on 1 BTC?
            price_for_1m = entry_price + target_profit
            gain_needed = ((price_for_1m - entry_price) / entry_price) * 100
            
            print(f"\n📈 FOR $1M PROFIT ON 1 BTC:")
            print(f"   Bitcoin needs to reach: ${price_for_1m:,.2f}")
            print(f"   That's a {gain_needed:.0f}% gain from your entry")
            print(f"   Current price: ${current_price:,.2f}")
            print(f"   Still need: ${price_for_1m - current_price:,.2f} more")
            
        else:
            print("❌ Could not fetch current Bitcoin price")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "=" * 70)
    print("⚠️  IMPORTANT DISCLAIMER")
    print("=" * 70)
    print("""
1. NO AI can guarantee profits or predict exact prices
2. Trading is RISKY - you can lose money
3. Past performance does NOT guarantee future results
4. Always use stop-losses to protect your capital
5. Never invest more than you can afford to lose
6. AI predictions are ESTIMATES, not guarantees

🎯 BOTTOM LINE:
If an AI told you that you'd make $1M, it was either:
- Hallucinating (making up numbers)
- Misunderstood (you misread the prediction)
- Using wrong data
- Not considering risk properly

ALWAYS verify AI predictions with real market data!
""")

if __name__ == "__main__":
    check_bitcoin_position()
