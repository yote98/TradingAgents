# 🎨 Quick Start: Using Logos

## Import the Component

```tsx
import { TickerLogo } from '@/components/TickerLogo';
```

## Basic Usage

```tsx
// Stock logo
<TickerLogo ticker="AAPL" size="md" />

// Crypto logo
<TickerLogo ticker="BTC-USD" size="lg" />
```

## Size Options

```tsx
<TickerLogo ticker="TSLA" size="sm" />  // 24x24px
<TickerLogo ticker="TSLA" size="md" />  // 32x32px (default)
<TickerLogo ticker="TSLA" size="lg" />  // 48x48px
<TickerLogo ticker="TSLA" size="xl" />  // 64x64px
```

## With Custom Fallback

```tsx
<TickerLogo 
  ticker="UNKNOWN" 
  size="lg"
  fallback={<div>No logo available</div>}
/>
```

## In a Card

```tsx
<div className="flex items-center gap-3">
  <TickerLogo ticker="NVDA" size="lg" />
  <div>
    <h3 className="text-xl font-bold">NVDA</h3>
    <p className="text-gray-400">$495.22</p>
  </div>
</div>
```

## Supported Tickers

### Stocks (40+)
AAPL, TSLA, MSFT, GOOGL, NVDA, META, AMZN, JPM, V, WMT, MA, DIS, NFLX, PYPL, UBER, and more...

### Crypto (36+)
BTC-USD, ETH-USD, BNB-USD, SOL-USD, ADA-USD, DOGE-USD, MATIC-USD, DOT-USD, AVAX-USD, and more...

## Test Page

Visit `/test-logos` to see all logos in action:
- https://TradingAgents.vercel.app/test-logos

## How It Works

1. **Primary**: Clearbit Logo API (free, no auth)
2. **Fallback**: Google Favicons (always works)
3. **Fallback**: DuckDuckGo Icons
4. **Fallback**: Gradient circle with ticker initial

## Features

✅ Automatic loading state  
✅ Error handling with fallback  
✅ Works for stocks and crypto  
✅ No broken images  
✅ TypeScript support  
✅ Responsive sizing  

## That's It!

Just import and use. The component handles everything else automatically.
