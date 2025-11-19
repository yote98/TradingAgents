# Free Tier Implementation Plan

## Phase 1: Simple Usage Tracking (No Auth Required)

### Option A: Browser-Based (Easiest - Start Here)
Use localStorage to track daily usage:

```typescript
// lib/usage-tracker.ts
export function checkUsageLimit(): { allowed: boolean; remaining: number } {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('usage');
  const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
  
  // Reset if new day
  if (data.date !== today) {
    data.date = today;
    data.count = 0;
  }
  
  const FREE_TIER_LIMIT = 10;
  const remaining = FREE_TIER_LIMIT - data.count;
  
  return {
    allowed: data.count < FREE_TIER_LIMIT,
    remaining: Math.max(0, remaining)
  };
}

export function incrementUsage() {
  const today = new Date().toDateString();
  const stored = localStorage.getItem('usage');
  const data = stored ? JSON.parse(stored) : { date: today, count: 0 };
  
  if (data.date !== today) {
    data.date = today;
    data.count = 0;
  }
  
  data.count++;
  localStorage.setItem('usage', JSON.stringify(data));
}
```

**Pros:** No backend needed, works immediately
**Cons:** Users can clear localStorage to reset (acceptable for beta)

### Option B: IP-Based Tracking (More Robust)
Track by IP address in your API:

```typescript
// lib/ip-tracker.ts (server-side)
const usageMap = new Map<string, { date: string; count: number }>();

export function checkIPLimit(ip: string): boolean {
  const today = new Date().toDateString();
  const data = usageMap.get(ip) || { date: today, count: 0 };
  
  if (data.date !== today) {
    data.date = today;
    data.count = 0;
  }
  
  return data.count < 10;
}
```

**Pros:** Harder to bypass
**Cons:** Requires server-side tracking

## Phase 2: Add Visual Indicators

### Usage Counter Badge
Add to chat page:
```tsx
<div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg">
  📊 {remaining}/10 analyses left today
</div>
```

### Upgrade Prompt
When limit reached:
```tsx
<div className="text-center p-8">
  <h2>🎯 Daily Limit Reached</h2>
  <p>You've used all 10 free analyses today!</p>
  <button className="bg-gradient-to-r from-blue-600 to-purple-600">
    Upgrade to Pro - Unlimited Analyses
  </button>
</div>
```

## Quick Implementation (5 minutes)

1. Create `lib/usage-tracker.ts` with Option A code
2. Import in `/api/analyze/route.ts`
3. Check limit before analysis
4. Add counter badge to chat page

Want me to implement this now?
