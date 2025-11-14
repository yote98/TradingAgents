# TradingAgents System Workflow - Visual Guide

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INITIATES ANALYSIS                       │
│                                                                  │
│  Python CLI:  python demo_complete_system.py                    │
│  Web UI:      localhost:3000 (C1Chat - Currently Broken)        │
│  Test Page:   localhost:3000/test-chat-stream.html (Works!)    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    STEP 1: DATA GATHERING                        │
│                    (Internal Analysts)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Market     │  │ Fundamentals │  │     News     │         │
│  │   Analyst    │  │   Analyst    │  │   Analyst    │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                   │
│    yfinance         Alpha Vantage      RSS Feeds               │
│    Technical        Financial          News APIs               │
│    Indicators       Statements         Insider Data            │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                      │
│                           ▼                                      │
│                  ┌─────────────────┐                           │
│                  │ Analyst Reports │                           │
│                  │  (JSON Data)    │                           │
│                  └────────┬────────┘                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 2: HUMAN GUIDANCE (Optional)                   │
│                    (External Coaches)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Human Coach → Discord Post → Bot Stores → System Fetches       │
│                                                                  │
│  Coach Types:                                                    │
│  • Coach D: Daily trading plans + charts                        │
│  • Coach I: Insights & analysis + charts                        │
│  • Coach S: Sentiment & positioning + charts                    │
│  • Coach N: Narrative & context + charts                        │
│                           │                                      │
│                           ▼                                      │
│                  ┌─────────────────┐                           │
│                  │  Coach Guidance │                           │
│                  │  (Text + URLs)  │                           │
│                  └────────┬────────┘                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                STEP 3: RESEARCH & DEBATE                         │
│                    (LangGraph Workflow)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input: Analyst Reports + Coach Guidance                        │
│                           │                                      │
│                           ▼                                      │
│         ┌─────────────────────────────────┐                    │
│         │      Bull Researcher             │                    │
│         │  "Here's why we should BUY"      │                    │
│         └──────────┬──────────────────────┘                    │
│                    │                                             │
│                    ▼                                             │
│         ┌─────────────────────────────────┐                    │
│         │         DEBATE                   │                    │
│         │  (Multiple rounds possible)      │                    │
│         └──────────┬──────────────────────┘                    │
│                    │                                             │
│                    ▼                                             │
│         ┌─────────────────────────────────┐                    │
│         │      Bear Researcher             │                    │
│         │  "Here's why we should SELL"     │                    │
│         └──────────┬──────────────────────┘                    │
│                    │                                             │
│                    ▼                                             │
│         ┌─────────────────────────────────┐                    │
│         │     Research Manager             │                    │
│         │  Judges debate → Recommendation  │                    │
│         └──────────┬──────────────────────┘                    │
│                    │                                             │
│                    ▼                                             │
│           ┌─────────────────┐                                  │
│           │  Investment      │                                  │
│           │  Recommendation  │                                  │
│           │  (BUY/SELL/HOLD) │                                  │
│           └────────┬─────────┘                                  │
└────────────────────┬──────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                STEP 4: TRADING PROPOSAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                  ┌──────────────┐                               │
│                  │    Trader    │                               │
│                  │    Agent     │                               │
│                  └──────┬───────┘                               │
│                         │                                        │
│  Proposes specific action:                                      │
│  • Action: BUY/SELL/HOLD                                        │
│  • Quantity: Number of shares                                   │
│  • Price target: Entry/exit points                             │
│  • Reasoning: Why this action                                   │
│                         │                                        │
│                         ▼                                        │
│                  ┌──────────────┐                               │
│                  │   Trading    │                               │
│                  │   Proposal   │                               │
│                  └──────┬───────┘                               │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              STEP 5: RISK EVALUATION                             │
│                  (Multi-perspective)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Three risk analysts evaluate the proposal:                     │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │    Risky     │  │   Neutral    │  │     Safe     │         │
│  │   Analyst    │  │   Analyst    │  │   Analyst    │         │
│  │              │  │              │  │              │         │
│  │ "Too risky!" │  │ "Balanced"   │  │ "Too safe"   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                   │
│         └─────────────────┴─────────────────┘                   │
│                           │                                      │
│                           ▼                                      │
│                  ┌─────────────────┐                           │
│                  │  Risk Manager   │                           │
│                  │  Final Decision │                           │
│                  └────────┬────────┘                           │
│                           │                                      │
│                           ▼                                      │
│                  ┌─────────────────┐                           │
│                  │  APPROVE or     │                           │
│                  │  REJECT         │                           │
│                  └────────┬────────┘                           │
└───────────────────────────┬──────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  STEP 6: OUTPUT & LOGGING                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Results saved to:                                              │
│  • eval_results/{ticker}/full_states_log_{date}.json           │
│  • Console output (if using CLI)                               │
│  • Discord summary (if configured)                             │
│                                                                  │
│  Contains:                                                      │
│  • All analyst reports                                          │
│  • Debate transcripts                                           │
│  • Trading proposal                                             │
│  • Risk evaluation                                              │
│  • Final decision + reasoning                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Details

### 1. Market Analyst
```
yfinance API → Price data, volume, technical indicators
           → Calculate: MACD, RSI, Bollinger Bands, Moving Averages
           → Generate: Market Report (JSON)
```

### 2. Fundamentals Analyst
```
Alpha Vantage API → Financial statements, metrics
                 → Calculate: P/E, P/S, Debt ratios, Growth rates
                 → Generate: Fundamentals Report (JSON)
```

### 3. News Analyst
```
RSS Feeds + News APIs → Recent news articles
                      → Insider transactions
                      → Sentiment analysis
                      → Generate: News Report (JSON)
```

### 4. Social Media Analyst
```
Twitter API → Social sentiment
           → Trending topics
           → Volume metrics
           → Generate: Social Report (JSON)
```

### 5. Coach Integration (Optional)
```
Discord Channel → Human posts trading plan + charts
               → Bot stores: text + image URLs + timestamp
               → System fetches relevant plans
               → Summarizes: Coach guidance
```

### 6. Research Debate
```
All Reports → Bull Researcher: "Buy because..."
           → Bear Researcher: "Sell because..."
           → Multiple debate rounds
           → Research Manager: Final recommendation
```

### 7. Risk Management
```
Trading Proposal → Risky Analyst: High-risk perspective
                → Neutral Analyst: Balanced view
                → Safe Analyst: Conservative view
                → Risk Manager: Approve/Reject
```

## Configuration Points

### Enable/Disable Coaches
```python
config["enable_coaches"] = True/False
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]
```

### Select Analysts
```python
config["selected_analysts"] = ["market", "fundamentals", "news", "social"]
```

### Debate Rounds
```python
config["max_debate_rounds"] = 3  # Number of bull/bear exchanges
```

### LLM Models
```python
config["deep_think_llm"] = "o1-preview"  # For complex reasoning
config["quick_think_llm"] = "gpt-4o-mini"  # For simple tasks
```

## Entry Points

### Python CLI (Works)
```bash
python demo_complete_system.py
# or
python -m cli.main
```

### Web UI (Broken - C1Chat issue)
```
localhost:3000
Click "Launch AI" → Type message → Error
```

### Test Page (Works)
```
localhost:3000/test-chat-stream.html
Click "Test Chat Stream" → Works perfectly
```

### Direct Python
```python
from tradingagents.graph.trading_graph import TradingAgentsGraph

graph = TradingAgentsGraph(config={
    "enable_coaches": False,
    "max_debate_rounds": 2
})

result = graph.analyze_stock("AAPL")
print(result["final_decision"])
```

## Key Files

### Core System
- `tradingagents/graph/trading_graph.py` - Main orchestration
- `tradingagents/graph/setup.py` - Graph configuration
- `tradingagents/agents/` - All analyst implementations
- `tradingagents/dataflows/` - Data fetching layer

### Web UI (Broken Part)
- `aiapp/src/app/page.tsx` - Landing page with C1Chat
- `aiapp/src/app/api/chat/route.ts` - Chat API (works)
- `aiapp/public/test-chat-stream.html` - Test page (works)

### Configuration
- `tradingagents/default_config.py` - System defaults
- `.env` - API keys (root)
- `aiapp/.env.local` - Next.js API keys

## Current Status

✅ **Working:**
- All 4 internal analysts
- Data fetching from APIs
- Research debate system
- Risk management
- Python CLI
- Test page streaming

❌ **Broken:**
- C1Chat component integration
- Web UI at localhost:3000

**The core system is 100% functional. Only the web chat UI has an integration bug.**
