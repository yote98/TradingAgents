# TradingAgents System Architecture with Coaches

## Complete System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         TRADINGAGENTS SYSTEM                         │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    INTERNAL ANALYSTS (Required)                      │
│                         Automated Agents                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │   Market     │  │ Fundamentals │  │     News     │  │ Social  ││
│  │   Analyst    │  │   Analyst    │  │   Analyst    │  │  Media  ││
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘│
│         │                 │                 │                │      │
│         │ Technical       │ Financials      │ News &         │ Sent.│
│         │ Indicators      │ & Metrics       │ Insider        │ Data │
│         │                 │                 │                │      │
│         └─────────────────┴─────────────────┴────────────────┘      │
│                                   │                                  │
│                                   ▼                                  │
│                          ┌─────────────────┐                        │
│                          │ Analyst Reports │                        │
│                          └─────────┬───────┘                        │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   EXTERNAL COACHES (Optional)                        │
│                      Human Guidance via Discord                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │   Coach D    │  │   Coach I    │  │   Coach S    │  │ Coach N ││
│  │   (Daily)    │  │  (Insights)  │  │ (Sentiment)  │  │(Narrat.)││
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └────┬────┘│
│         │                 │                 │                │      │
│         │ Trading         │ Analysis        │ Positioning    │ Cont.│
│         │ Plans +         │ + Charts        │ + Charts       │ +Cht.│
│         │ Charts          │                 │                │      │
│         │                 │                 │                │      │
│         └─────────────────┴─────────────────┴────────────────┘      │
│                                   │                                  │
│                                   ▼                                  │
│                          ┌─────────────────┐                        │
│                          │  Coach Reports  │                        │
│                          └─────────┬───────┘                        │
└──────────────────────────────────────┬──────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RESEARCH TEAM                                 │
│                    Debate & Recommendation                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐│
│  │     Bull     │ ←──→    │     Bear     │ ←──→    │   Research   ││
│  │  Researcher  │ Debate  │  Researcher  │ Debate  │   Manager    ││
│  └──────────────┘         └──────────────┘         └──────┬───────┘│
│                                                            │         │
│  Considers: Analyst Reports + Coach Guidance              │         │
│                                                            ▼         │
│                                                   ┌─────────────────┐│
│                                                   │  Investment     ││
│                                                   │  Recommendation ││
│                                                   └────────┬────────┘│
└──────────────────────────────────────────────────────────┬──────────┘
                                                            │
                                                            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           TRADER                                     │
│                    Proposes Trading Action                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                          ┌──────────────┐                           │
│                          │    Trader    │                           │
│                          │    Agent     │                           │
│                          └──────┬───────┘                           │
│                                 │                                    │
│                                 ▼                                    │
│                          ┌──────────────┐                           │
│                          │   Trading    │                           │
│                          │   Proposal   │                           │
│                          └──────┬───────┘                           │
└─────────────────────────────────┬───────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      RISK MANAGEMENT                                 │
│                   Evaluate & Approve/Reject                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │    Risky     │  │   Neutral    │  │     Safe     │             │
│  │   Analyst    │  │   Analyst    │  │   Analyst    │             │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘             │
│         │                 │                 │                       │
│         └─────────────────┴─────────────────┘                       │
│                           │                                          │
│                           ▼                                          │
│                    ┌──────────────┐                                 │
│                    │     Risk     │                                 │
│                    │   Manager    │                                 │
│                    └──────┬───────┘                                 │
│                           │                                          │
│                           ▼                                          │
│                    ┌──────────────┐                                 │
│                    │    Final     │                                 │
│                    │   Decision   │                                 │
│                    └──────┬───────┘                                 │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Execute    │
                     │   & Log      │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Discord    │
                     │   Summary    │
                     └──────────────┘
```

## Data Flow

### 1. Internal Analysts (Automated)
```
APIs (yfinance, Alpha Vantage) 
    → Fetch Data 
    → Analyze 
    → Generate Reports
```

### 2. External Coaches (Human)
```
Human Coach 
    → Posts in Discord 
    → Bot Stores Plan + Charts 
    → System Fetches 
    → Summarizes Guidance
```

### 3. Research Team
```
Analyst Reports + Coach Guidance 
    → Bull/Bear Debate 
    → Research Manager Decides 
    → Investment Recommendation
```

### 4. Trading Decision
```
Investment Recommendation 
    → Trader Proposes Action 
    → Risk Team Evaluates 
    → Risk Manager Approves/Rejects 
    → Final Decision
```

## Key Points

### Independence
- **Analysts** = Automated, data-driven, required
- **Coaches** = Human, judgment-based, optional
- Both provide input to research team

### Flexibility
- System works with analysts only
- Coaches can be enabled/disabled
- Select which coaches to use

### Complementary
- Analysts provide data analysis
- Coaches provide human perspective
- Together offer comprehensive view

## Configuration Impact

### Without Coaches
```python
config["enable_coaches"] = False
```
Flow: Analysts → Researchers → Trader → Risk → Decision

### With Coaches
```python
config["enable_coaches"] = True
config["selected_coaches"] = ["coach_d", "coach_i", "coach_s", "coach_n"]
```
Flow: Analysts → Coaches → Researchers → Trader → Risk → Decision

## Component Details

### Internal Analysts
- **Market**: Technical indicators (MACD, RSI, Bollinger Bands)
- **Fundamentals**: Financial statements, metrics, valuations
- **News**: Global news, insider transactions, sentiment
- **Social Media**: Social sentiment, trends, public opinion

### External Coaches
- **Coach D**: Daily trading plans with TradingView/TPO charts
- **Coach I**: Insights and analysis with supporting charts
- **Coach S**: Sentiment and positioning with charts
- **Coach N**: Narrative and market context with charts

### Research Team
- **Bull Researcher**: Argues for buying/holding
- **Bear Researcher**: Argues for selling/avoiding
- **Research Manager**: Judges debate, makes recommendation

### Trading & Risk
- **Trader**: Proposes specific trading action
- **Risk Analysts**: Evaluate from different risk perspectives
- **Risk Manager**: Final approval/rejection

## See Also

- [ANALYSTS_VS_COACHES.md](./ANALYSTS_VS_COACHES.md) - Detailed comparison
- [COACHES_EXPLAINED.md](./COACHES_EXPLAINED.md) - Coach explanation
- [COACH_DISCORD_SETUP.md](./COACH_DISCORD_SETUP.md) - Setup guide
