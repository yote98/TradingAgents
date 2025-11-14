#!/usr/bin/env python3
"""
Signals Coach - Posts Trading Signals to Discord
Simple demo of how a coach would work
"""

import requests
from datetime import datetime

# Your Discord webhook (already tested and working!)
WEBHOOK_URL = "https://discord.com/api/webhooks/1438885334065615011/LRHjCbvIzBqX0f8hCoT9HYXKtBYX1HDRFWgFhsrNyQFs9IeMvT50VAd_9wN2IShYkpUU"

def send_trading_signal(ticker, signal_type, price, reason, confidence):
    """
    Send a trading signal to Discord
    
    Args:
        ticker: Stock symbol (e.g., "AAPL")
        signal_type: "BUY", "SELL", or "HOLD"
        price: Current price
        reason: Why this signal
        confidence: "HIGH", "MEDIUM", or "LOW"
    """
    
    # Choose color based on signal
    colors = {
        "BUY": 0x00ff00,   # Green
        "SELL": 0xff0000,  # Red
        "HOLD": 0xffaa00   # Orange
    }
    
    # Choose emoji based on signal
    emojis = {
        "BUY": "🚀",
        "SELL": "⚠️",
        "HOLD": "⏸️"
    }
    
    message = {
        "embeds": [{
            "title": f"{emojis[signal_type]} {signal_type} Signal: {ticker}",
            "description": reason,
            "color": colors[signal_type],
            "fields": [
                {
                    "name": "💰 Current Price",
                    "value": f"${price}",
                    "inline": True
                },
                {
                    "name": "📊 Confidence",
                    "value": confidence,
                    "inline": True
                },
                {
                    "name": "⏰ Time",
                    "value": datetime.now().strftime("%H:%M:%S"),
                    "inline": True
                }
            ],
            "footer": {
                "text": "TradingAgents Signals Coach"
            },
            "timestamp": datetime.now().isoformat()
        }]
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=message, timeout=10)
        if response.status_code == 204:
            print(f"✅ {signal_type} signal for {ticker} sent to Discord!")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def send_analysis_summary(ticker, analysis_data):
    """
    Send a complete analysis summary to Discord
    
    Args:
        ticker: Stock symbol
        analysis_data: Dict with analysis results
    """
    
    message = {
        "embeds": [{
            "title": f"📈 Analysis Complete: {ticker}",
            "description": f"Full multi-agent analysis for {ticker}",
            "color": 0x1f77b4,  # Blue
            "fields": [
                {
                    "name": "🎯 Recommendation",
                    "value": analysis_data.get('recommendation', 'N/A'),
                    "inline": False
                },
                {
                    "name": "💵 Price",
                    "value": f"${analysis_data.get('price', 'N/A')}",
                    "inline": True
                },
                {
                    "name": "📊 Sentiment",
                    "value": analysis_data.get('sentiment', 'N/A'),
                    "inline": True
                },
                {
                    "name": "⚖️ Risk Level",
                    "value": analysis_data.get('risk', 'N/A'),
                    "inline": True
                },
                {
                    "name": "📝 Summary",
                    "value": analysis_data.get('summary', 'Analysis complete'),
                    "inline": False
                }
            ],
            "footer": {
                "text": "TradingAgents Analysis"
            },
            "timestamp": datetime.now().isoformat()
        }]
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=message, timeout=10)
        if response.status_code == 204:
            print(f"✅ Analysis for {ticker} sent to Discord!")
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

# Demo signals
if __name__ == "__main__":
    print("=" * 60)
    print("🎯 SIGNALS COACH - Discord Integration Demo")
    print("=" * 60)
    
    # Example 1: BUY signal
    print("\n📤 Sending BUY signal...")
    send_trading_signal(
        ticker="AAPL",
        signal_type="BUY",
        price="175.50",
        reason="Strong upward momentum + positive earnings",
        confidence="HIGH"
    )
    
    input("\nPress ENTER to send SELL signal...")
    
    # Example 2: SELL signal
    print("\n📤 Sending SELL signal...")
    send_trading_signal(
        ticker="TSLA",
        signal_type="SELL",
        price="242.80",
        reason="Overbought conditions + resistance level",
        confidence="MEDIUM"
    )
    
    input("\nPress ENTER to send analysis summary...")
    
    # Example 3: Full analysis
    print("\n📤 Sending analysis summary...")
    send_analysis_summary(
        ticker="NVDA",
        analysis_data={
            'recommendation': 'STRONG BUY',
            'price': '495.20',
            'sentiment': 'Very Bullish',
            'risk': 'Medium',
            'summary': 'AI sector leader with strong fundamentals and positive momentum'
        }
    )
    
    print("\n" + "=" * 60)
    print("✅ Demo complete! Check your Discord channel!")
    print("=" * 60)
