# Coach Integration Quick Start

Get up and running with coach agents in 5 minutes!

## Quick Setup

### 1. Install Dependencies

```bash
pip install -r requirements-discord.txt
```

### 2. Set Up Discord Bot

1. Go to https://discord.com/developers/applications
2. Create new application → Bot → Copy token
3. Enable "Message Content Intent"
4. Invite bot to your server

### 3. Configure Environment

Add to your `.env` file:

```bash
# Discord Bot Token
DISCORD_BOT_TOKEN=your_bot_token_here

# Your server URL (after deploying the bot server)
DISCORD_TECHNICAL_COACH_WEBHOOK=http://localhost:5000/api/coach-plans/
DISCORD_FUNDAMENTAL_COACH_WEBHOOK=http://localhost:5000/api/coach-plans/
DISCORD_SENTIMENT_COACH_WEBHOOK=http://localhost:5000/api/coach-plans/
DISCORD_MACRO_COACH_WEBHOOK=http://localhost:5000/api/coach-plans/

# Discord webhook for summaries (get from Discord channel settings)
DISCORD_SUMMARY_WEBHOOK=https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN
```

### 4. Start the Discord Bot Server

```bash
python examples/discord_bot_server.py
```

You should see:
```
Bot has connected to Discord!
Starting Flask API server...
```

### 5. Post Coach Plans in Discord

In your Discord channel (attach TradingView/TPO charts as images):

```
!plan d: NVDA showing bullish flag. Watch $950 breakout.
[Attach chart image]

!plan i: Strong earnings expected. Fair value $1000+.
[Attach analysis chart]

!plan s: Retail FOMO building. Watch for exhaustion.
[Attach sentiment chart]

!plan n: Fed meeting this week. Tech sensitive to rates.
[Attach macro chart]
```

### 6. Run TradingAgents with Coaches

```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG
from dotenv import load_dotenv

load_dotenv()

config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]

ta = TradingAgentsGraph(debug=True, config=config)
final_state, decision = ta.propagate("NVDA", "2024-05-10")

print(f"Decision: {decision}")
print(f"Coach D Charts: {final_state.get('coach_d_charts')}")
```

## Discord Commands

- `!plan <d|i|s|n>: <message>` - Post a coach plan (attach chart images)
- `!plans [date]` - List all plans for a date
- `!clear [date]` - Clear plans (admin only)

**Coach Names:**
- `d` = Coach D (Daily trading insights)
- `i` = Coach I (Insights and analysis)
- `s` = Coach S (Sentiment and positioning)
- `n` = Coach N (Narrative and context)

## Testing Without Discord

You can test coaches without Discord by manually setting plans:

```python
config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True

ta = TradingAgentsGraph(debug=True, config=config)

# Manually inject coach plans and charts
init_state = ta.propagator.create_initial_state("NVDA", "2024-05-10")
init_state["coach_d_plan"] = "Watch for breakout above $950"
init_state["coach_d_charts"] = ["https://example.com/chart1.png"]
init_state["coach_i_plan"] = "Strong earnings expected"
init_state["coach_i_charts"] = []

# Continue with normal workflow...
```

## Next Steps

- Read [COACH_DISCORD_SETUP.md](./COACH_DISCORD_SETUP.md) for detailed setup
- Deploy the bot server to a cloud provider (Heroku, AWS, etc.)
- Customize coach prompts in `tradingagents/agents/coaches/`
- Add more coaches for your specific needs

## Troubleshooting

**Bot not responding?**
- Check bot has "Message Content Intent" enabled
- Verify bot has permissions to read/send messages
- Check server logs for errors

**Plans not fetching?**
- Verify server is running: `curl http://localhost:5000/health`
- Check webhook URLs in `.env`
- Test API: `curl "http://localhost:5000/api/coach-plans/?coach=coach_d&date=2024-05-10"`

**No summary in Discord?**
- Verify `DISCORD_SUMMARY_WEBHOOK` is correct
- Test webhook: `curl -X POST -H "Content-Type: application/json" -d '{"content":"Test"}' YOUR_WEBHOOK_URL`
