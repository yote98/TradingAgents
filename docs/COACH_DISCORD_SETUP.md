# Coach Agents with Discord Integration

This guide explains how to set up and use **external coach agents** that receive daily trading plans from Discord.

## ⚠️ Important: Coaches Are External, Not Internal Analysts

**These coaches are INDEPENDENT from the built-in analyst system:**

- ✅ **Coaches** = External human coaches posting daily plans in Discord
- ✅ **Analysts** = Internal automated agents (Market, Fundamentals, News, Social Media)

The coach system **complements** (not replaces) the internal analysts. You can use:
- Internal analysts only (default)
- Internal analysts + external coaches (optional)

See [COACHES_EXPLAINED.md](./COACHES_EXPLAINED.md) for detailed comparison.

## Overview

The coach system adds 4 **external human coaches** who post daily guidance via Discord:

1. **Coach D**: Daily trading insights with TradingView/TPO charts
2. **Coach I**: Insights and analysis with supporting charts
3. **Coach S**: Sentiment and positioning insights with charts
4. **Coach N**: Narrative and market context with charts

Each coach posts their daily plan in Discord (with optional chart attachments), and the system fetches and summarizes their guidance.

## Architecture

```
Discord Channel → Discord Bot → Your Server → TradingAgents
                                    ↓
                              Coach Plans API
                                    ↓
                            Coach Agents Process
                                    ↓
                          Trading Decision Made
                                    ↓
                        Summary Sent to Discord
```

## Setup Instructions

### 1. Discord Bot Setup

First, create a Discord bot to receive messages from your coaches:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Enable "Message Content Intent"
5. Copy the bot token
6. Invite the bot to your server with appropriate permissions

### 2. Server Setup (Required)

Since Discord webhooks are primarily for sending (not receiving), you need a server that:

1. **Receives messages from Discord** via a Discord bot
2. **Stores coach plans** in a database (e.g., PostgreSQL, MongoDB)
3. **Exposes a GET API** for TradingAgents to fetch plans

#### Example Server Implementation (Python/Flask)

```python
from flask import Flask, request, jsonify
from datetime import datetime
import discord
from discord.ext import commands

app = Flask(__name__)

# In-memory storage (use a real database in production)
coach_plans = {}

# Discord bot setup
intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix='!', intents=intents)

@bot.event
async def on_message(message):
    if message.author.bot:
        return
    
    # Parse coach messages
    # Expected format: "!plan d: Watch for breakout above $950" (with optional chart attachments)
    if message.content.startswith('!plan'):
        parts = message.content.split(':', 1)
        if len(parts) == 2:
            coach_type = parts[0].replace('!plan', '').strip().lower()
            plan = parts[1].strip()
            date = datetime.now().strftime('%Y-%m-%d')
            
            # Extract chart attachments
            chart_urls = [att.url for att in message.attachments 
                         if att.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
            
            key = f"coach_{coach_type}_{date}"
            coach_plans[key] = {
                'plan': plan,
                'charts': chart_urls
            }
            
            chart_info = f" with {len(chart_urls)} chart(s)" if chart_urls else ""
            await message.channel.send(f"✅ Plan recorded for Coach {coach_type.upper()}{chart_info}")

# API endpoint for TradingAgents to fetch plans
@app.route('/api/coach-plans/', methods=['GET'])
def get_coach_plan():
    coach = request.args.get('coach')
    date = request.args.get('date', datetime.now().strftime('%Y-%m-%d'))
    
    key = f"{coach}_{date}"
    plan_data = coach_plans.get(key, {"plan": "No plan available for today", "charts": []})
    
    return jsonify(plan_data)

# Run both Flask and Discord bot
if __name__ == '__main__':
    import threading
    
    # Run Discord bot in a separate thread
    def run_bot():
        bot.run('YOUR_DISCORD_BOT_TOKEN')
    
    bot_thread = threading.Thread(target=run_bot)
    bot_thread.start()
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5000)
```

### 3. TradingAgents Configuration

Update your `.env` file:

```bash
# Discord Bot Token
DISCORD_BOT_TOKEN=your_discord_bot_token_here

# Discord webhook URLs (point to your server)
DISCORD_COACH_D_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_COACH_I_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_COACH_S_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_COACH_N_WEBHOOK=https://your-server.com/api/coach-plans/

# Discord webhook for sending summaries (actual Discord webhook URL)
DISCORD_SUMMARY_WEBHOOK=https://discord.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_WEBHOOK_TOKEN
```

### 4. Enable Coaches in Code

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()

# Enable coaches
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]

# Initialize with coaches
ta = TradingAgentsGraph(debug=True, config=config)

# Run trading workflow
final_state, decision = ta.propagate("NVDA", "2024-05-10")

# Access coach reports with charts
print(final_state.get("coach_d_report"))  # Coach D's analysis
print(final_state.get("coach_d_charts"))  # Chart URLs from Coach D
```

## Discord Usage

### Posting Daily Plans

In your Discord channel, coaches post their daily plans with chart attachments:

```
!plan d: NVDA showing bullish flag pattern. Watch for breakout above $950 with volume confirmation. Support at $920.
[Attach TradingView chart showing the pattern]

!plan i: NVDA earnings next week. Expect strong data center revenue. Fair value estimate $1000-1050.
[Attach analysis charts]

!plan s: Social media sentiment extremely bullish (8/10). Retail FOMO building. Watch for exhaustion signals.
[Attach sentiment charts]

!plan n: Fed meeting this week. Watch for hawkish/dovish signals. Tech sector sensitive to rate expectations.
[Attach macro context charts]
```

**Note**: Coaches are identified by single letters (d, i, s, n) for quick posting. You can attach multiple chart images (PNG, JPG, etc.) to each plan.

### Receiving Trading Summaries

After each trading decision, TradingAgents sends a summary back to Discord:

```
📊 Trading Summary - NVDA
Date: 2024-05-10
Action: BUY
Decision: Strong technical setup with fundamental support. Risk managed appropriately.
```

## Workflow Integration

The coaches are integrated into the workflow as follows:

1. **Data Collection** (Analysts gather market data)
2. **Coach Guidance** ← NEW! (Coaches provide daily insights)
3. **Research Debate** (Bull/Bear researchers debate)
4. **Trading Decision** (Trader proposes action)
5. **Risk Management** (Risk team evaluates)
6. **Final Decision** (Risk manager approves/rejects)
7. **Discord Summary** ← NEW! (Results sent to Discord)

## Advanced Configuration

### Selective Coach Usage

Use only specific coaches:

```python
config["selected_coaches"] = ["coach_d", "coach_n"]  # Only Coach D and Coach N
```

### Disable Coaches

```python
config["enable_coaches"] = False
```

### Custom Coach Implementation

Create your own coach by following the pattern in `tradingagents/agents/coaches/`:

```python
from langchain_core.prompts import ChatPromptTemplate

def create_custom_coach(llm):
    def custom_coach_node(state):
        ticker = state["company_of_interest"]
        discord_plan = state.get("custom_coach_plan", "")
        
        # Your custom logic here
        
        return {
            "messages": [result],
            "custom_coach_report": result.content,
        }
    
    return custom_coach_node
```

## Troubleshooting

### Coaches not receiving plans

- Check that your server is running and accessible
- Verify Discord bot has proper permissions
- Check server logs for errors
- Test the API endpoint directly: `curl https://your-server.com/api/coach-plans/?coach=technical_coach&date=2024-05-10`

### Plans not showing in reports

- Verify `enable_coaches` is set to `True`
- Check that coach names match exactly (e.g., "technical_coach" not "technical")
- Look for error messages in the TradingAgents debug output

### Discord summaries not sending

- Verify `DISCORD_SUMMARY_WEBHOOK` is a valid Discord webhook URL
- Check that the webhook has permissions to post in the channel
- Test the webhook directly using curl

## Best Practices

1. **Daily Routine**: Have coaches post their plans before market open
2. **Consistent Format**: Use the `!plan <coach>: <message>` format
3. **Concise Plans**: Keep plans focused and actionable (2-3 key points)
4. **Date Awareness**: Plans are date-specific; post fresh plans daily
5. **Backup Plans**: If Discord is down, coaches can be disabled without breaking the system

## Security Considerations

- Keep Discord bot tokens secure (use environment variables)
- Implement authentication on your server API
- Use HTTPS for all communications
- Rate limit API endpoints to prevent abuse
- Don't expose sensitive trading data in Discord summaries

## Future Enhancements

Potential improvements to the coach system:

- Voice channel integration for real-time coaching
- Historical plan analysis and performance tracking
- Multi-language support for international coaches
- Integration with other platforms (Slack, Telegram, etc.)
- Automated plan generation using LLMs
