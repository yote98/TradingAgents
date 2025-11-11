# Twitter Integration Deployment Checklist

## Pre-Deployment

### ✅ Code Review
- [ ] All tasks in `.kiro/specs/twitter-dashboard-integration/tasks.md` completed
- [ ] Code reviewed and approved
- [ ] No console errors or warnings
- [ ] TypeScript compilation successful
- [ ] All tests passing

### ✅ Testing
- [ ] Unit tests pass (frontend and backend)
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Mobile responsive testing done
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Performance testing with 100+ tweets
- [ ] Error handling tested (network failures, API errors)

### ✅ Documentation
- [ ] User guide created (`aiapp/TWITTER_INTEGRATION_GUIDE.md`)
- [ ] API documentation updated (`c1_api/README.md`)
- [ ] Configuration documented
- [ ] Troubleshooting guide included

## Backend Deployment

### 1. Environment Configuration

**Required Environment Variables** (`.env` file):
```bash
# OpenAI API Key (required for sentiment analysis)
OPENAI_API_KEY=sk-...

# Twitter Configuration
TWITTER_CACHE_DURATION=300              # Cache duration in seconds (default: 5 minutes)
TWITTER_MAX_TWEETS=100                  # Max tweets per request
TWITTER_RATE_LIMIT=60                   # Requests per minute
TWITTER_DEFAULT_ACCOUNTS=ChartChampions,unusual_whales,TradingView,Benzinga,MarketWatch

# Stocktwits (optional)
STOCKTWITS_API_TOKEN=                   # Leave empty to use public API

# API Server
API_HOST=0.0.0.0
API_PORT=5000
DEBUG_MODE=false                        # NEVER true in production
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Request Configuration
REQUEST_TIMEOUT=120
```

**Checklist**:
- [ ] Copy `.env.c1-api.example` to `.env`
- [ ] Set `OPENAI_API_KEY` with valid key
- [ ] Configure `TWITTER_DEFAULT_ACCOUNTS` with desired accounts
- [ ] Set `CORS_ORIGINS` to include production frontend URL
- [ ] Verify `DEBUG_MODE=false` for production
- [ ] Set appropriate `TWITTER_CACHE_DURATION` (300-600 seconds recommended)
- [ ] Configure `TWITTER_RATE_LIMIT` based on expected traffic

### 2. Dependencies Installation

```bash
# Install Python dependencies
pip install -r requirements.txt
pip install -r requirements-c1-api.txt

# Verify installations
python -c "import flask; import tradingagents; print('Dependencies OK')"
```

**Checklist**:
- [ ] All Python dependencies installed
- [ ] No version conflicts
- [ ] Virtual environment activated (recommended)

### 3. Backend Service Setup

**Development**:
```bash
python c1_api_server.py
```

**Production** (using gunicorn):
```bash
# Install gunicorn
pip install gunicorn

# Run with 4 workers
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 c1_api_server:app

# Or with systemd service (recommended)
```

**Systemd Service** (`/etc/systemd/system/c1-api.service`):
```ini
[Unit]
Description=C1 Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/tradingagents
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 c1_api_server:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Checklist**:
- [ ] Backend server starts without errors
- [ ] Health check endpoint responds: `curl http://localhost:5000/health`
- [ ] Twitter endpoints accessible: `curl http://localhost:5000/api/twitter/sentiment`
- [ ] Logs show no errors
- [ ] Service auto-restarts on failure (if using systemd)

### 4. Backend Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test Twitter sentiment endpoint
curl "http://localhost:5000/api/twitter/sentiment?ticker=AAPL&limit=10"

# Test Stocktwits endpoint
curl "http://localhost:5000/api/twitter/stocktwits?ticker=AAPL"

# Test account update
curl -X POST http://localhost:5000/api/twitter/accounts \
  -H "Content-Type: application/json" \
  -d '{"accounts": ["ChartChampions"]}'
```

**Checklist**:
- [ ] Health check returns 200 OK
- [ ] Twitter sentiment returns valid JSON
- [ ] Stocktwits returns valid JSON (or graceful error)
- [ ] Account update succeeds
- [ ] Response times < 3 seconds (uncached)
- [ ] Response times < 500ms (cached)
- [ ] Error responses include proper status codes

## Frontend Deployment

### 1. Environment Configuration

**Next.js Environment Variables** (`.env.local`):
```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
# For production: NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_TWITTER=true
NEXT_PUBLIC_ENABLE_STOCKTWITS=true

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

**Checklist**:
- [ ] Create `.env.local` file
- [ ] Set `NEXT_PUBLIC_API_URL` to backend URL
- [ ] Verify feature flags if using them
- [ ] Configure analytics if needed

### 2. Build and Test

```bash
# Navigate to frontend directory
cd aiapp

# Install dependencies
npm install

# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build

# Test production build locally
npm start
```

**Checklist**:
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] All tests pass
- [ ] Production build succeeds
- [ ] No build warnings
- [ ] Bundle size reasonable (< 500KB for Twitter components)

### 3. Frontend Deployment

**Vercel** (Recommended):
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Manual/Docker**:
```bash
# Build
npm run build

# Start
npm start
# Or use PM2, systemd, etc.
```

**Docker** (`aiapp/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

**Checklist**:
- [ ] Frontend deployed successfully
- [ ] Environment variables set in deployment platform
- [ ] HTTPS enabled (production)
- [ ] CDN configured (if applicable)
- [ ] Domain/subdomain configured

### 4. Frontend Testing

**Manual Testing**:
- [ ] Dashboard loads without errors
- [ ] Social Sentiment tab visible
- [ ] Twitter feed loads and displays tweets
- [ ] Sentiment gauge displays correctly
- [ ] Ticker filtering works
- [ ] Account management modal opens and functions
- [ ] Auto-refresh works (wait 5 minutes)
- [ ] Manual refresh button works
- [ ] Stocktwits panel loads (if enabled)
- [ ] Mobile responsive design works
- [ ] No console errors

**Performance Testing**:
- [ ] Initial load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] Smooth scrolling with 100+ tweets
- [ ] No memory leaks after 30 minutes
- [ ] Images lazy load properly

## Integration Testing

### End-to-End Flow
- [ ] User opens dashboard
- [ ] Navigates to Social Sentiment tab
- [ ] Feed loads with default accounts
- [ ] User filters by ticker (e.g., "AAPL")
- [ ] Filtered tweets display correctly
- [ ] User clicks ticker badge, filter updates
- [ ] User opens account manager
- [ ] User adds new account
- [ ] User removes account
- [ ] User saves changes
- [ ] Feed refreshes with new accounts
- [ ] Auto-refresh triggers after 5 minutes
- [ ] User scrolls, auto-refresh pauses
- [ ] Auto-refresh resumes after scroll stops

### Error Scenarios
- [ ] Backend unavailable → Shows cached data with warning
- [ ] Network error → Shows error message with retry button
- [ ] Invalid ticker → Shows "No tweets found" message
- [ ] Rate limit exceeded → Shows rate limit message
- [ ] Invalid account → Shows validation error

## Monitoring Setup

### Backend Monitoring

**Logs**:
```bash
# View logs (systemd)
journalctl -u c1-api -f

# View logs (Docker)
docker logs -f c1-api

# View logs (PM2)
pm2 logs c1-api
```

**Metrics to Monitor**:
- [ ] Request rate (requests/minute)
- [ ] Response times (p50, p95, p99)
- [ ] Error rate (%)
- [ ] Cache hit rate (%)
- [ ] Twitter monitor success rate (%)
- [ ] Memory usage
- [ ] CPU usage

**Alerting** (recommended):
- [ ] Alert on error rate > 5%
- [ ] Alert on response time > 5 seconds
- [ ] Alert on service down
- [ ] Alert on high memory usage (> 80%)

### Frontend Monitoring

**Browser Console**:
- [ ] No JavaScript errors
- [ ] No failed network requests
- [ ] No memory leaks

**Analytics** (optional):
- [ ] Page views tracked
- [ ] User interactions tracked
- [ ] Error events tracked
- [ ] Performance metrics tracked

**Metrics to Monitor**:
- [ ] Page load time
- [ ] Time to interactive
- [ ] API call success rate
- [ ] User engagement (clicks, filters, etc.)

## Security Checklist

### Backend Security
- [ ] `DEBUG_MODE=false` in production
- [ ] CORS configured with specific origins (not `*`)
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] API keys stored in environment variables (not code)
- [ ] HTTPS enabled (production)
- [ ] Security headers configured

### Frontend Security
- [ ] No API keys in client-side code
- [ ] XSS protection (React escapes by default)
- [ ] Content Security Policy configured
- [ ] HTTPS enforced (production)
- [ ] No sensitive data in localStorage
- [ ] External links use `rel="noopener noreferrer"`

## Performance Optimization

### Backend
- [ ] Caching enabled (5-minute TTL)
- [ ] Connection pooling configured
- [ ] Gzip compression enabled
- [ ] Request timeout set (120 seconds)
- [ ] Rate limiting configured

### Frontend
- [ ] Virtual scrolling implemented
- [ ] Image lazy loading enabled
- [ ] Code splitting configured
- [ ] Browser caching enabled
- [ ] Service worker configured (optional)
- [ ] Bundle size optimized

## Rollback Plan

### Backend Rollback
```bash
# Stop service
sudo systemctl stop c1-api

# Restore previous version
git checkout <previous-commit>

# Restart service
sudo systemctl start c1-api
```

### Frontend Rollback
```bash
# Vercel
vercel rollback

# Manual
git checkout <previous-commit>
npm run build
npm start
```

**Checklist**:
- [ ] Previous version tagged in git
- [ ] Rollback procedure documented
- [ ] Rollback tested in staging
- [ ] Database migrations reversible (if any)

## Post-Deployment

### Verification
- [ ] All endpoints responding correctly
- [ ] Frontend loads without errors
- [ ] Twitter feed displays tweets
- [ ] Sentiment analysis working
- [ ] Account management working
- [ ] Mobile responsive working
- [ ] Performance acceptable
- [ ] No errors in logs

### Communication
- [ ] Deployment announced to team
- [ ] User guide shared with users
- [ ] Known issues documented
- [ ] Support team briefed

### Monitoring
- [ ] Monitor logs for 24 hours
- [ ] Check error rates
- [ ] Verify cache hit rates
- [ ] Monitor user feedback
- [ ] Track performance metrics

## Troubleshooting

### Common Issues

**Backend won't start**:
- Check environment variables are set
- Verify Python dependencies installed
- Check port 5000 not already in use
- Review logs for errors

**Frontend can't connect to backend**:
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS configuration
- Verify backend is running
- Check network/firewall rules

**Twitter feed not loading**:
- Check OpenAI API key is valid
- Verify Twitter monitor is working
- Check backend logs for errors
- Try clearing cache

**Slow performance**:
- Check cache is working (cache hit rate)
- Verify rate limiting not too aggressive
- Check database/API response times
- Monitor server resources

**High error rate**:
- Check Twitter monitor service
- Verify OpenAI API is responding
- Check rate limits not exceeded
- Review error logs for patterns

## Maintenance

### Regular Tasks
- [ ] Monitor logs weekly
- [ ] Review error rates weekly
- [ ] Update dependencies monthly
- [ ] Review and update monitored accounts monthly
- [ ] Check cache performance monthly
- [ ] Review and optimize queries quarterly

### Updates
- [ ] Test updates in staging first
- [ ] Update dependencies regularly
- [ ] Monitor for security advisories
- [ ] Keep documentation updated

## Support Contacts

- **Technical Issues**: [Your support email]
- **API Issues**: [API support contact]
- **User Questions**: See `aiapp/TWITTER_INTEGRATION_GUIDE.md`

## Additional Resources

- **User Guide**: `aiapp/TWITTER_INTEGRATION_GUIDE.md`
- **API Documentation**: `c1_api/README.md`
- **Design Document**: `.kiro/specs/twitter-dashboard-integration/design.md`
- **Requirements**: `.kiro/specs/twitter-dashboard-integration/requirements.md`
- **Tasks**: `.kiro/specs/twitter-dashboard-integration/tasks.md`

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: _____________
**Notes**: _____________
