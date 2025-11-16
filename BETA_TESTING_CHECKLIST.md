# Beta Testing Checklist 🧪

**Date**: November 16, 2025
**Tester**: [Your Name]
**URL**: https://www.ai-trades.my

---

## **How to Use This Checklist:**

For each prompt:
1. Copy the prompt into the chat
2. Wait for response
3. Mark status: ✅ (works), ⚠️ (issues), ❌ (broken)
4. Note any issues in the "Notes" column

---

## **📊 Basic Stock Analysis**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 1 | "Analyze AAPL" | ⬜ | |
| 2 | "Should I buy TSLA?" | ⬜ | Price mismatch: Shows $320-340 entry, actual $405 |
| 3 | "What's the current price of NVDA?" | ⬜ | Shows $148-152, actual $191 |
| 4 | "Analyze Microsoft" | ⬜ | |

---

## **🏦 ETF Analysis**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 5 | "Analyze SPY" | ⬜ | |
| 6 | "Should I invest in QQQ?" | ⬜ | |
| 7 | "Compare SPY vs QQQ" | ⬜ | |

---

## **💰 Crypto Analysis**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 8 | "Analyze BTC-USD" | ⬜ | |
| 9 | "What's Bitcoin's price?" | ⬜ | |
| 10 | "Should I buy Ethereum?" | ⬜ | |

---

## **📈 Technical Analysis**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 11 | "What are the key support and resistance levels for AAPL?" | ⬜ | |
| 12 | "Is TSLA overbought or oversold?" | ⬜ | |
| 13 | "Show me the trend for NVDA" | ⬜ | |

---

## **📰 News & Sentiment**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 14 | "What's the sentiment on AAPL?" | ⬜ | |
| 15 | "Any recent news about Tesla?" | ⬜ | |
| 16 | "What are traders saying about NVDA?" | ⬜ | |

---

## **⚠️ Risk Management**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 17 | "What's the risk of buying TSLA at current price?" | ⬜ | |
| 18 | "How much should I invest in AAPL with a $10,000 portfolio?" | ⬜ | |
| 19 | "What's a good stop loss for NVDA?" | ⬜ | |

---

## **📊 Multiple Stocks**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 20 | "Compare AAPL vs MSFT" | ⬜ | |
| 21 | "Which is better: TSLA or RIVN?" | ⬜ | |
| 22 | "Analyze the top 3 tech stocks" | ⬜ | |

---

## **🎯 Specific Scenarios**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 23 | "I want to day trade TSLA, what should I know?" | ⬜ | |
| 24 | "Is AAPL a good long-term investment?" | ⬜ | |
| 25 | "What's the best entry point for NVDA?" | ⬜ | |

---

## **🔍 Edge Cases**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 26 | "Analyze INVALID" | ⬜ | Should show error gracefully |
| 27 | "What's the price of XYZ123?" | ⬜ | Should handle non-existent stock |
| 28 | "Analyze" (no ticker) | ⬜ | Should ask for ticker |

---

## **💡 Conversational**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 29 | "I'm new to trading, where should I start?" | ⬜ | |
| 30 | "Explain what a stop loss is" | ⬜ | |
| 31 | "What's the difference between SPY and QQQ?" | ⬜ | |

---

## **🚀 Advanced Features**

| # | Prompt | Status | Notes |
|---|--------|--------|-------|
| 32 | "Backtest a momentum strategy on AAPL" | ⬜ | May not be implemented |
| 33 | "Calculate risk for TSLA with $50k account and 2% risk" | ⬜ | |
| 34 | "Show me the earnings calendar for AAPL" | ⬜ | |

---

## **Known Issues (Pre-Testing)**

### **Critical Issues:**
- [ ] Price data mismatch (TSLA: shows $320-340, actual $405)
- [ ] Price data mismatch (NVDA: shows $148-152, actual $191)
- [ ] Date context (shows 2024 instead of 2025)

### **High Priority:**
- [ ] Entry prices don't match current market prices
- [ ] AI not using real-time price from backend

### **Medium Priority:**
- [ ] TBD based on testing

### **Low Priority:**
- [ ] TBD based on testing

---

## **Summary Statistics**

After testing, fill this in:

**Total Prompts Tested**: ___/34

**Status Breakdown:**
- ✅ Working Perfectly: ___
- ⚠️ Works with Issues: ___
- ❌ Broken: ___

**Critical Issues Found**: ___
**High Priority Issues**: ___
**Medium Priority Issues**: ___
**Low Priority Issues**: ___

---

## **Decision:**

Based on testing results:

- [ ] **Launch Now** - Issues are minor, can fix post-launch
- [ ] **Fix Critical Issues First** - Block launch until fixed
- [ ] **Fix All High Priority** - Launch after high priority fixes

---

## **Next Steps:**

1. Complete testing checklist
2. Review with team/developer
3. Prioritize fixes
4. Fix critical issues
5. Re-test
6. Launch! 🚀

---

**Notes:**
- Test in incognito/private mode to avoid cache issues
- Take screenshots of major issues
- Note response times (should be < 60 seconds)
- Check if charts/visualizations display correctly
