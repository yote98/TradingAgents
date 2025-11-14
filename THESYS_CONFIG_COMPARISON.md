# Thesys C1 Configuration Comparison

## 🔍 Key Differences Found

### 1. **C1Chat Component Props (FIXED)**

#### ❌ Your Old Configuration:
```tsx
<C1Chat 
  apiKey={process.env.NEXT_PUBLIC_THESYS_API_KEY}  // Deprecated
  apiUrl="/api/chat"
  theme={{                                          // Deprecated
    mode: 'dark',
    primaryColor: '#10b981',
    backgroundColor: '#0a1f1a',
    textColor: '#ffffff'
  }}
/>
```

#### ✅ Correct Thesys Template Configuration:
```tsx
// Wrap C1Chat in a container with CSS variables
<div 
  style={{ 
    flex: 1,
    // CSS variables for C1Chat theming
    ['--c1-primary-color' as string]: '#10b981',
    ['--c1-background-color' as string]: '#0a1f1a',
    ['--c1-text-color' as string]: '#ffffff',
    ['--c1-input-background' as string]: 'rgba(255, 255, 255, 0.1)',
    ['--c1-message-background' as string]: 'rgba(16, 185, 129, 0.1)',
  } as React.CSSProperties}
>
  <C1Chat />
</div>
```

**Changes Made:**
- ❌ Removed `apiKey` prop (deprecated)
- ❌ Removed `theme` prop (deprecated)
- ❌ Removed `style` prop (not supported)
- ✅ Added CSS variables to parent container
- ✅ Component now auto-detects API route at `/api/chat`
- ✅ Minimal props - C1Chat handles everything internally

---

### 2. **API Route Configuration**

#### Your Current Setup:
```typescript
// aiapp/src/app/api/chat/route.ts
export async function POST(request: NextRequest) {
  // Connects to local MCP server at http://localhost:8000
  // Falls back to static response if MCP not available
}
```

#### Thesys Template Approach:
Thesys C1 expects one of these patterns:

**Option A: Direct Thesys API (Cloud)**
```typescript
// No custom route needed - C1Chat connects directly to Thesys cloud
// Requires: THESYS_API_KEY in environment
```

**Option B: Custom Backend (Your Approach)**
```typescript
// Custom /api/chat route that proxies to your backend
// This is what you're doing - it's correct!
```

**Option C: processMessage Function**
```tsx
<C1Chat 
  processMessage={async ({ messages, threadId }) => {
    // Custom message processing logic
    const response = await yourBackend.chat(messages);
    return response;
  }}
/>
```

**Your approach (Option B) is valid!** You're using a custom API route to connect to your MCP server.

---

### 3. **Environment Variables**

#### Thesys Template:
```env
# .env.local
THESYS_API_KEY=your_key_here
NEXT_PUBLIC_THESYS_PROJECT_ID=your_project_id
```

#### Your Setup:
```env
# .env.local
NEXT_PUBLIC_THESYS_API_KEY=your_key_here  # Not needed with custom route
```

**Note:** Since you're using a custom `/api/chat` route, you don't need the Thesys API key unless you want to use their cloud services.

---

### 4. **CSS Variables for Theming**

#### Available C1Chat CSS Variables:
```css
--c1-primary-color: #10b981;           /* Main accent color */
--c1-background-color: #0a1f1a;        /* Chat background */
--c1-text-color: #ffffff;              /* Text color */
--c1-input-background: rgba(...);      /* Input field background */
--c1-message-background: rgba(...);    /* Message bubble background */
--c1-border-color: rgba(...);          /* Border colors */
--c1-hover-color: rgba(...);           /* Hover states */
--c1-font-family: 'Inter', sans-serif; /* Font family */
```

You can add these to your global CSS or inline styles.

---

## ✅ What's Working Correctly

1. **Custom API Route** - Your `/api/chat` route is properly configured
2. **MCP Server Integration** - Connects to your local MCP server
3. **Fallback Response** - Provides helpful message when MCP is offline
4. **Landing Page** - Beautiful design with proper styling
5. **Sidebar Navigation** - Well-organized analyst/coach sections

---

## 🔧 Recommended Configuration

### For Development (Local MCP Server):
```tsx
// aiapp/src/app/page.tsx
<div 
  style={{ 
    flex: 1,
    ['--c1-primary-color' as string]: '#10b981',
    ['--c1-background-color' as string]: '#0a1f1a',
    ['--c1-text-color' as string]: '#ffffff',
  } as React.CSSProperties}
>
  <C1Chat />
</div>
```

```bash
# Start your MCP server
python mcp_http_server.py

# Start Next.js dev server
cd aiapp
npm run dev
```

### For Production (Thesys Cloud):
```tsx
// Option 1: Use Thesys processMessage
<C1Chat 
  processMessage={async ({ messages }) => {
    const response = await fetch('https://api.thesys.dev/v1/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.THESYS_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages })
    });
    return response.json();
  }}
  style={{...}}
/>
```

---

## 🚀 Next Steps

1. **Test Current Setup:**
   ```bash
   # Terminal 1: Start MCP server
   python mcp_http_server.py
   
   # Terminal 2: Start Next.js
   cd aiapp
   npm run dev
   
   # Visit: http://localhost:3000
   # Click "Launch AI" and test chat
   ```

2. **Verify Chat Works:**
   - Try: "Analyze AAPL"
   - Try: "What's Bitcoin's price?"
   - Try: "Calculate risk for TSLA"

3. **Deploy to Production:**
   - Deploy MCP server to cloud (Railway, Render, etc.)
   - Update API route to point to deployed MCP server
   - Deploy Next.js app to Vercel

---

## 📚 Thesys Documentation References

- **C1Chat Component**: https://docs.thesys.dev/components/c1-chat
- **API Integration**: https://docs.thesys.dev/guides/api-integration
- **Theming**: https://docs.thesys.dev/guides/theming
- **Custom Backends**: https://docs.thesys.dev/guides/custom-backend

---

## 🎯 Summary

**What Changed:**
- ✅ Removed deprecated `apiKey` prop
- ✅ Removed deprecated `theme` prop  
- ✅ Added CSS variables for theming
- ✅ Component now auto-detects `/api/chat` route

**What Stayed the Same:**
- ✅ Your custom API route approach
- ✅ MCP server integration
- ✅ Fallback response logic
- ✅ Overall architecture

**Result:**
Your configuration now matches the latest Thesys template! The TypeScript errors should be resolved, and the chat should work properly with your MCP server.
