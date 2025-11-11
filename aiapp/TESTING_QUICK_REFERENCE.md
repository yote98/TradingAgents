# Testing Quick Reference Card

## 🚀 Quick Start

### Automated Test Check
```bash
# Run the test script to check if services are running
python test_dashboard_features.py
```

### Manual Setup (Two Terminals Required)

**Terminal 1 - Start Backend:**
```bash
python c1_api_server.py
```
Wait for: `Running on http://127.0.0.1:5000`

**Terminal 2 - Start Frontend:**
```bash
cd aiapp
npm run dev
```
Wait for: `Ready on http://localhost:3000`

**Then Test:**
1. Navigate to: http://localhost:3000/dashboard
2. Or run: `python test_dashboard_features.py`
3. Or open: http://localhost:3000/test-dashboard.html

## 🧪 Test Categories

### 1. Notifications
```javascript
// Browser console quick test
const manager = getNotificationManager();
manager.testNotification();
```

**Check:**
- ✅ Permission granted
- ✅ Notification appears
- ✅ Click focuses dashboard
- ✅ Throttling works (5 min)

### 2. Charts
```javascript
// Browser console quick test
const generator = new ChartGenerator();
const info = generator.extractTickerInfo('$AAPL 1D chart');
console.log(info); // Should show: { ticker: 'AAPL', timeframe: '1D' }
```

**Check:**
- ✅ Ticker extracted
- ✅ Chart generates
- ✅ Cache works
- ✅ Fallback on error

### 3. Cache
```javascript
// Check cache status
const cache = JSON.parse(localStorage.getItem('coach-dashboard-charts'));
console.log('Cached charts:', Object.keys(cache || {}));
```

**Check:**
- ✅ Cache hit (instant load)
- ✅ Cache miss (API call)
- ✅ Expires after 5 min
- ✅ LRU eviction works

### 4. Settings
```javascript
// Check preferences
const prefs = JSON.parse(localStorage.getItem('coach-dashboard-notifications'));
console.log('Preferences:', prefs);
```

**Check:**
- ✅ Saves to localStorage
- ✅ Persists across sessions
- ✅ Per-coach toggles work
- ✅ Interval slider works

## 🔍 Common Checks

### System Compatibility
```javascript
console.log('Notification API:', 'Notification' in window);
console.log('Permission:', Notification.permission);
console.log('localStorage:', typeof localStorage !== 'undefined');
```

### Storage Usage
```javascript
let size = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    size += key.length + (localStorage.getItem(key)?.length || 0);
  }
}
console.log('Storage:', (size / 1024).toFixed(2), 'KB');
```

### Rate Limiter Status
```javascript
const generator = new ChartGenerator();
console.log('Rate limit:', generator.getRateLimitStatus());
```

## 🐛 Troubleshooting

### Notifications Not Working
```javascript
// 1. Check support
console.log('Supported:', 'Notification' in window);

// 2. Check permission
console.log('Permission:', Notification.permission);

// 3. Request permission
await Notification.requestPermission();

// 4. Test notification
new Notification('Test', { body: 'Testing...' });
```

### Charts Not Generating
```javascript
// 1. Check backend
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend:', d));

// 2. Check rate limit
const generator = new ChartGenerator();
console.log('Rate limit:', generator.getRateLimitStatus());

// 3. Clear failure cache
generator.clearFailureCache();

// 4. Retry
generator.generateChart('AAPL', '1D')
  .then(d => console.log('Success:', d))
  .catch(e => console.error('Error:', e));
```

### Cache Issues
```javascript
// 1. Check cache
const cache = localStorage.getItem('coach-dashboard-charts');
console.log('Cache exists:', !!cache);

// 2. Get stats
const generator = new ChartGenerator();
console.log('Stats:', generator.getCacheStats());

// 3. Clear cache
generator.clearCache();

// 4. Monitor storage
generator.monitorStorage();
```

### Settings Not Persisting
```javascript
// 1. Test localStorage
try {
  localStorage.setItem('test', 'test');
  localStorage.removeItem('test');
  console.log('localStorage: OK');
} catch (e) {
  console.error('localStorage: BLOCKED', e);
}

// 2. Check quota
console.log('Quota:', navigator.storage?.estimate());

// 3. Clear old data
localStorage.clear();
```

## 📊 Test Scenarios

### Scenario 1: First Visit
1. Open dashboard (incognito)
2. Grant notification permission
3. View coach plans
4. Verify charts generate
5. Check cache populated

### Scenario 2: Settings
1. Open settings panel
2. Disable one coach
3. Set interval to 10 min
4. Test notification
5. Refresh page
6. Verify settings persist

### Scenario 3: Notifications
1. Wait for new plan
2. Verify notification appears
3. Click notification
4. Verify dashboard focuses
5. Verify plan visible

### Scenario 4: Caching
1. Generate chart for AAPL
2. Note API call in network tab
3. Refresh page
4. Verify no API call (cache hit)
5. Wait 6 minutes
6. Refresh page
7. Verify API call (cache expired)

### Scenario 5: Error Handling
1. Stop backend
2. Refresh dashboard
3. Verify error message
4. Start backend
5. Refresh dashboard
6. Verify recovery

## 🎯 Success Criteria

### Notifications ✅
- [ ] Permission requested on first visit
- [ ] Notifications appear for new plans
- [ ] Click handler works
- [ ] Throttling prevents spam
- [ ] Settings persist

### Charts ✅
- [ ] Tickers extracted correctly
- [ ] Charts generate and display
- [ ] Interactive features work
- [ ] Cache reduces API calls
- [ ] Errors handled gracefully

### Performance ✅
- [ ] Page loads < 3 seconds
- [ ] Charts appear < 2 seconds (cached)
- [ ] Settings open < 300ms
- [ ] Memory usage < 200MB
- [ ] Storage usage < 5MB

### Mobile ✅
- [ ] Layout responsive
- [ ] Touch interactions work
- [ ] Charts zoom/pan on mobile
- [ ] Settings panel usable
- [ ] Notifications work

## 📱 Browser Testing

### Chrome
```
✅ Notifications: Native
✅ Charts: Full support
✅ Cache: Full support
✅ Mobile: Full support
```

### Firefox
```
✅ Notifications: Native
✅ Charts: Full support
✅ Cache: Full support
✅ Mobile: Full support
```

### Safari
```
⚠️ Notifications: Limited on iOS
✅ Charts: Full support
✅ Cache: Full support
✅ Mobile: Full support
```

### Edge
```
✅ Notifications: Native
✅ Charts: Full support
✅ Cache: Full support
✅ Mobile: Full support
```

## 🔗 Resources

- **Full Guide:** `TESTING_VALIDATION_GUIDE.md`
- **Unit Tests:** `src/lib/__tests__/`
- **Interactive Tests:** `http://localhost:3000/test-dashboard.html`
- **Summary:** `TESTING_COMPLETE.md`

## 💡 Tips

1. **Use incognito mode** for testing first-visit experience
2. **Check browser console** for detailed logs
3. **Monitor network tab** to verify API calls
4. **Test on real devices** for mobile validation
5. **Clear cache** between test runs for consistency

## 🆘 Need Help?

1. Check `TESTING_VALIDATION_GUIDE.md` for detailed procedures
2. Run interactive test suite at `/test-dashboard.html`
3. Review console logs for error messages
4. Check `TESTING_COMPLETE.md` for troubleshooting

---

**Last Updated:** November 10, 2025
**Version:** 1.0
