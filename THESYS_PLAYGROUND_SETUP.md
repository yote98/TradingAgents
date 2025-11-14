# 🎮 Thesys.dev Playground Setup Guide

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Access Thesys.dev Playground**
1. Go to: **https://playground.thesys.dev/**
2. Sign up or log in with your account

### **Step 2: Create Your Project**
1. Click **"New Project"** or **"Create Project"**
2. Project Name: **"AlphaFlow AI"**
3. Description: **"Multi-agent trading analysis system"**
4. Click **"Create"**

### **Step 3: Get Your Credentials**
1. In your project dashboard, find:
   - **API Key** (looks like: `ts_xxxxxxxxxxxxx`)
   - **Project ID** (looks like: `proj_xxxxxxxxxxxxx`)
2. Copy both values

### **Step 4: Configure Your App**

Create `.env.local` file in the `aiapp` directory:

```bash
# Thesys.dev Configuration
NEXT_PUBLIC_THESYS_API_KEY=ts_your_api_key_here
NEXT_PUBLIC_THESYS_PROJECT_ID=proj_your_project_id_here

# Optional: Custom endpoint
NEXT_PUBLIC_THESYS_API_URL=https://api.thesys.dev
```

### **Step 5: Restart Your Dev Server**

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
cd aiapp
npm run dev
```

### **Step 6: Test the Chat**
1. Open: `http://localhost:3004`
2. Click **"Launch AI"**
3. Try asking: **"What stocks are a good buy?"**

---

## 🔧 **Alternative: Use Local API (No Thesys.dev)**

If you want to use your local MCP server instead:

### **Option A: Start MCP Server**
```bash
# In a new terminal
python mcp_http_server_v2.py
```

### **Option B: Update API Route**
The chat will automatically fall back to the local response if MCP server isn't running.

---

## 🎯 **What's Fixed**

✅ **Chat positioning** - Now fills the space properly
✅ **Layout** - Chat appears right below "AlphaFlow AI Assistant"
✅ **Flex layout** - Proper height and width
✅ **Overflow** - Prevents scrolling issues

---

## 🐛 **Troubleshooting**

### **Error: "Error while generating response"**
**Solution:** Configure thesys.dev credentials in `.env.local`

### **Chat box still at bottom**
**Solution:** Hard refresh browser (Ctrl+Shift+R)

### **API Key not working**
**Solution:** 
1. Check `.env.local` is in `aiapp` directory
2. Restart dev server
3. Verify API key is correct

---

## 📱 **Quick Test Commands**

```bash
# Check if .env.local exists
ls aiapp/.env.local

# View environment variables
cat aiapp/.env.local

# Restart server
cd aiapp && npm run dev
```

---

## 🎉 **You're Ready!**

Once configured, your AlphaFlow AI chat will:
- ✅ Appear in the correct position
- ✅ Connect to thesys.dev or local MCP
- ✅ Handle all trading analysis queries
- ✅ Show proper responses

**Next:** Test with "Analyze AAPL" or "Calculate risk for TSLA"
