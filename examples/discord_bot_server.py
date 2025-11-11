"""
Discord Bot Server for Coach Plans

This server:
1. Runs a Discord bot that listens for coach plan messages
2. Stores plans in memory (or database)
3. Exposes a REST API for TradingAgents to fetch plans

Setup:
1. Install dependencies: pip install discord.py flask
2. Set DISCORD_BOT_TOKEN environment variable
3. Run: python discord_bot_server.py
"""

import os
import discord
from discord.ext import commands
from flask import Flask, request, jsonify
from datetime import datetime
import threading
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app for API
app = Flask(__name__)

# In-memory storage (use Redis or database in production)
coach_plans = {}

# Discord bot setup
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)


@bot.event
async def on_ready():
    logger.info(f'{bot.user} has connected to Discord!')
    logger.info(f'Bot is in {len(bot.guilds)} guilds')


@bot.event
async def on_message(message):
    # Ignore bot's own messages
    if message.author.bot:
        return
    
    # Process commands
    await bot.process_commands(message)
    
    # Parse coach plan messages
    # Expected format: "!plan d: Watch for breakout above $950" (with optional chart attachments)
    if message.content.startswith('!plan'):
        try:
            # Split by first colon
            parts = message.content.split(':', 1)
            if len(parts) != 2:
                await message.channel.send("❌ Invalid format. Use: `!plan <coach>: <plan>` (attach charts if needed)")
                return
            
            # Extract coach type and plan
            coach_type = parts[0].replace('!plan', '').strip().lower()
            plan = parts[1].strip()
            
            # Validate coach type (now using single letters)
            valid_coaches = ['d', 'i', 's', 'n']
            if coach_type not in valid_coaches:
                await message.channel.send(
                    f"❌ Invalid coach. Use one of: {', '.join(valid_coaches)} (Coach D, I, S, or N)"
                )
                return
            
            # Extract chart attachments (TradingView, TPO charts, etc.)
            chart_urls = []
            if message.attachments:
                for attachment in message.attachments:
                    # Check if it's an image
                    if any(attachment.filename.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg', '.gif', '.webp']):
                        chart_urls.append(attachment.url)
                        logger.info(f"Chart attached: {attachment.filename}")
            
            # Store plan with date and charts
            date = datetime.now().strftime('%Y-%m-%d')
            key = f"coach_{coach_type}_{date}"
            coach_plans[key] = {
                'plan': plan,
                'charts': chart_urls,
                'author': str(message.author),
                'timestamp': datetime.now().isoformat(),
                'channel': str(message.channel)
            }
            
            logger.info(f"Stored plan for Coach {coach_type.upper()} on {date} with {len(chart_urls)} chart(s)")
            
            # Confirm to user
            chart_info = f" with {len(chart_urls)} chart(s)" if chart_urls else ""
            await message.channel.send(
                f"✅ Plan recorded for **Coach {coach_type.upper()}** on {date}{chart_info}\n"
                f"Preview: {plan[:100]}{'...' if len(plan) > 100 else ''}"
            )
            
        except Exception as e:
            logger.error(f"Error processing plan: {e}")
            await message.channel.send(f"❌ Error processing plan: {str(e)}")


@bot.command(name='plans')
async def list_plans(ctx, date: str = None):
    """List all coach plans for a specific date."""
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    
    plans_for_date = {k: v for k, v in coach_plans.items() if date in k}
    
    if not plans_for_date:
        await ctx.send(f"No plans found for {date}")
        return
    
    response = f"📋 **Coach Plans for {date}**\n\n"
    for key, data in plans_for_date.items():
        # Extract coach letter (d, i, s, n)
        coach_letter = key.split('_')[1].upper()
        response += f"**Coach {coach_letter}** (by {data['author']}):\n"
        response += f"{data['plan']}\n"
        if data.get('charts'):
            response += f"📊 {len(data['charts'])} chart(s) attached\n"
        response += "\n"
    
    await ctx.send(response)


@bot.command(name='clear')
async def clear_plans(ctx, date: str = None):
    """Clear plans for a specific date (admin only)."""
    # Check if user has admin permissions
    if not ctx.author.guild_permissions.administrator:
        await ctx.send("❌ You need administrator permissions to clear plans")
        return
    
    if date is None:
        date = datetime.now().strftime('%Y-%m-%d')
    
    keys_to_delete = [k for k in coach_plans.keys() if date in k]
    for key in keys_to_delete:
        del coach_plans[key]
    
    await ctx.send(f"✅ Cleared {len(keys_to_delete)} plans for {date}")


# Flask API endpoints
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'bot_connected': bot.is_ready(),
        'plans_count': len(coach_plans)
    })


@app.route('/api/coach-plans/', methods=['GET'])
def get_coach_plan():
    """
    Get coach plan and charts for a specific coach and date.
    
    Query params:
    - coach: Coach name (e.g., "coach_d")
    - date: Date in YYYY-MM-DD format (defaults to today)
    """
    coach = request.args.get('coach', '')
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    # Build key
    key = f"{coach}_{date}"
    
    # Get plan
    plan_data = coach_plans.get(key)
    
    if plan_data:
        return jsonify({
            'plan': plan_data['plan'],
            'charts': plan_data.get('charts', []),
            'author': plan_data['author'],
            'timestamp': plan_data['timestamp']
        })
    else:
        return jsonify({
            'plan': f"No plan available for {coach} on {date}",
            'charts': []
        })


@app.route('/api/coach-plans/all', methods=['GET'])
def get_all_plans():
    """
    Get all coach plans and charts for a specific date.
    
    Query params:
    - date: Date in YYYY-MM-DD format (defaults to today)
    """
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    plans_for_date = {}
    for k, v in coach_plans.items():
        if date in k:
            coach_key = k.replace(f'_{date}', '')
            plans_for_date[coach_key] = {
                'plan': v['plan'],
                'charts': v.get('charts', [])
            }
    
    return jsonify(plans_for_date)


def run_discord_bot():
    """Run the Discord bot."""
    token = os.getenv('DISCORD_BOT_TOKEN')
    if not token:
        logger.error("DISCORD_BOT_TOKEN not found in environment variables")
        return
    
    try:
        bot.run(token)
    except Exception as e:
        logger.error(f"Error running Discord bot: {e}")


def run_flask_app():
    """Run the Flask API server."""
    port = int(os.getenv('FLASK_PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)


if __name__ == '__main__':
    logger.info("Starting Discord Bot Server...")
    
    # Run Discord bot in a separate thread
    bot_thread = threading.Thread(target=run_discord_bot, daemon=True)
    bot_thread.start()
    
    # Give bot time to connect
    import time
    time.sleep(3)
    
    # Run Flask app in main thread
    logger.info("Starting Flask API server...")
    run_flask_app()
