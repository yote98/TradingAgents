# Chart Rendering Fix

## Problem
Charts were rendering as plain text/tables instead of visual components after we switched StockCard to markdown format.

## Root Cause
When we changed StockCard from JSX (`<StockCard ... />`) to markdown format, the AI interpreted this as "all components should be text now" and stopped rendering charts as visual components.

## Solution
Updated system prompt to clearly distinguish between two types of components:

### 1. Stock Cards → Markdown Format
```markdown
**AAPL - Apple Inc.**

**Current Price:** $267.46
**Recommendation:** HOLD
**Confidence:** 73%
**Target Price:** $280.83
**Stop Loss:** $254.09
```

### 2. Charts → Component Syntax
```jsx
<PriceLineChart 
  data={[
    { date: "2024-01", price: 150.25, volume: 45000000 },
    { date: "2024-02", price: 155.50, volume: 48000000 }
  ]}
  title="AAPL 6-Month Price Trend"
  showArea={true}
/>
```

## Key Changes

### System Prompt Updates
- Added clear section: "RULE #1.5: USE CHARTS AND GRAPHS - RENDER AS COMPONENTS!"
- Emphasized: "Charts MUST be rendered as actual components, NOT as text or tables!"
- Added distinction:
  - Stock Cards = Markdown
  - Charts = Component syntax
- Provided examples of proper chart rendering

## Available Chart Components

1. **PriceLineChart** - Price trends over time
   ```jsx
   <PriceLineChart 
     data={[{date, price, volume}]}
     title="..."
     showArea={true}
   />
   ```

2. **PerformanceComparisonChart** - Compare multiple stocks
   ```jsx
   <PerformanceComparisonChart 
     data={[{name: "AAPL"}, {name: "MSFT"}]}
     metrics={["return", "volatility"]}
     title="..."
   />
   ```

3. **SectorPerformanceChart** - Sector returns
   ```jsx
   <SectorPerformanceChart 
     data={[{sector: "Technology", return: 15.2}]}
   />
   ```

4. **PortfolioPieChart** - Allocations
   ```jsx
   <PortfolioPieChart 
     data={[{name: "Tech", value: 40, color: "#3b82f6"}]}
     title="..."
   />
   ```

5. **MarketPulse** - Full market dashboard
   ```jsx
   <MarketPulse 
     topMovers={[...]}
     sectorData={[...]}
     macroHighlights={[...]}
   />
   ```

## Testing

Test these prompts to verify charts render properly:

1. **Price Chart**
   ```
   Show me AAPL's price trend over the last 6 months
   ```
   ✅ Should show: Card + PriceLineChart (visual graph)

2. **Comparison Chart**
   ```
   Compare AAPL and MSFT performance with a chart
   ```
   ✅ Should show: 2 Cards + PerformanceComparisonChart (visual bars)

3. **Market Overview**
   ```
   What's happening in the market today?
   ```
   ✅ Should show: MarketPulse component (full dashboard)

4. **Sector Analysis**
   ```
   Show me sector performance
   ```
   ✅ Should show: SectorPerformanceChart (visual bars)

## What Should NOT Happen

❌ **Charts as Text Tables:**
```
| Date | Price |
|------|-------|
| Jan  | 150   |
| Feb  | 155   |
```

❌ **Charts as Bullet Points:**
```
- January: $150.25
- February: $155.50
```

✅ **Charts as Visual Components:**
[Actual rendered chart with bars/lines/pie slices]

## Files Modified

- `c1-template/src/app/api/chat/systemPrompts.ts` - Added chart rendering instructions

## Why This Works

TheSys has built-in support for chart components through the component schemas defined in `route.ts`. The AI just needs clear instructions on:
1. WHEN to use charts (price trends, comparisons, etc.)
2. HOW to render them (component syntax, not text)
3. WHAT format to use (Stock Cards = markdown, Charts = components)

By making this distinction explicit, the AI knows to:
- Use markdown for stock information cards
- Use component syntax for visual charts
- Never render charts as plain text

## Next Steps

1. Test all chart types
2. Verify they render as visual components
3. Check that stock cards still work (markdown format)
4. Ensure both can coexist in the same response
