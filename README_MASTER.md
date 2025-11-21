# 📊 AlphaFlow AI - Trading Analysis Platform

> **Elite AI-powered stock analysis with real-time market data and institutional-grade insights**

---

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                               │
│  Next.js Frontend with Real-time Chat & Analysis Display       │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    API LAYER                                    │
│  /api/chat  │  /api/analyze  │  /api/quote  │  /api/debug     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                 5 AI ANALYST TEAM                               │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────────┐  │
│  │ Market   │ Fundamen │  News    │  Social  │  Options     │  │
│  │ Analyst  │ Analyst  │ Analyst  │ Analyst  │  Analyst     │  │
│  │          │          │          │          │              │  │
│  │ Technical│ Valuation│ Sentiment│ Reddit/  │ Flow         │  │
│  │ Analysis │ Metrics  │ Scoring  │ Twitter  │ Analysis     │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────────┘  │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│              STRATEGY AGENT                                     │
│  Synthesizes all analyst reports → Final Recommendation        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│           TRIPLE-REDUNDANT DATA SOURCES                         │
│  Finnhub (Primary) → Alpha Vantage → Alpaca (Fallbacks)       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
TradingAgents/
├── 📱 c1-template/              Frontend & API
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/             API endpoints
│   │   │   │   ├── chat/        Main chat interface
│   │   │   │   ├── analyze/     Stock analysis
│   │   │   │   └── quote/       Quick quotes
│   │   │   ├── chat/            Chat UI
│   │   │   ├── landing/         Landing page
│   │   │   └── portfolio/       Portfolio view
│   │   ├── lib/
│   │   │   ├── agents/          5 AI Analysts
│   │   │   │   ├── orchestrator.ts
│   │   │   │   ├── market-agent.ts
│   │   │   │   ├── fundamental-agent.ts
│   │   │   │   ├── news-agent.ts
│   │   │   │   ├── social-agent.ts
│   │   │   │   ├── options-agent.ts
│   │   │   │   └── strategy-agent.ts
│   │   │   └── data/            Data clients
│   │   │       ├── reliable-quote.ts
│   │   │       ├── marketdata-client.ts
│   │   │       ├── alphavantage-news-client.ts
│   │   │       ├── reddit-client.ts
│   │   │       ├── twitter-client.ts
│   │   │       └── options-client.ts
│   │   └── components/          UI components
│   └── .env                     API keys
│
├── 🤖 tradingagents/            Python backend (optional)
│   ├── agents/                  LangGraph agents
│   ├── dataflows/               Data fetching
│   └── graph/                   Workflow orchestration
│
└── 📚 docs/                     Documentation (this folder)
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd c1-template
npm install
```

### 2. Configure API Keys
```bash
cp .env.example .env
# Edit .env with your keys:
# - THESYS_API_KEY
# - FINNHUB_API_KEY
# - ALPHA_VANTAGE_API_KEY
# - ALPACA_API_KEY
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Browser
```
http://localhost:3000
```

---

## 🎨 Key Features

### ✅ Real-Time Analysis
- Live market data from Finnhub, Alpha Vantage, Alpaca
- Triple-redundant data sources (automatic fallback)
- Current prices, volume, technical indicators

### ✅ 5 AI Analysts
1. **Market Analyst** - Technical patterns, RSI, MACD, trends
2. **Fundamental Analyst** - P/E ratio, earnings, valuation
3. **News Analyst** - Sentiment from news articles
4. **Social Analyst** - Reddit & Twitter sentiment
5. **Options Analyst** - Options flow and unusual activity

### ✅ Strategy Agent
- Synthesizes all analyst reports
- Bull vs Bear debate
- Final recommendation: BUY/HOLD/SELL
- Confidence score & target prices

### ✅ Risk Management
- Stop loss calculations
- Position sizing recommendations
- Risk/reward ratios

---

## 📊 Data Flow

```
User Query: "analyse NVDA"
    ↓
Frontend detects ticker
    ↓
Calls /api/analyze
    ↓
Orchestrator coordinates 5 analysts
    ↓
Each analyst fetches data & analyzes
    ↓
Strategy agent synthesizes reports
    ↓
Returns recommendation
    ↓
AI formats response for user
    ↓
Display in chat interface
```

---

## 🔧 Configuration

### Data Sources (Priority Order)
1. **Finnhub** - Primary (real-time quotes)
2. **Alpha Vantage** - Backup (news, fundamentals)
3. **Alpaca** - Backup (market data)

### AI Provider
- **Current**: Thesys C1 (Anthropic Claude Sonnet 4)
- **Alternative**: Direct OpenAI or Anthropic

---

## 📖 Documentation Index

### Getting Started
- [Quick Start Guide](GET_STARTED_NOW.md)
- [System Architecture](COMPLETE_SYSTEM_ARCHITECTURE.md)
- [API Documentation](API_SOURCES_STATUS.md)

### Development
- [Testing Guide](ANALYST_TESTING_GUIDE.md)
- [Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)
- [Troubleshooting](RECOVERY_PLAN.md)

### Features
- [5 Analyst System](test_5_analysts_data_sources.py)
- [Data Sources](DATA_FLOW_DIAGRAM.md)
- [Risk Management](RISK_MANAGEMENT_COMPLETE.md)

### Issues & Solutions
- [Cache Issue Analysis](CACHE_DIAGNOSIS.md)
- [Thesys Support](THESYS_EMAIL_PROFESSIONAL.md)
- [Data Accuracy](DATA_ACCURACY_ISSUES_SUMMARY.md)

---

## 🎯 Current Status

### ✅ Working
- Backend API (analyze, quote, debug)
- 5 AI analysts
- Triple-redundant data sources
- Real-time price fetching ($180.64 for NVDA)
- Support/resistance calculations
- Risk management

### ⚠️ Known Issues
- **Thesys AI caching** - Returns stale prices in UI
  - Backend returns correct data
  - Issue is with AI provider caching
  - Emailed Thesys support for resolution

### 🔄 Workarounds
- Use "New Chat" for each analysis
- Vary question phrasing
- Backend APIs work perfectly (use /api/analyze directly)

---

## 🚀 Next Steps

1. **Wait for Thesys response** on caching issue
2. **Consider switching** to direct OpenAI/Anthropic
3. **Deploy to production** (Vercel ready)
4. **Add more features** (portfolio tracking, alerts)

---

## 📞 Support

- **Thesys Support**: Emailed about caching issue
- **Documentation**: See docs/ folder
- **Test Scripts**: Run `python test_final_check.py`

---

## 🎉 What You've Built

A sophisticated AI-powered trading analysis platform with:
- 5 specialized AI analysts
- Real-time market data
- Triple-redundant data sources
- Professional UI
- Risk management
- Comprehensive analysis

**You own 90% of this system!** Only the AI provider (Thesys) is external and can be easily replaced.

---

**Built with:** Next.js, TypeScript, OpenAI SDK, Finnhub, Alpha Vantage, Alpaca
