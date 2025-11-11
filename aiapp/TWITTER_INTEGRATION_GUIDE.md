# Twitter Integration User Guide

## Overview

The Twitter Integration brings real-time social sentiment analysis directly into your C1 Dashboard. Monitor tweets from trusted financial accounts, analyze market sentiment, and filter by ticker symbols—all without leaving your trading workspace.

## Features

### 🐦 Real-Time Tweet Feed
- View the latest tweets from curated financial accounts
- Automatic updates every 5 minutes
- Sentiment indicators for each tweet
- Ticker symbol highlighting and filtering

### 📊 Sentiment Analysis
- Overall sentiment score (-1.0 to +1.0)
- AI-generated bullish and bearish arguments
- Key market themes extraction
- Account influence rankings

### ⚙️ Account Management
- Add or remove Twitter accounts to monitor
- Pre-configured list of trusted financial sources
- Account validation before adding
- Persistent settings across sessions

### 🎯 Ticker Filtering
- Filter tweets by specific stock symbols
- Multi-ticker support (comma-separated)
- Click ticker badges to auto-filter
- Clear filters with one click

### 📱 Mobile Responsive
- Optimized for mobile devices
- Touch-friendly interface
- Swipe gestures on mobile
- Adaptive layouts for all screen sizes

## Getting Started

### Accessing the Twitter Feed

1. Open the C1 Dashboard
2. Navigate to the **Social Sentiment** tab
3. The Twitter feed will load automatically with default accounts

### Understanding the Interface

#### Header Section
- **Ticker Filter**: Enter stock symbols to filter tweets (e.g., "AAPL" or "AAPL,MSFT")
- **Settings Icon**: Opens account management modal
- **Refresh Button**: Manually refresh the feed
- **Last Updated**: Shows when data was last fetched

#### Sentiment Gauge
- **Score Display**: Visual gauge showing overall sentiment
- **Bullish Arguments**: Green-highlighted positive factors
- **Bearish Arguments**: Red-highlighted negative factors
- **Key Themes**: Market themes extracted from tweets

#### Tweet List
- **Account Info**: Avatar, username, and timestamp
- **Tweet Text**: Full tweet content with highlighted tickers
- **Sentiment Badge**: Color-coded sentiment indicator
  - 🟢 Green: Bullish (> 0.3)
  - 🟡 Yellow: Neutral (-0.3 to 0.3)
  - 🔴 Red: Bearish (< -0.3)
- **Original Link**: Click to view tweet on Twitter/X

## Using the Twitter Feed

### Filtering by Ticker

**Method 1: Manual Entry**
1. Click the filter input in the header
2. Type a ticker symbol (e.g., "AAPL")
3. Press Enter or click outside the input
4. View filtered results

**Method 2: Click Ticker Badges**
1. Find a ticker badge in any tweet (e.g., $AAPL)
2. Click the badge
3. Feed automatically filters to that ticker

**Multiple Tickers**
- Enter comma-separated symbols: "AAPL,MSFT,GOOGL"
- All tweets mentioning any of these tickers will display

**Clear Filter**
- Click the "Clear" button next to the filter input
- Or delete all text from the filter input

### Managing Monitored Accounts

1. Click the **Settings** icon (⚙️) in the header
2. The Account Manager modal opens

**Adding Accounts**
1. Enter a Twitter username in the input field
2. Click "Add Account" or press Enter
3. Account is validated before adding
4. New account appears in the list

**Removing Accounts**
1. Find the account in the list
2. Click the "Remove" button (🗑️)
3. Account is immediately removed

**Saving Changes**
1. Click "Save" to apply changes
2. Feed refreshes with new account list
3. Settings persist in browser storage

**Default Accounts**
The system comes pre-configured with trusted accounts:
- ChartChampions
- unusual_whales
- TradingView
- Benzinga
- MarketWatch

### Auto-Refresh Behavior

**Automatic Updates**
- Feed refreshes every 5 minutes by default
- New tweets smoothly animate into the feed
- Sentiment scores update automatically

**Pause on Scroll**
- Auto-refresh pauses when you're scrolling
- Prevents jarring updates while reading
- Resumes 30 seconds after you stop scrolling

**Manual Refresh**
- Click the refresh button anytime
- Bypasses the 5-minute interval
- Useful for checking latest updates immediately

### Understanding Sentiment Scores

**Score Range**
- **+1.0**: Extremely bullish
- **+0.5**: Moderately bullish
- **0.0**: Neutral
- **-0.5**: Moderately bearish
- **-1.0**: Extremely bearish

**Sentiment Calculation**
- AI analyzes tweet content and context
- Considers account influence and engagement
- Aggregates multiple tweets for overall score
- Updates as new tweets arrive

**Bullish/Bearish Arguments**
- AI-generated summaries of key points
- Extracted from recent tweets
- Helps understand sentiment drivers
- Updates with each refresh

## Stocktwits Integration (Optional)

### Enabling Stocktwits

1. Open Account Manager (⚙️)
2. Toggle "Show Stocktwits" switch
3. Save settings
4. Stocktwits panel appears below Twitter feed

### Stocktwits Features

- **Bullish/Bearish Ratio**: Visual bar chart
- **Recent Messages**: Latest Stocktwits posts
- **Sentiment Labels**: Clear bullish/bearish indicators
- **Like Counts**: Community engagement metrics

### When to Use Stocktwits

- Gauge retail investor sentiment
- Compare with institutional Twitter sentiment
- Identify divergences between platforms
- Monitor community engagement levels

## Performance Tips

### Optimizing Load Times

**Browser Caching**
- Data cached for 5 minutes
- Reduces API calls and load times
- Cached data shown immediately on page load

**Virtual Scrolling**
- Only visible tweets are rendered
- Smooth performance with 100+ tweets
- Automatic optimization for large feeds

**Image Lazy Loading**
- Images load as you scroll
- Reduces initial page load time
- Saves bandwidth on mobile

### Mobile Optimization

**Data Usage**
- Optimized image sizes for mobile
- Compressed API responses
- Efficient caching strategy

**Touch Gestures**
- Swipe tweets to dismiss (mobile only)
- Pull-to-refresh gesture
- Large tap targets for easy interaction

## Troubleshooting

### Feed Not Loading

**Check Internet Connection**
- Ensure stable internet connection
- Try refreshing the page
- Check browser console for errors

**API Issues**
- Backend may be temporarily unavailable
- Cached data will display with staleness indicator
- Try manual refresh after a few minutes

**Clear Cache**
```javascript
// Open browser console and run:
localStorage.removeItem('twitter_cache');
location.reload();
```

### Tweets Not Updating

**Auto-Refresh Paused**
- Check if you recently scrolled
- Wait 30 seconds for auto-refresh to resume
- Use manual refresh button

**Rate Limiting**
- System may be rate-limited
- Wait 5-10 minutes before retrying
- Cached data remains available

### Account Validation Fails

**Invalid Username**
- Ensure username exists on Twitter/X
- Don't include @ symbol
- Check for typos

**Account Suspended**
- Twitter account may be suspended
- Try a different account
- Remove and re-add if issues persist

### Sentiment Scores Seem Off

**Understanding Context**
- Sentiment is AI-generated and may not be perfect
- Based on recent tweets only (not historical)
- Influenced by account selection
- Consider as one data point among many

**Improving Accuracy**
- Add more diverse accounts
- Monitor multiple tickers
- Compare with other sentiment sources
- Use longer time periods for trends

### Mobile Display Issues

**Layout Problems**
- Try rotating device
- Refresh the page
- Clear browser cache
- Update to latest browser version

**Touch Not Working**
- Ensure touch events are enabled
- Try different browser (Safari/Chrome)
- Check for browser extensions interfering

### Performance Issues

**Slow Loading**
- Reduce number of monitored accounts
- Clear browser cache
- Close other browser tabs
- Check network speed

**High Memory Usage**
- Refresh page periodically
- Limit to 50-100 tweets
- Disable Stocktwits if not needed
- Use desktop browser for large feeds

## Advanced Usage

### Custom Account Lists

**Create Themed Lists**
- Technical analysts only
- News outlets only
- Crypto-focused accounts
- Options traders

**Save Multiple Configurations**
- Use browser profiles for different lists
- Export/import settings (future feature)
- Document your account lists

### Combining with Other Dashboard Features

**Cross-Reference Analysis**
- Check Twitter sentiment while viewing charts
- Compare with fundamental analysis
- Validate trading signals with social sentiment
- Monitor sentiment during earnings

**Workflow Integration**
1. Identify ticker in main dashboard
2. Switch to Social Sentiment tab
3. Filter tweets by that ticker
4. Review sentiment and key themes
5. Return to main analysis with context

### API Integration (Developers)

See `c1_api/README.md` for API documentation if you want to:
- Build custom integrations
- Fetch data programmatically
- Create automated alerts
- Export sentiment data

## Best Practices

### Account Selection

✅ **Do:**
- Include diverse perspectives
- Mix technical and fundamental analysts
- Add reputable news sources
- Monitor 5-15 accounts for balance

❌ **Don't:**
- Follow only bullish accounts
- Add unverified sources
- Monitor too many accounts (noise)
- Ignore account influence metrics

### Sentiment Interpretation

✅ **Do:**
- Use as one data point
- Look for sentiment shifts
- Compare across time periods
- Consider account credibility

❌ **Don't:**
- Trade solely on sentiment
- Ignore fundamental analysis
- Overreact to single tweets
- Assume AI sentiment is perfect

### Performance Management

✅ **Do:**
- Keep account list reasonable (< 20)
- Clear cache periodically
- Use ticker filtering
- Enable Stocktwits selectively

❌ **Don't:**
- Monitor 50+ accounts
- Keep multiple tabs open
- Disable caching
- Ignore performance warnings

## Privacy & Security

### Data Storage

- Account preferences stored in browser localStorage
- No personal data sent to servers
- Tweet data cached temporarily
- Clear cache to remove all data

### API Keys

- No Twitter API keys required
- Uses Nitter RSS feeds (privacy-focused)
- Stocktwits uses free public API
- No authentication needed

### Data Usage

- Minimal data collection
- No tracking or analytics
- No third-party data sharing
- Open source and transparent

## Support & Feedback

### Getting Help

- Check this guide first
- Review troubleshooting section
- Check browser console for errors
- Contact support with error details

### Reporting Issues

Include:
- Browser and version
- Operating system
- Steps to reproduce
- Error messages
- Screenshots if applicable

### Feature Requests

We welcome suggestions for:
- New data sources
- Additional sentiment metrics
- UI improvements
- Performance enhancements

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Twitter feed with sentiment analysis
- Account management
- Ticker filtering
- Stocktwits integration
- Mobile responsive design
- Performance optimizations

## Additional Resources

- **API Documentation**: `c1_api/README.md`
- **Deployment Guide**: See deployment checklist
- **Technical Architecture**: `.kiro/specs/twitter-dashboard-integration/design.md`
- **Requirements**: `.kiro/specs/twitter-dashboard-integration/requirements.md`

---

**Need more help?** Check the troubleshooting section or contact support.
