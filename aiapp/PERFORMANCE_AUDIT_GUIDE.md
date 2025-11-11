# Performance Audit Guide

This guide explains how to run performance audits on the C1 Dashboard and interpret the results.

## Performance Optimizations Implemented

### 1. Code Splitting ✅
- All section components are lazy-loaded using `React.lazy()`
- Suspense boundaries with loading fallbacks prevent blocking
- Reduces initial bundle size significantly

### 2. Memoization ✅
- Risk calculations memoized with `useMemo` in RiskSection
- Chart data transformations memoized in BacktestResults
- Derived metrics memoized in RiskMetrics component
- Prevents unnecessary recalculations on every render

### 3. API Response Caching ✅
- Analysis results cached for 5 minutes in localStorage
- Backtest results cached for 1 hour in localStorage
- Automatic cache cleanup on component mount
- Cache invalidation functions available for manual clearing

## Running Performance Audits

### Option 1: Chrome DevTools Lighthouse

1. **Build the production version:**
   ```bash
   cd aiapp
   npm run build
   npm run start
   ```

2. **Open Chrome DevTools:**
   - Press F12 or right-click → Inspect
   - Navigate to the "Lighthouse" tab

3. **Configure the audit:**
   - Select "Performance" category
   - Choose "Desktop" or "Mobile" device
   - Click "Analyze page load"

4. **Review results:**
   - Target score: 90 or higher
   - Key metrics to check:
     - First Contentful Paint (FCP): < 1.8s
     - Largest Contentful Paint (LCP): < 2.5s
     - Total Blocking Time (TBT): < 200ms
     - Cumulative Layout Shift (CLS): < 0.1
     - Speed Index: < 3.4s

### Option 2: Command Line Lighthouse

1. **Install Lighthouse CLI:**
   ```bash
   npm install -g lighthouse
   ```

2. **Run the audit:**
   ```bash
   # Start the production server first
   cd aiapp
   npm run build
   npm run start

   # In another terminal, run Lighthouse
   lighthouse http://localhost:3000 --view --preset=desktop
   ```

3. **Review the HTML report:**
   - Opens automatically in your browser
   - Shows detailed performance metrics and recommendations

### Option 3: WebPageTest

1. Visit https://www.webpagetest.org/
2. Enter your deployed URL (or use ngrok for local testing)
3. Select test location and browser
4. Run the test and review results

## Performance Metrics Explained

### Core Web Vitals

- **LCP (Largest Contentful Paint):** Time until the largest content element is visible
  - Good: < 2.5s
  - Needs Improvement: 2.5s - 4.0s
  - Poor: > 4.0s

- **FID (First Input Delay):** Time from user interaction to browser response
  - Good: < 100ms
  - Needs Improvement: 100ms - 300ms
  - Poor: > 300ms

- **CLS (Cumulative Layout Shift):** Visual stability during page load
  - Good: < 0.1
  - Needs Improvement: 0.1 - 0.25
  - Poor: > 0.25

### Additional Metrics

- **FCP (First Contentful Paint):** Time until first content appears
- **TTI (Time to Interactive):** Time until page is fully interactive
- **TBT (Total Blocking Time):** Time the main thread is blocked
- **Speed Index:** How quickly content is visually displayed

## Expected Performance Results

With the optimizations implemented, you should see:

### Desktop Performance
- **Performance Score:** 90-100
- **FCP:** 0.5s - 1.0s
- **LCP:** 1.0s - 2.0s
- **TBT:** 50ms - 150ms
- **CLS:** < 0.05

### Mobile Performance
- **Performance Score:** 80-95
- **FCP:** 1.0s - 1.8s
- **LCP:** 2.0s - 2.5s
- **TBT:** 100ms - 200ms
- **CLS:** < 0.1

## Common Performance Issues and Solutions

### Issue: Large JavaScript Bundle
**Solution:** Code splitting is already implemented. Verify with:
```bash
npm run build
# Check .next/static/chunks/ for split bundles
```

### Issue: Slow API Responses
**Solution:** API caching is implemented. Check browser console for cache hits:
```
Using cached analysis results for AAPL
Using cached backtest results for AAPL (2023-01-01 to 2023-12-31)
```

### Issue: Unnecessary Re-renders
**Solution:** Memoization is implemented. Use React DevTools Profiler to verify:
1. Install React DevTools extension
2. Open DevTools → Profiler tab
3. Record a session while interacting with the app
4. Check for unnecessary component renders

### Issue: Large Images
**Solution:** Optimize images:
```bash
# Install sharp for Next.js image optimization
npm install sharp

# Use Next.js Image component
import Image from 'next/image'
```

### Issue: Blocking Third-Party Scripts
**Solution:** Load scripts asynchronously:
```tsx
<Script src="..." strategy="lazyOnload" />
```

## Monitoring Performance in Production

### 1. Real User Monitoring (RUM)
Consider integrating:
- Google Analytics 4 (Web Vitals)
- Vercel Analytics
- New Relic Browser
- Datadog RUM

### 2. Synthetic Monitoring
Set up automated checks:
- Lighthouse CI in GitHub Actions
- WebPageTest API
- Pingdom or UptimeRobot

### 3. Performance Budget
Set thresholds in `next.config.ts`:
```typescript
module.exports = {
  experimental: {
    performanceBudget: {
      maxInitialLoadSize: 200 * 1024, // 200KB
      maxPageLoadSize: 500 * 1024,    // 500KB
    },
  },
}
```

## Verification Checklist

- [ ] Production build created (`npm run build`)
- [ ] Lighthouse audit run (Desktop)
- [ ] Lighthouse audit run (Mobile)
- [ ] Performance score ≥ 90 (Desktop)
- [ ] Performance score ≥ 80 (Mobile)
- [ ] All Core Web Vitals in "Good" range
- [ ] Code splitting verified (multiple chunk files)
- [ ] API caching verified (console logs)
- [ ] Memoization verified (React Profiler)
- [ ] No console errors or warnings

## Next Steps

If performance score is below target:
1. Review Lighthouse recommendations
2. Check Network tab for slow requests
3. Use Performance tab to identify bottlenecks
4. Consider additional optimizations:
   - Image optimization
   - Font optimization
   - Service Worker for offline caching
   - CDN for static assets
   - Database query optimization

## Resources

- [Web.dev Performance](https://web.dev/performance/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
