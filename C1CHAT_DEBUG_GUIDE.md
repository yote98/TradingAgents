# C1Chat Integration Debug Guide for Cursor

## Problem Summary

The C1Chat component at `localhost:3000` shows "Error while generating response" when trying to send messages. The underlying API works perfectly (verified with test page), but C1Chat integration has a format mismatch.

## System Architecture

```
User types message in C1Chat
    ↓
C1Chat component (aiapp/src/app/page.tsx)
    ↓
POST to /api/chat (aiapp/src/app/api/chat/route.ts)
    ↓
OpenAI API (streaming response)
    ↓
Stream back to C1Chat
    ↓
Display in chat interface
```

## What Works

✅ **API Route** (`aiapp/src/app/api/chat/route.ts`)
- Returns 200 status
- Streams text correctly
- Verified with `localhost:3000/test-chat-stream.html`

✅ **OpenAI Integration**
- API key configured in `aiapp/.env.local`
- Streaming works perfectly
- Returns 2000+ character responses

✅ **Background Image**
- Fixed: Changed from `auto 100%` to `cover`

## What's Broken

❌ **C1Chat Component Integration**
- Shows "Error while generating response"
- C1Chat sends messages in specific format
- Our API now handles the format but still shows error

## Current Implementation

### C1Chat Component (`aiapp/src/app/page.tsx`)
```typescript
<C1Chat apiUrl="/api/chat" />
```

### API Route (`aiapp/src/app/api/chat/route.ts`)

**C1Chat sends this format:**
```json
{
  "prompt": {
    "id": "uuid",
    "role": "user",
    "content": "<content>message text</content>"
  },
  "responseId": "uuid",
  "threadId": "uuid"
}
```

**Current handling:**
```typescript
// Extract from prompt object
if (body.prompt && body.prompt.content) {
  let content = body.prompt.content;
  content = content.replace(/<\/?content>/g, '');
  content = content.replace(/&#39;/g, "'");
  messages = [{ role: 'user', content: content }];
}
```

**Returns:** Plain text stream (verified working)

## Files to Check

### Primary Files
1. `aiapp/src/app/page.tsx` - C1Chat component configuration
2. `aiapp/src/app/api/chat/route.ts` - API route handling
3. `aiapp/.env.local` - Environment variables

### Reference Files
1. `THESYS_C1CHAT_CUSTOMIZATION_GUIDE.md` - C1Chat documentation
2. `aiapp/public/test-chat-stream.html` - Working test implementation

## Debugging Steps for Cursor

### Step 1: Verify C1Chat Props
Check if C1Chat needs additional props beyond `apiUrl`:
- Look at `@thesysai/genui-sdk` documentation
- Check if `processMessage` function is required
- Verify response format expectations

### Step 2: Check Response Format
C1Chat might expect:
- Specific headers
- JSON wrapped response
- Server-Sent Events (SSE) format
- Different content-type

### Step 3: Console Logging
The page.tsx has console.log statements that should show:
- 📦 Request body
- 💬 Processed messages
- But these aren't appearing (C1Chat not calling our function)

### Step 4: Test Alternative Approaches

**Option A: Use processMessage instead of apiUrl**
```typescript
<C1Chat 
  processMessage={async ({ messages }) => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages })
    });
    return response;
  }}
/>
```

**Option B: Check C1Chat version compatibility**
- Current version: `@thesysai/genui-sdk@^0.6.34`
- Installed version: `0.6.40`
- Check if API changed between versions

## Server Logs Show

```
📦 Received body: {
  "prompt": {
    "content": "<content>disney&#39;s earning report</content>"
  }
}
💬 Messages array: []  // Empty because format wasn't handled
✅ Returning stream to client
POST /api/chat 200 in 3668ms
```

The API returns 200 but C1Chat still shows error.

## Questions for Investigation

1. **Does C1Chat expect a specific response format?**
   - Check if it needs JSON wrapper
   - Check if it needs specific headers

2. **Is apiUrl the correct prop?**
   - Maybe it needs `processMessage` function
   - Maybe it needs both

3. **Are there C1Chat error logs?**
   - Check browser console for C1Chat errors
   - Check if C1Chat has debug mode

4. **Version compatibility?**
   - Package.json says `^0.6.34`
   - Installed is `0.6.40`
   - Did API change?

## Success Criteria

When fixed, you should be able to:
1. Type a message in C1Chat input
2. See the message sent to API
3. See streaming response appear in chat
4. No "Error while generating response"

## Quick Test

After any fix:
1. Refresh `localhost:3000`
2. Click "Launch AI"
3. Type "test message"
4. Should see response streaming in

## Working Alternative

If C1Chat can't be fixed quickly, the test page works:
`localhost:3000/test-chat-stream.html`

This proves the API is correct and C1Chat integration is the only issue.
