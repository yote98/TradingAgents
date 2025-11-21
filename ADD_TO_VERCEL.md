# 🚀 ADD THESE TO VERCEL ENVIRONMENT VARIABLES

Go to: https://vercel.com/dashboard
→ Select your project
→ Settings → Environment Variables
→ Add these 3 keys:

## 1. Finnhub (Fastest Source)
```
FINNHUB_API_KEY=d4ftr91r01qgiienar4gd4ftr91r01qgiienar50
```

## 2. Alpaca API Key
```
ALPACA_API_KEY=PKVL3QQYLKPVPPBOD42VGMAJAQ
```

## 3. Alpaca Secret Key
```
ALPACA_SECRET_KEY=41BJBBiFGXr9QCureQtzNkUXN2jf1YMdb8wxTYitc2QP
```

## After Adding:
1. Click "Redeploy" in Vercel
2. Wait 2-3 minutes
3. Test: `python test_production_sources.py`

## Expected Result:
✅ Verification mode will show ALL 3 sources:
- Finnhub: $180.64
- Alpha Vantage: $180.64
- Alpaca: $180.55

✅ Variance: <0.5% (all prices match)
✅ Triple redundancy = bulletproof reliability
✅ No more $12k losses from bad data!

---

## Why This Matters:
- **Finnhub**: Fastest (primary)
- **Alpha Vantage**: Most reliable (backup)
- **Alpaca**: Institutional-grade (final fallback)

If ANY source fails, the system automatically uses the next one.
If ALL sources work, verification mode cross-checks them for accuracy.

This is the same setup professional trading firms use.
