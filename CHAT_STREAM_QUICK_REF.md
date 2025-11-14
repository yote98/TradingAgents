# Chat Stream Tester - Quick Reference

## 🎯 Purpose
Test if your chat API streams responses correctly (like ChatGPT)

## 🚀 Quick Start

### 1. Start Server
```bash
cd c1-template
npm run dev
```

### 2. Open Tester
```bash
test_chat_stream.bat
```
OR navigate to: `http://localhost:3000/test-chat-stream.html`

### 3. Click Button
Click "Test Chat Stream" and watch the magic happen!

## ✅ Success Indicators
- Green status: "Connected! Streaming response..."
- Text appears gradually (not all at once)
- Final message: "Stream complete! Total length: X characters"

## ❌ Common Problems

| Error | Cause | Fix |
|-------|-------|-----|
| HTTP 404 | API route missing | Check `/api/chat/route.ts` exists |
| HTTP 500 | Server error | Check `.env` has `OPENAI_API_KEY` |
| CORS error | Wrong URL | Use `http://localhost:3000` not `file://` |
| Not streaming | Wrong response type | API must return `ReadableStream` |

## 🔍 What It Tests
1. ✓ Can connect to `/api/chat`
2. ✓ Response streams (not all at once)
3. ✓ Text decodes properly
4. ✓ Stream completes without errors
5. ✓ Error handling works

## 📊 Expected Behavior
```
Click button
  ↓
Status: "Starting test..."
  ↓
Status: "Connected! Streaming..."
  ↓
Output: "I" → "I can" → "I can help" → ...
  ↓
Status: "Stream complete! Total length: 250 characters"
```

## 🛠️ Debugging Tips
- Open DevTools (F12) to see console logs
- Check Network tab for request/response details
- Look for "Chunk received: X bytes" messages
- Verify response headers include streaming indicators

## 📝 Files Involved
- `aiapp/public/test-chat-stream.html` - The tester
- `c1-template/src/app/api/chat/route.ts` - Your API
- `c1-template/.env` - API keys
- `test_chat_stream.bat` - Quick launcher

## 🎓 Learn More
See `CHAT_STREAM_TESTER_GUIDE.md` for detailed explanation
