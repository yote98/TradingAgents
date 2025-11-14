#!/usr/bin/env python3
"""
Safe Discord Webhook Test - Step by Step
No scary stuff, just a simple test!
"""

import requests
import json
from datetime import datetime

# STEP 1: Put your Discord webhook URL here
# (We'll walk through getting this together)
WEBHOOK_URL = "https://discord.com/api/webhooks/1438885334065615011/LRHjCbvIzBqX0f8hCoT9HYXKtBYX1HDRFWgFhsrNyQFs9IeMvT50VAd_9wN2IShYkpUU"
def test_simple_message():
    """Send a super simple test message"""
    
    # Check if webhook is set
    if "PASTE_YOUR_WEBHOOK_URL_HERE" in WEBHOOK_URL:
        print("\n❌ Webhook URL not set yet!")
        print("\n📝 Here's what to do:")
        print("1. Go to your Discord server")
        print("2. Right-click any channel → 'Edit Channel'")
        print("3. Click 'Integrations' → 'Webhooks' → 'New Webhook'")
        print("4. Click 'Copy Webhook URL'")
        print("5. Paste it in this file where it says PASTE_YOUR_WEBHOOK_URL_HERE")
        print("\nThen run this script again!")
        return
    
    print("\n🚀 Sending test message to Discord...")
    
    # Simple message - nothing fancy
    message = {
        "content": "✅ Hello from TradingAgents! This is a test message."
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=message, timeout=10)
        
        if response.status_code == 204:
            print("✅ SUCCESS! Check your Discord channel!")
            print("   You should see the test message there.")
        elif response.status_code == 404:
            print("❌ Webhook URL not found. Double-check the URL.")
        else:
            print(f"⚠️  Got response code: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏱️  Request timed out. Check your internet connection.")
    except requests.exceptions.ConnectionError:
        print("🌐 Connection error. Check your internet connection.")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_fancy_message():
    """Send a prettier message with colors"""
    
    if "PASTE_YOUR_WEBHOOK_URL_HERE" in WEBHOOK_URL:
        print("❌ Set your webhook URL first!")
        return
    
    print("\n🎨 Sending fancy message to Discord...")
    
    message = {
        "embeds": [{
            "title": "🎉 TradingAgents Connected!",
            "description": "Your system is working perfectly!",
            "color": 0x00ff00,  # Green color
            "fields": [
                {
                    "name": "Status",
                    "value": "✅ All systems go!",
                    "inline": True
                },
                {
                    "name": "Time",
                    "value": datetime.now().strftime("%H:%M:%S"),
                    "inline": True
                }
            ]
        }]
    }
    
    try:
        response = requests.post(WEBHOOK_URL, json=message, timeout=10)
        
        if response.status_code == 204:
            print("✅ Fancy message sent! Check Discord!")
        else:
            print(f"⚠️  Response: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("=" * 50)
    print("🎮 DISCORD WEBHOOK TEST - SAFE & SIMPLE")
    print("=" * 50)
    
    # Test 1: Simple message
    test_simple_message()
    
    # Test 2: Fancy message (only if first test worked)
    if "PASTE_YOUR_WEBHOOK_URL_HERE" not in WEBHOOK_URL:
        print("\n" + "=" * 50)
        input("Press ENTER to send a fancy message...")
        test_fancy_message()
    
    print("\n" + "=" * 50)
    print("✅ Test complete!")
    print("=" * 50)
