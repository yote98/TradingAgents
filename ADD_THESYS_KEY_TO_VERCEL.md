# 🔑 Add THESYS_API_KEY to Vercel

## Problem

The chat API is failing with 500 error because `THESYS_API_KEY` is not set in Vercel environment variables.

## Solution

Add the THESYS_API_KEY to your Vercel project:

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/dashboard
2. Select your project: **trading-agents-roan**
3. Click **Settings** tab
4. Click **Environment Variables** in left sidebar
5. Click **Add New**
6. Set:
   - **Key:** `THESYS_API_KEY`
   - **Value:** `sk-th-0h5HIeJx7xYlMbXxs1wuC0wzRyqaWk8suygFlGtSPzcCxE69JzxrYoHmz0iQj1SkG69mIaUsIZkq5FzDOoK0p52ptUn9ooELJYMC`
   - **Environments:** Check all (Production, Preview, Development)
7. Click **Save**
8. **Redeploy** the project (Vercel will prompt you)

### Option 2: Via Vercel CLI

```bash
vercel env add THESYS_API_KEY
# Paste the key when prompted
# Select: Production, Preview, Development
```

Then redeploy:
```bash
vercel --prod
```

## After Adding

1. Wait for redeployment (1-2 minutes)
2. Test with:
   ```bash
   python test_production_final.py
   ```

## Expected Result

```
✅ WORKING: https://trading-agents-roan.vercel.app
```

---

**Current Status:**
- ✅ Health endpoint working
- ✅ Quote endpoint working  
- ❌ Chat endpoint failing (missing THESYS_API_KEY)
