# Landing Page Icon Mapping

## Current Status
The landing page uses emoji icons. Custom AI-generated images are available but experiencing browser caching issues.

## Image Files Location
All images are in: `aiapp/public/icons/`

## Correct Mapping

1. **Market Analysis** (Card 1)
   - Current: 📊 emoji
   - Image file: `market-analysis.png` ✅ WORKING
   - Description: Magnifying glass with colorful bar charts

2. **Multi-Agent System** (Card 2)
   - Current: 🤖 emoji
   - Image file: Should use `nodes-network.png`
   - Description: 3D cube network with connected nodes (cyan/purple)
   - Source: `Gemini_Generated_Image_u2okpou2okpou2ok.png`

3. **Risk Management** (Card 3)
   - Current: 🛡️ emoji
   - Image file: Should use `risk-management.png`
   - Description: Shield icon
   - Source: `Gemini_Generated_Image_vv4v3yvv4v3yvv4v.png`

4. **Backtesting** (Card 4)
   - Current: 📈 emoji
   - Image file: Should use `backtesting.png`
   - Description: Calendar/chart icon
   - Source: `Gemini_Generated_Image_q904ntq904ntq904.png`

## To Enable Images

In `aiapp/src/app/page.tsx`, replace the emoji divs with:

```tsx
<img 
  src="/icons/[filename].png" 
  alt="[Card Name]" 
  style={{
    width: '8rem',
    height: '8rem',
    objectFit: 'contain'
  }} 
/>
```

## Troubleshooting Cache Issues

If images don't update:
1. Hard refresh: `Ctrl + Shift + R`
2. Clear browser cache completely
3. Restart Next.js dev server
4. Try incognito/private browsing mode
5. Add cache-busting query param: `?v=timestamp`
