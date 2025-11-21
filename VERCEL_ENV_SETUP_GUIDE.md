# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

## Step-by-Step Instructions

### 1. Go to Vercel Dashboard
Open: https://vercel.com/dashboard

### 2. Select Your Project
Click on your project (the one deployed at ai-trades.my)

### 3. Go to Settings
Click "Settings" in the top navigation

### 4. Click "Environment Variables"
In the left sidebar, click "Environment Variables"

### 5. Add These 3 Variables

#### Variable 1: FINNHUB_API_KEY
```
Key:   FINNHUB_API_KEY
Value: d4ftr91r01qgiienar4gd4ftr91r01qgiienar50
```
- Click "Add"
- Select: Production, Preview, Development (all 3)
- Click "Save"

#### Variable 2: ALPACA_API_KEY
```
Key:   ALPACA_API_KEY
Value: PKVL3QQYLKPVPPBOD42VGMAJAQ
```
- Click "Add"
- Select: Production, Preview, Development (all 3)
- Click "Save"

#### Variable 3: ALPACA_SECRET_KEY
```
Key:   ALPACA_SECRET_KEY
Value: 41BJBBiFGXr9QCureQtzNkUXN2jf1YMdb8wxTYitc2QP
```
- Click "Add"
- Select: Production, Preview, Development (all 3)
- Click "Save"

### 6. Redeploy
- Go to "Deployments" tab
- Click the "..." menu on the latest deployment
- Click "Redeploy"
- Wait 2-3 minutes

### 7. Test It!
Run this command:
```bash
python test_production_sources.py
```

---

## ✅ Expected Results After Setup

### Before (Current):
```
📡 Source: Alpha Vantage (Real-time)
💰 Price: $180.64
```

### After (Triple Redundancy):
```
📡 Active Sources:
   - Finnhub: $180.64
   - Alpha Vantage: $180.64
   - Alpaca: $180.55
📊 Variance: 0.0498% ✅ RELIABLE
```

---

## 🎯 Why This Matters

**Current Setup:**
- ✅ 1 source (Alpha Vantage)
- ⚠️ If it fails, everything fails

**After Setup:**
- ✅ 3 sources (Finnhub, Alpha Vantage, Alpaca)
- ✅ If one fails, automatically uses next
- ✅ Verification mode cross-checks all 3
- ✅ <0.5% variance = bulletproof accuracy
- ✅ Same setup professional trading firms use

**No more $12k losses from bad data!**

---

## 🆘 Need Help?

If you get stuck, just tell me which step and I'll help you through it.

The whole process takes about 2 minutes.
