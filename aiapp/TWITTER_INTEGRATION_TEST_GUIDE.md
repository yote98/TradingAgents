# Twitter Integration Testing Guide

This guide provides manual testing steps to verify the Twitter feed integration into the dashboard.

## Prerequisites

1. Backend C1 API server running at `http://localhost:5000`
2. Twitter monitor configured and working
3. Dashboard running at `http://localhost:3000`

## Test Cases

### 1. Tab Navigation

**Steps:**
1. Open dashboard at `http://localhost:3000/dashboard`
2. Verify "Coach Plans" tab is active by default
3. Click on "Social Sentiment" tab
4. Verify tab switches and shows Twitter feed interface
5. Click back on "Coach Plans" tab
6. Verify coach plans are displayed again

**Expected Results:**
- Tabs switch smoothly without errors
- Active tab has blue highlight and border
- Content changes appropriately

### 2. Ticker Input and Selection

**Steps:**
1. Navigate to "Social Sentiment" tab
2. Locate the ticker input field at the top
3. Enter "AAPL" in the ticker input
4. Wait for Twitter feed to update
5. Verify tweets mentioning $AAPL are displayed
6. Change ticker to "TSLA"
7. Verify feed updates with TSLA-related tweets

**Expected Results:**
- Ticker input accepts uppercase letters
- Feed updates automatically when ticker changes
- Only relevant tweets are shown
- Loading indicator appears during fetch

### 3. Twitter Feed Display

**Steps:**
1. Navigate to "Social Sentiment" tab
2. Enter a ticker (e.g., "AAPL")
3. Verify the following elements are displayed:
   - Sentiment gauge with score
   - List of tweets with account names
   - Ticker badges in tweets
   - Sentiment indicators on tweets
   - Last updated timestamp
   - Auto-refresh indicator

**Expected Results:**
- All components render correctly
- Tweets show proper formatting
- Sentiment colors match scores (green=bullish, red=bearish)
- Timestamps are relative (e.g., "2h ago")

### 4. Account Management

**Steps:**
1. Navigate to "Social Sentiment" tab
2. Click the settings (gear) icon
3. Verify AccountManager modal opens
4. View current monitored accounts
5. Try adding a new account
6. Try removing an account
7. Click "Save" and close modal
8. Verify feed updates with new account list

**Expected Results:**
- Modal opens and closes smoothly
- Account list is editable
- Changes persist after save
- Feed refreshes with new accounts

### 5. Auto-Refresh Functionality

**Steps:**
1. Navigate to "Social Sentiment" tab
2. Enter a ticker
3. Note the "Last Updated" timestamp
4. Wait 5 minutes without interacting
5. Verify feed refreshes automatically
6. Scroll through tweets
7. Verify auto-refresh pauses (orange "Paused" indicator)
8. Stop scrolling and wait 30 seconds
9. Verify auto-refresh resumes (green "Auto-refresh" indicator)

**Expected Results:**
- Feed refreshes every 5 minutes
- Refresh pauses during scrolling
- Refresh resumes after scroll stops
- Indicators show correct status

### 6. Manual Refresh

**Steps:**
1. Navigate to "Social Sentiment" tab
2. Click the refresh button (circular arrow icon)
3. Verify loading spinner appears
4. Wait for refresh to complete
5. Verify "Last Updated" timestamp changes

**Expected Results:**
- Refresh button triggers immediate update
- Loading spinner shows during fetch
- Timestamp updates after refresh

### 7. Ticker Filtering

**Steps:**
1. Navigate to "Social Sentiment" tab
2. Leave ticker input empty
3. Verify all tweets from monitored accounts are shown
4. Enter "AAPL" in ticker input
5. Verify only AAPL-related tweets are shown
6. Click a ticker badge in a tweet
7. Verify filter updates to that ticker

**Expected Results:**
- Empty filter shows all tweets
- Filter works correctly
- Ticker badges are clickable
- Clicking ticker updates filter

### 8. Consistent Styling

**Steps:**
1. Compare "Coach Plans" tab styling with "Social Sentiment" tab
2. Verify the following match:
   - Font families (Inter for body, Poppins for headings)
   - Color scheme (blue/purple gradients)
   - Border radius and shadows
   - Spacing and padding
   - Button styles

**Expected Results:**
- Both tabs have consistent visual design
- Twitter feed matches dashboard aesthetic
- No jarring style differences

### 9. Mobile Responsiveness

**Steps:**
1. Open dashboard on mobile device or resize browser to mobile width
2. Navigate to "Social Sentiment" tab
3. Verify layout adapts to mobile:
   - Single column layout
   - Readable font sizes
   - Touch-friendly buttons
   - Ticker input is accessible
4. Try pull-to-refresh gesture
5. Verify swipe gestures work

**Expected Results:**
- Layout is mobile-friendly
- All features work on mobile
- Touch interactions are smooth
- Pull-to-refresh works

### 10. Error Handling

**Steps:**
1. Stop the C1 API backend server
2. Navigate to "Social Sentiment" tab
3. Enter a ticker
4. Verify error message is displayed
5. Verify last cached data is shown (if available)
6. Restart backend server
7. Click manual refresh
8. Verify feed recovers and loads data

**Expected Results:**
- Friendly error messages appear
- Cached data is shown when available
- Manual refresh allows recovery
- No crashes or blank screens

## Performance Checks

### Load Time
- Initial tab switch should be < 1 second
- Twitter feed should load within 3 seconds
- Ticker filter should update instantly

### Memory Usage
- Monitor browser memory with DevTools
- Verify no memory leaks after multiple tab switches
- Check memory usage with 100+ tweets loaded

### Network Requests
- Verify caching reduces API calls
- Check that auto-refresh respects 5-minute interval
- Ensure no duplicate requests

## Browser Compatibility

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

## Known Issues

Document any issues found during testing:

1. Issue: [Description]
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Severity: [Low/Medium/High]

## Sign-off

- [ ] All test cases passed
- [ ] Performance is acceptable
- [ ] No critical bugs found
- [ ] Ready for production

Tested by: _______________
Date: _______________
