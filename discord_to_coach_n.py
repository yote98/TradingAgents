#!/usr/bin/env python3
"""
Discord Bot to Read Unusual Whales Messages and Send to Coach N
Simple solution - no complex setup needed!
"""

import discord
import json
from datetime import datetime
from pathlib import Path

# Configuration
DISCORD_BOT_TOKEN = "MTQzNDAwOTU0MTQyMjQ4NTY1NQ.G7IcMa.FmWBPkf8SOsltYizuaCeoNtTPNM9bLSQb6KyLQ"
CHANNEL_ID = 1364899537931599916  # Your Unusual Whales channel
STORAGE_FILE = Path("coach_n_signals.json")

# Create Discord client
intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

def save_message(message_data):
    """Save message to file for Coach N to read"""
    # Load existing messages
    if STORAGE_FILE.exists():
        with open(STORAGE_FILE, 'r') as f:
            messages = json.load(f)
    else:
        messages = []
    
    # Add new message
    messages.append(message_data)
    
    # Keep only last 100 messages
    messages = messages[-100:]
    
    # Save
    with open(STORAGE_FILE, 'w') as f:
        json.dump(messages, f, indent=2)
    
    print(f"✅ Saved message: {message_data['content'][:50]}...")

@client.event
async def on_ready():
    """Bot is ready"""
    print(f'✅ Bot logged in as {client.user}')
    print(f'   Listening to channel ID: {CHANNEL_ID}')
    print(f'   Saving messages to: {STORAGE_FILE}')

@client.event
async def on_message(message):
    """When a message is posted"""
    
    # Only listen to the specific channel
    if message.channel.id != CHANNEL_ID:
        return
    
    # Ignore messages from this bot
    if message.author == client.user:
        return
    
    # Check if it's from Unusual Whales
    if 'unusual_whales' in message.author.name.lower():
        
        # Extract message data
        message_data = {
            'content': message.content,
            'author': str(message.author),
            'timestamp': datetime.now().isoformat(),
            'embeds': [
                {
                    'title': embed.title,
                    'description': embed.description,
                    'url': embed.url
                }
                for embed in message.embeds
            ],
            'attachments': [att.url for att in message.attachments]
        }
        
        # Save for Coach N
        save_message(message_data)
        
        print(f"📊 Unusual Whales signal received!")

# Run the bot
if __name__ == "__main__":
    print("=" * 60)
    print("🤖 Discord Bot for Coach N")
    print("=" * 60)
    print("\n⚠️  SETUP REQUIRED:")
    print("1. Create a Discord bot at https://discord.com/developers/applications")
    print("2. Get the bot token")
    print("3. Add bot to your server")
    print("4. Get your channel ID")
    print("5. Update this script with token and channel ID")
    print("\nSee DISCORD_BOT_SETUP_GUIDE.md for detailed instructions!")
    print("=" * 60)
    
    if DISCORD_BOT_TOKEN == "YOUR_BOT_TOKEN_HERE":
        print("\n❌ Bot token not set! Please update the script first.")
    else:
        print("\n🚀 Starting bot...")
        client.run(DISCORD_BOT_TOKEN)
