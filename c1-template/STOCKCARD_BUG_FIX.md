# StockCard Rendering Bug - Fix Required

## Problem
The StockCard component is being rendered as raw text instead of as an interactive component:
```
<StockCard ticker="AAPL" price={268.55} recommendation="HOLD" ... />
```

Instead of rendering as an actual card UI.

## Root Cause
The C1Chat component from TheSys GenUI SDK doesn't know about our custom StockCard component. We need to register it properly with the SDK.

## Solution Options

### Option 1: Use GenUI SDK Component Registry (Recommended)
Check TheSys GenUI SDK documentation for how to register custom components. Likely needs:

```typescript
import { registerComponent } from '@thesysai/genui-sdk';
import StockCard from './components/StockCard';

registerComponent('StockCard', StockCard);
```

### Option 2: Use Built-in C1 Components
Check if C1 template has built-in component support. May need to:
1. Place components in a specific directory (e.g., `src/components/genui/`)
2. Export them from an index file
3. Configure in a registry file

### Option 3: Modify Chat API Response Format
Instead of returning JSX syntax, return a structured format that C1Chat can parse:

```typescript
{
  type: 'component',
  name: 'StockCard',
  props: {
    ticker: 'AAPL',
    price: 268.55,
    recommendation: 'HOLD',
    ...
  }
}
```

### Option 4: Use Markdown with Embedded Data
Return markdown with data attributes that get hydrated client-side:

```markdown
:::stockcard{ticker="AAPL" price="268.55"}
:::
```

## Immediate Workaround
Until we fix the component registration, we can:
1. Have the AI describe the stock data in a formatted table
2. Use the existing StockPriceDisplay component
3. Return JSON data that gets rendered by a wrapper component

## Files to Check
- `@thesysai/genui-sdk` documentation
- `c1-template` example components
- `src/app/api/chat/route.ts` - response format
- `src/app/chat/page.tsx` - C1Chat configuration

## Next Steps
1. Check TheSys GenUI SDK docs for component registration
2. Look at c1-template examples for custom components
3. Test with a simple component first
4. Apply fix to all chart components

## Temporary Fix Applied
- Removed invalid `customComponents` prop from C1Chat
- Need to find correct way to register components with TheSys SDK
