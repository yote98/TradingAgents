# 🔧 Vercel Environment Variable Troubleshooting

## Problem Confirmed

The health check shows: `THESYS_API_KEY: False`

This means the environment variable is **NOT set** in Vercel.

## Solution: Add THESYS_API_KEY Correctly

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Select Project**
   - Click on **trading-agents** (not trading-agents-boli)

3. **Go to Settings**
   - Click the **Settings** tab at the top

4. **Open Environment Variables**
   - In the left sidebar, click **Environment Variables**

5. **Add New Variable**
   - Click the **Add New** button (or **Add Another** if you see variables)

6. **Fill in the Details**
   - **Key (Name):** `THESYS_API_KEY`
   - **Value:** `sk-th-0h5HIeJx7xYlMbXxs1wuC0wzRyqaWk8suygFlGtSPzcCxE69JzxrYoHmz0iQj1SkG69mIaUsIZkq5FzDOoK0p52ptUn9ooELJYMC`
   - **Environments:** Check ALL THREE boxes:
     - ✅ Production
     - ✅ Preview
     - ✅ Development

7. **Save**
   - Click **Save** button

8. **Redeploy**
   - Vercel will ask if you want to redeploy
   - Click **Redeploy** or go to Deployments tab and click **Redeploy** on the latest deployment

## Verify It Worked

After redeployment completes (1-2 minutes), run:

```bash
python test_vercel_health.py
```

You should see:
```
'THESYS_API_KEY': True  ✅
```

Then test the chat:
```bash
python test_production_final.py
```

## Common Mistakes to Avoid

❌ **Wrong project** - Make sure you're in "trading-agents" not "trading-agents-boli"
❌ **Typo in key name** - Must be exactly `THESYS_API_KEY` (case-sensitive)
❌ **Missing environments** - Must check all 3 boxes (Production, Preview, Development)
❌ **Forgot to redeploy** - Changes only take effect after redeployment

---

**Current Status:**
- ✅ Code is correct (Thesys integration working locally)
- ✅ Deployment successful
- ❌ THESYS_API_KEY not set in Vercel (this is the only issue)
