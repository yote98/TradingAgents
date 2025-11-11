# Coach Names Update - Coach D, I, S, N

## Summary of Changes

The coach agents have been renamed from descriptive names to single-letter identifiers for easier Discord posting:

### New Coach Names

| Old Name | New Name | Focus Area |
|----------|----------|------------|
| Technical Coach | **Coach D** | Daily trading insights with TradingView/TPO charts |
| Fundamental Coach | **Coach I** | Insights and analysis with supporting charts |
| Sentiment Coach | **Coach S** | Sentiment and positioning insights with charts |
| Macro Coach | **Coach N** | Narrative and market context with charts |

## Key Features

### Chart Support
All coaches now support **chart attachments** from Discord:
- TradingView charts
- TPO (Time Price Opportunity) charts
- Custom analysis charts
- Any image format (PNG, JPG, JPEG, GIF, WEBP)

### Discord Usage

**Posting Plans:**
```
!plan d: NVDA showing bullish flag. Watch $950 breakout.
[Attach TradingView chart image]

!plan i: Strong earnings expected. Fair value $1000+.
[Attach analysis chart]

!plan s: Retail FOMO building. Watch for exhaustion.
[Attach sentiment chart]

!plan n: Fed meeting this week. Tech sensitive to rates.
[Attach macro chart]
```

**Commands:**
- `!plan <d|i|s|n>: <message>` - Post plan with optional chart attachments
- `!plans [date]` - List all plans for a date
- `!clear [date]` - Clear plans (admin only)

## Configuration Changes

### Environment Variables (.env)
```bash
# Old names (still work for backward compatibility)
DISCORD_TECHNICAL_COACH_WEBHOOK=...
DISCORD_FUNDAMENTAL_COACH_WEBHOOK=...
DISCORD_SENTIMENT_COACH_WEBHOOK=...
DISCORD_MACRO_COACH_WEBHOOK=...

# New names (recommended)
DISCORD_COACH_D_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_COACH_I_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_COACH_S_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_COACH_N_WEBHOOK=https://your-server.com/api/coach-plans/
DISCORD_SUMMARY_WEBHOOK=https://discord.com/api/webhooks/...
```

### Code Configuration
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph
from tradingagents.default_config import DEFAULT_CONFIG

config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True

# New coach names
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]

# Or select specific coaches
config["selected_coaches"] = ["coach_d", "coach_s"]  # Only D and S

ta = TradingAgentsGraph(debug=True, config=config)
final_state, decision = ta.propagate("NVDA", "2024-05-10")

# Access coach reports and charts
print(final_state.get("coach_d_report"))
print(final_state.get("coach_d_charts"))  # List of chart URLs
```

## State Fields

### New State Fields
```python
# Plans from Discord
coach_d_plan: str
coach_i_plan: str
coach_s_plan: str
coach_n_plan: str

# Chart URLs from Discord
coach_d_charts: list
coach_i_charts: list
coach_s_charts: list
coach_n_charts: list

# Generated reports
coach_d_report: str
coach_i_report: str
coach_s_report: str
coach_n_report: str
```

## API Changes

### Discord Bot Server API

**Endpoint:** `GET /api/coach-plans/`

**Request:**
```
GET /api/coach-plans/?coach=coach_d&date=2024-05-10
```

**Response:**
```json
{
  "plan": "NVDA showing bullish flag. Watch $950 breakout.",
  "charts": [
    "https://cdn.discordapp.com/attachments/.../chart1.png",
    "https://cdn.discordapp.com/attachments/.../chart2.png"
  ],
  "author": "CoachD#1234",
  "timestamp": "2024-05-10T09:30:00"
}
```

## Backward Compatibility

The old coach names still work for backward compatibility:
- `"technical"` → maps to Coach D
- `"fundamental"` → maps to Coach I
- `"sentiment"` → maps to Coach S
- `"macro"` → maps to Coach N

```python
# This still works
config["selected_coaches"] = ["technical", "fundamental"]
# Internally maps to ["coach_d", "coach_i"]
```

## Migration Guide

### For Existing Users

1. **Update .env file:**
   ```bash
   # Add new webhook URLs
   DISCORD_COACH_D_WEBHOOK=...
   DISCORD_COACH_I_WEBHOOK=...
   DISCORD_COACH_S_WEBHOOK=...
   DISCORD_COACH_N_WEBHOOK=...
   ```

2. **Update config:**
   ```python
   # Old
   config["selected_coaches"] = ["technical", "fundamental", "sentiment", "macro"]
   
   # New (recommended)
   config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]
   ```

3. **Update Discord commands:**
   ```
   # Old
   !plan technical: Your analysis
   
   # New
   !plan d: Your analysis
   [Attach chart]
   ```

4. **Update state access:**
   ```python
   # Old
   final_state.get("technical_coach_report")
   
   # New
   final_state.get("coach_d_report")
   final_state.get("coach_d_charts")  # New: access charts
   ```

## Benefits of New System

1. **Faster Discord Posting**: Single letter commands (`!plan d:`) vs full words
2. **Chart Support**: Attach TradingView/TPO charts directly to plans
3. **Cleaner Naming**: Coach D, I, S, N are memorable and professional
4. **Better Organization**: Charts stored separately from text plans
5. **Backward Compatible**: Old code continues to work

## Example Workflow

1. **Morning Routine** - Coaches post plans in Discord:
   ```
   !plan d: ES showing support at 5800. Watch for bounce. [Chart attached]
   !plan i: Tech earnings strong. Maintain long bias. [Chart attached]
   !plan s: VIX elevated. Caution on entries. [Chart attached]
   !plan n: Fed minutes today at 2pm. Watch yields. [Chart attached]
   ```

2. **TradingAgents Runs** - Fetches plans and charts automatically

3. **Coaches Provide Context** - Each coach analyzes with their chart context

4. **Trading Decision Made** - Informed by all coach insights

5. **Summary Sent to Discord** - Results posted back to channel

## Files Updated

- `tradingagents/agents/coaches/*.py` - All coach implementations
- `tradingagents/agents/__init__.py` - Export new coach names
- `tradingagents/agents/utils/agent_states.py` - New state fields
- `tradingagents/default_config.py` - New webhook config
- `tradingagents/graph/setup.py` - Coach node naming
- `tradingagents/integrations/discord_webhook.py` - Chart support
- `examples/discord_bot_server.py` - Chart attachment handling
- `.env.example` - New environment variables
- All documentation files updated

## Testing

```python
# Test without Discord
config = DEFAULT_CONFIG.copy()
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d"]

ta = TradingAgentsGraph(debug=True, config=config)

# Manually inject plan and charts
init_state = ta.propagator.create_initial_state("NVDA", "2024-05-10")
init_state["coach_d_plan"] = "Watch for breakout above $950"
init_state["coach_d_charts"] = [
    "https://example.com/tradingview-chart.png",
    "https://example.com/tpo-chart.png"
]

# Run workflow
final_state, decision = ta.propagate("NVDA", "2024-05-10")
print(final_state.get("coach_d_report"))
```

## Next Steps

1. Update your Discord bot with the new command format
2. Train coaches to use single-letter commands
3. Start attaching TradingView/TPO charts to plans
4. Monitor chart URLs in coach reports
5. Provide feedback on the new system
