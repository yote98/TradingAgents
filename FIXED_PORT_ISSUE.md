# ✅ Fixed: Port Issue

## The Problem

Your dev server runs on **port 3002**, but the code was trying to fetch from **port 3000**:

```typescript
// ❌ Wrong
const baseUrl = 'http://localhost:3000';
```

This caused the `ECONNREFUSED` error you saw.

## The Fix

Updated both files to use the correct port:

### 1. Chat Route
**File**: `c1-template/src/app/api/chat/route.ts`
```typescript
// ✅ Fixed
const baseUrl = 'http://localhost:3002';
```

### 2. Tool
**File**: `c1-template/src/app/api/chat/tools/financialDatasets.ts`
```typescript
// ✅ Fixed
const baseUrl = 'http://localhost:3002';
```

## Test It Now

```bash
# Restart dev server
cd c1-template
npm run dev

# Open browser
http://localhost:3002

# Ask
"What's NVDA price?"
```

Should work now! 🎉

## What You'll See

### In Browser
```
"NVDA is currently trading at $180.45..."
```

### In Console
```
📝 User message: "What's NVDA price?"
🎯 FOUND 1 TICKER(S): NVDA
📡 Fetching from http://localhost:3002/api/quote?symbol=NVDA
✅ Got data: { price: 180.45, ... }
```

No more `ECONNREFUSED` errors! 🚀
