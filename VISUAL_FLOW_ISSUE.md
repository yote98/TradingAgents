# Visual Flow - Where Old Data Gets Stuck 🎨

## 🎬 The Complete Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                            │
│                                                                 │
│  Session 1 (10 minutes ago):                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ User: "analyse NVDA"                                     │  │
│  │ ThreadId: abc-123                                        │  │
│  │ Response: $146.76 (was correct at that time)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Session 2 (NOW):                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ User: "analyse NVDA" again                               │  │
│  │ ThreadId: abc-123 (SAME THREAD!)                         │  │
│  │ Expected: $180.64                                        │  │
│  │ Got: $146.76 (OLD DATA)                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    /api/chat/route.ts                           │
│                                                                 │
│  messageStore[abc-123] contains:                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ [0] System: "You are a trading assistant..."            │  │
│  │ [1] User: "analyse NVDA"                                │  │
│  │ [2] System: "NVDA Price: $146.76" (OLD!)                │  │
│  │ [3] Assistant: "NVDA analysis... $146.76..."            │  │
│  │ [4] User: "analyse NVDA" (NEW REQUEST)                  │  │
│  │ [5] System: "NVDA Price: $180.64" (NEW!) ✅             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  🔴 PROBLEM: Messages [2] and [5] CONFLICT!                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Thesys AI (C1 LLM)                           │
│                                                                 │
│  Receives ALL messages in thread:                              │
│  - Sees $146.76 from message [2]                               │
│  - Sees $180.64 from message [5]                               │
│                                                                 │
│  🤔 Which one to use?                                           │
│  - Might use the first one (older)                             │
│  - Might get confused                                          │
│  - Might average them                                          │
│                                                                 │
│  🔴 Returns response with $146.76 (OLD DATA)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND RENDERS                             │
│                                                                 │
│  Shows: $146.76 ❌                                              │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Side-by-Side Comparison

### What SHOULD Happen:
```
Request 1 (Thread A):
  User: "analyse NVDA"
  API: Gets $146.76 (correct at time T1)
  AI: Returns $146.76 ✅

Request 2 (Thread B - NEW THREAD):
  User: "analyse NVDA"
  API: Gets $180.64 (correct at time T2)
  AI: Returns $180.64 ✅
```

### What IS Happening:
```
Request 1 (Thread A):
  User: "analyse NVDA"
  API: Gets $146.76
  AI: Returns $146.76 ✅
  messageStore[A] = [$146.76 data]

Request 2 (Thread A - SAME THREAD):
  User: "analyse NVDA"
  API: Gets $180.64
  messageStore[A] = [$146.76 data, $180.64 data] ⚠️
  AI: Sees BOTH, uses $146.76 ❌
```

## 🎯 The Root Cause

```
┌──────────────────────────────────────┐
│   messageStore (In-Memory Cache)     │
│                                      │
│   Thread abc-123:                    │
│   ├─ Message 1: $146.76 (10 min ago)│
│   ├─ Message 2: AI response          │
│   ├─ Message 3: $180.64 (NOW)       │
│   └─ Message 4: AI response (uses?) │
│                                      │
│   🔴 Old data never expires!         │
└──────────────────────────────────────┘
```

## 🔧 The Fix

### Option A: Force New Thread (User Action)
```
1. Refresh page (gets new threadId)
2. Type "analyse NVDA"
3. Should work ✅
```

### Option B: Clear Old Stock Data (Code Fix)
```typescript
// In /api/chat/route.ts
if (tickerMatches) {
  // Remove old stock data messages before adding new ones
  const filteredMessages = messageStore.messageList.filter(
    msg => !msg.content?.includes('REAL-TIME DATA')
  );
  messageStore.messageList = filteredMessages;
  
  // Now add fresh data
  messageStore.addMessage(dataMessage);
}
```

### Option C: Use Timestamp in System Message (Already Done)
```typescript
// Already in the code:
content: `🚨 REAL-TIME DATA (${new Date().toISOString()}) 🚨`

// But AI might ignore timestamps
```

## 🧪 Test Right Now

**In your browser:**

1. Open DevTools (F12)
2. Go to Application tab
3. Clear all storage
4. Refresh page
5. Type "analyse NVDA"
6. Check if you get $180.64

If YES → It's the thread accumulation issue
If NO → It's something else (browser cache, Thesys cache)

## 📊 Data Flow Visualization

```
Time T1 (10 minutes ago):
  Market Price: $146.76
  API Returns: $146.76 ✅
  AI Shows: $146.76 ✅
  messageStore: [$146.76]

Time T2 (NOW):
  Market Price: $180.64
  API Returns: $180.64 ✅
  AI Shows: $146.76 ❌ (using old data from messageStore)
  messageStore: [$146.76, $180.64] ← CONFLICT!
```

## 🎬 Action Items

1. **Immediate**: Hard refresh browser
2. **Short-term**: Clear messageStore of old stock data
3. **Long-term**: Implement proper cache invalidation
