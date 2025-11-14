#!/usr/bin/env python3
"""
Setup Signals Coach with Your Discord Webhook
Quick and easy configuration!
"""

import os
from pathlib import Path

# Your Discord webhook URL (already tested and working!)
WEBHOOK_URL = "https://discord.com/api/webhooks/1438885334065615011/LRHjCbvIzBqX0f8hCoT9HYXKtBYX1HDRFWgFhsrNyQFs9IeMvT50VAd_9wN2IShYkpUU"

def setup_env_file():
    """Add the webhook to your .env file"""
    
    env_file = Path(".env")
    
    # Read existing .env if it exists
    existing_content = ""
    if env_file.exists():
        with open(env_file, 'r') as f:
            existing_content = f.read()
    
    # Check if webhook is already configured
    if "DISCORD_COACH_SIGNALS_WEBHOOK" in existing_content:
        print("✅ Signals coach webhook already configured in .env")
        return
    
    # Add the webhook configuration
    webhook_config = f"""
# Signals Coach Discord Webhook
DISCORD_COACH_SIGNALS_WEBHOOK={WEBHOOK_URL}

# Optional: Add more coach webhooks here
# DISCORD_COACH_D_WEBHOOK=your_webhook_url_here
# DISCORD_COACH_I_WEBHOOK=your_webhook_url_here
# DISCORD_COACH_S_WEBHOOK=your_webhook_url_here
# DISCORD_COACH_N_WEBHOOK=your_webhook_url_here
"""
    
    with open(env_file, 'a') as f:
        f.write(webhook_config)
    
    print("✅ Added signals coach webhook to .env file!")
    print(f"   Webhook: {WEBHOOK_URL[:50]}...")

def create_signals_coach_demo():
    """Create a demo script to test the signals coach"""
    
    demo_script = '''#!/usr/bin/env python3
"""
Signals Coach Demo - Send Trading Signals to Discord
"""

import os
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get webhook from environment
WEBHOOK_URL = os.getenv("DISCORD_COACH_SIGNALS_WEBHOOK")

def send_signal(ticker, action, price, reason):
    """Send a trading signal to Discord"""
    
    if not WEBHOOK_URL:
        print("❌ DISCORD_COACH_SIGNALS_WEBHOOK not set in .env")
        return
    
    # Color based on action
    colors = {
        "BUY": 0x00ff00,   # Green
        "SELL": 0xff0000,  # Red
        "HOLD": 0xffaa00   # Orange
    }
    
    message = {
        "embeds": [{
            "title": f"📊 {action} Signal: {ticker}",
            "description": reason,
            "color": colors.get(action, 0x1f77b4),
            "fields": [
                {
                    "name": "💰 Price",
                    "value": f"${price}",
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
            print(f"✅ {action} signal for {ticker} sent to Discord!")
        else:
            print(f"❌ Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("🎯 Signals Coach Demo")
    print("=" * 50)
    
    # Example signals
    send_signal("AAPL", "BUY", "175.50", "Strong momentum + positive earnings")
    
    print("\\nCheck your Discord channel!")
'''
    
    with open("demo_signals_coach.py", 'w') as f:
        f.write(demo_script)
    
    print("✅ Created demo_signals_coach.py")
    print("   Run it with: python demo_signals_coach.py")

def show_next_steps():
    """Show what to do next"""
    
    print("\n" + "=" * 60)
    print("🎉 SETUP COMPLETE!")
    print("=" * 60)
    print("\n📋 What's configured:")
    print("   ✅ Discord webhook added to .env")
    print("   ✅ Demo script created")
    print("\n🚀 Next steps:")
    print("   1. Test the demo:")
    print("      python demo_signals_coach.py")
    print("\n   2. Use in your TradingAgents:")
    print("      - The webhook is now available as DISCORD_COACH_SIGNALS_WEBHOOK")
    print("      - Any script can use it to send signals to Discord")
    print("\n   3. Create more webhooks:")
    print("      - Create different webhooks for different types of signals")
    print("      - Add them to .env with different names")
    print("=" * 60)

if __name__ == "__main__":
    print("🔧 Setting up Signals Coach with Discord")
    print("=" * 60)
    
    setup_env_file()
    create_signals_coach_demo()
    show_next_steps()
