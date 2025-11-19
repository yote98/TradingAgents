# Market Pulse Component Guide

## Overview
The MarketPulse component creates a comprehensive market dashboard similar to TheSys UI, showing top movers, sector performance, and macro highlights all in one view.

## Component Features

### 1. Header Banner
- Yellow gradient banner with market briefing message
- Professional disclaimer text

### 2. Top Movers Cards (3 Cards)
- **Top Gainer**: Biggest percentage gainer with green styling
- **Pullback**: Biggest loser with red styling  
- **Outperformer**: Second-best performer

Each card shows:
- Percentage change (large, bold)
- Company name
- Ticker and sector

### 3. Sector Heat Chart
- Bar chart showing sector performance
- Green bars for positive returns
- Red bars for negative returns
- Integrated SectorPerformanceChart component

### 4. Top Movers Table
- Up to 10 stocks in a clean table
- Columns: Ticker, Name, Sector, Price, Change%
- Color-coded changes (green/red)
- Hover effects for interactivity

### 5. Macro Highlights
- Bullet-point list of key market insights
- Positioned at the top for quick scanning

## Usage Example

```tsx
<MarketPulse 
  topMovers={[
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      sector: "Tech",
      price: 191.40,
      change: 7.20,
      changePercent: 3.8
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp.",
      sector: "Tech",
      price: 496.20,
      change: 12.50,
      changePercent: 2.6
    },
    {
      ticker: "XOM",
      name: "Exxon Mobil",
      sector: "Energy",
      price: 101.10,
      change: -2.40,
      changePercent: -2.3
    }
  ]}
  sectorData={[
    { sector: "Info Tech", return: 3.2 },
    { sector: "Health Care", return: 2.5 },
    { sector: "Comm Services", return: 2.1 },
    { sector: "Financials", return: 1.8 },
    { sector: "Energy", return: -0.5 }
  ]}
  macroHighlights={[
    "Biggest intraday movers highlighted by sector (synthetic sample data due to live-feed limits)",
    "Sector heat shows leadership shifting toward Tech and Communication Services; Energy lags",
    "Macro: risk-on bias with yields easing; watch inflation prints and Fed-speak for direction"
  ]}
/>
```

## When to Use

The AI should use MarketPulse when users ask:
- "What's happening in the market?"
- "Give me a market overview"
- "Market briefing"
- "Show me market pulse"
- "What are the top movers today?"
- "Market summary"

## Data Requirements

### Minimum Data
- At least 3 stocks in `topMovers` array
- At least 3 sectors in `sectorData` array

### Optional Data
- `macroHighlights` can be empty (component will hide the section)
- More than 10 stocks in `topMovers` (only first 10 shown in table)

## Design Philosophy

**Matches TheSys UI:**
- Dark theme with gray-900 background
- Yellow accent for important information
- Green/red color coding for performance
- Clean typography and spacing
- Professional table design
- Card-based layout for key metrics

**Responsive:**
- 3-column cards on desktop
- 2-column chart/table layout on large screens
- Stacks vertically on mobile

## Integration with AI

The AI automatically knows to use this component when:
1. User asks for market overview
2. Multiple stocks need to be displayed
3. Sector analysis is requested
4. Comprehensive market snapshot is needed

The component combines multiple data visualizations into one cohesive dashboard, making it perfect for "big picture" market analysis.

## Technical Details

**Dependencies:**
- SectorPerformanceChart component
- Recharts library (for the embedded chart)
- Tailwind CSS for styling

**Location:** `c1-template/src/components/MarketPulse.tsx`

**Props Interface:**
```typescript
interface MarketPulseProps {
  topMovers?: TopMover[];
  sectorData?: Array<{ sector: string; return: number }>;
  macroHighlights?: string[];
}
```

## Example AI Prompts

Try these prompts to see MarketPulse in action:

1. "Give me a market briefing"
2. "What's the market pulse today?"
3. "Show me top movers and sector performance"
4. "Market overview with macro highlights"
5. "What's happening in the market right now?"

The AI will generate appropriate data and render the MarketPulse component with real-time information.
