# Dashboard Sidebar Navigation - Deployment Checklist

## Pre-Deployment Checklist

### 1. Environment Setup

#### Frontend (Next.js)

- [ ] **Environment Variables**
  ```bash
  # .env.local or .env.production
  NEXT_PUBLIC_API_URL=https://api.yourdomain.com
  NEXT_PUBLIC_ENABLE_ANALYTICS=true
  NEXT_PUBLIC_CACHE_DURATION=300000
  NEXT_PUBLIC_ENVIRONMENT=production
  ```

- [ ] **Verify Node.js Version**
  ```bash
  node --version  # Should be 18.x or higher
  npm --version   # Should be 9.x or higher
  ```

- [ ] **Install Dependencies**
  ```bash
  cd aiapp
  npm install
  ```

#### Backend (Flask API)

- [ ] **Environment Variables**
  ```bash
  # .env
  API_HOST=0.0.0.0
  API_PORT=5000
  DEBUG_MODE=false
  CORS_ORIGINS=https://yourdomain.com
  
  # Required API Keys
  OPENAI_API_KEY=sk-...
  ALPHA_VANTAGE_API_KEY=...
  
  # Optional
  DISCORD_BOT_TOKEN=...
  STOCKTWITS_API_TOKEN=...
  
  # Configuration
  REQUEST_TIMEOUT=120
  COACH_PLANS_CACHE_TTL=30
  TWITTER_CACHE_DURATION=300
  USE_MOCK_MODE=false
  ```

- [ ] **Verify Python Version**
  ```bash
  python --version  # Should be 3.10 or higher
  ```

- [ ] **Install Dependencies**
  ```bash
  pip install -r requirements.txt
  pip install -r requirements-c1-api.txt
  ```

---

### 2. Code Quality Checks

- [ ] **Run Linter**
  ```bash
  cd aiapp
  npm run lint
  ```

- [ ] **Fix Linting Issues**
  ```bash
  npm run lint -- --fix
  ```

- [ ] **Type Check**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **Run Unit Tests**
  ```bash
  npm test
  ```

- [ ] **Run E2E Tests** (if applicable)
  ```bash
  npm run test:e2e
  ```

---

### 3. Build and Test

#### Frontend Build

- [ ] **Create Production Build**
  ```bash
  cd aiapp
  npm run build
  ```

- [ ] **Test Production Build Locally**
  ```bash
  npm run start
  # Visit http://localhost:3000/dashboard
  ```

- [ ] **Verify Build Output**
  - Check `.next/` directory exists
  - Verify no build errors or warnings
  - Check bundle size is reasonable (<500KB for main bundle)

#### Backend Test

- [ ] **Test Backend API**
  ```bash
  python c1_api_server.py
  ```

- [ ] **Verify Endpoints**
  ```bash
  # Health check
  curl http://localhost:5000/health
  
  # Coach plans
  curl http://localhost:5000/api/coach-plans/all
  
  # Test analysis (optional, costs API credits)
  curl -X POST http://localhost:5000/api/analyze \
    -H "Content-Type: application/json" \
    -d '{"ticker": "AAPL", "analysts": ["market"]}'
  ```

---

### 4. Performance Optimization

- [ ] **Run Lighthouse Audit**
  ```bash
  # In Chrome DevTools
  # Performance score should be 90+
  # Accessibility score should be 90+
  # Best Practices score should be 90+
  ```

- [ ] **Check Bundle Size**
  ```bash
  npm run build
  # Review .next/analyze output
  # Main bundle should be <500KB
  ```

- [ ] **Verify Code Splitting**
  - Check that sections are lazy-loaded
  - Verify separate chunks for each section
  - Confirm Suspense boundaries are working

- [ ] **Test Caching**
  - Verify API responses are cached (5 minutes)
  - Check localStorage persistence
  - Test cache invalidation

---

### 5. Security Checks

- [ ] **API Keys Security**
  - Verify `.env` is in `.gitignore`
  - Confirm no API keys in source code
  - Check environment variables are set correctly

- [ ] **CORS Configuration**
  - Verify `CORS_ORIGINS` includes production domain
  - Test CORS from production frontend
  - Confirm no wildcard (*) in production

- [ ] **Input Validation**
  - Test ticker validation (only uppercase letters)
  - Verify date range validation
  - Check analyst selection validation

- [ ] **XSS Prevention**
  - Verify no `dangerouslySetInnerHTML` usage
  - Check user input is sanitized
  - Test with malicious input

---

### 6. Accessibility Compliance

- [ ] **Run axe DevTools**
  - No critical accessibility violations
  - All interactive elements have labels
  - Proper heading hierarchy

- [ ] **Keyboard Navigation**
  - Test Alt+1 through Alt+7 shortcuts
  - Verify Tab navigation works
  - Check focus indicators are visible

- [ ] **Screen Reader Test**
  - Test with NVDA or JAWS
  - Verify all sections are announced
  - Check ARIA labels are correct

- [ ] **Color Contrast**
  - Verify 4.5:1 ratio for text
  - Check 3:1 ratio for UI components
  - Test in high contrast mode

---

### 7. Mobile Responsiveness

- [ ] **Test on Mobile Devices**
  - iPhone (Safari)
  - Android (Chrome)
  - Tablet (iPad)

- [ ] **Verify Mobile Features**
  - Sidebar collapses on mobile
  - Overlay works correctly
  - Touch targets are 44px minimum
  - Swipe gestures work (if implemented)

- [ ] **Test Different Screen Sizes**
  - 320px (small phone)
  - 768px (tablet)
  - 1024px (desktop)
  - 1920px (large desktop)

---

### 8. Browser Compatibility

- [ ] **Test in Browsers**
  - Chrome 90+ ✓
  - Firefox 88+ ✓
  - Safari 14+ ✓
  - Edge 90+ ✓

- [ ] **Verify Features**
  - LocalStorage works
  - Fetch API works
  - CSS Grid/Flexbox renders correctly
  - Lazy loading works

---

### 9. Data Migration (if applicable)

- [ ] **Backup Existing Data**
  ```bash
  # Backup coach plans database
  cp data/coach_plans.db data/coach_plans.db.backup
  
  # Backup localStorage (manual export from browser)
  ```

- [ ] **Test Data Migration**
  - Verify old localStorage keys are compatible
  - Test with existing user preferences
  - Confirm coach plans load correctly

- [ ] **Rollback Plan**
  - Document steps to restore old version
  - Keep backup of previous deployment
  - Test rollback procedure

---

## Deployment Steps

### Option 1: Vercel (Frontend) + Heroku/Railway (Backend)

#### Frontend Deployment (Vercel)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login and deploy
   cd aiapp
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL`
   - Add other `NEXT_PUBLIC_*` variables

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Verify Deployment**
   - Visit production URL
   - Test all sections
   - Check browser console for errors

#### Backend Deployment (Heroku)

1. **Create Heroku App**
   ```bash
   heroku create your-app-name
   ```

2. **Set Environment Variables**
   ```bash
   heroku config:set OPENAI_API_KEY=sk-...
   heroku config:set API_HOST=0.0.0.0
   heroku config:set API_PORT=5000
   heroku config:set DEBUG_MODE=false
   heroku config:set CORS_ORIGINS=https://your-frontend.vercel.app
   ```

3. **Create Procfile**
   ```
   web: gunicorn c1_api_server:app
   ```

4. **Deploy**
   ```bash
   git push heroku main
   ```

5. **Verify Deployment**
   ```bash
   heroku logs --tail
   curl https://your-app-name.herokuapp.com/health
   ```

---

### Option 2: Docker Deployment

#### Build Docker Images

1. **Frontend Dockerfile**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM node:18-alpine
   WORKDIR /app
   COPY --from=builder /app/.next ./.next
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/package*.json ./
   RUN npm ci --production
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Backend Dockerfile**
   ```dockerfile
   FROM python:3.10-slim
   WORKDIR /app
   
   COPY requirements.txt requirements-c1-api.txt ./
   RUN pip install --no-cache-dir -r requirements.txt -r requirements-c1-api.txt
   
   COPY . .
   
   EXPOSE 5000
   CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "c1_api_server:app"]
   ```

3. **Build and Run**
   ```bash
   # Build frontend
   docker build -t c1-frontend ./aiapp
   
   # Build backend
   docker build -t c1-backend .
   
   # Run with docker-compose
   docker-compose up -d
   ```

4. **docker-compose.yml**
   ```yaml
   version: '3.8'
   services:
     frontend:
       image: c1-frontend
       ports:
         - "3000:3000"
       environment:
         - NEXT_PUBLIC_API_URL=http://backend:5000
       depends_on:
         - backend
     
     backend:
       image: c1-backend
       ports:
         - "5000:5000"
       environment:
         - OPENAI_API_KEY=${OPENAI_API_KEY}
         - API_HOST=0.0.0.0
         - API_PORT=5000
         - CORS_ORIGINS=http://localhost:3000
   ```

---

### Option 3: VPS Deployment (DigitalOcean, AWS EC2, etc.)

1. **Setup Server**
   ```bash
   # SSH into server
   ssh user@your-server-ip
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install Python
   sudo apt install -y python3.10 python3-pip
   
   # Install Nginx
   sudo apt install -y nginx
   ```

2. **Clone Repository**
   ```bash
   git clone https://github.com/your-repo/tradingagents.git
   cd tradingagents
   ```

3. **Setup Frontend**
   ```bash
   cd aiapp
   npm install
   npm run build
   
   # Use PM2 for process management
   npm install -g pm2
   pm2 start npm --name "c1-frontend" -- start
   pm2 save
   pm2 startup
   ```

4. **Setup Backend**
   ```bash
   cd ..
   pip install -r requirements.txt -r requirements-c1-api.txt
   
   # Use gunicorn with systemd
   sudo nano /etc/systemd/system/c1-api.service
   ```
   
   ```ini
   [Unit]
   Description=C1 API Service
   After=network.target
   
   [Service]
   User=your-user
   WorkingDirectory=/path/to/tradingagents
   Environment="PATH=/usr/bin:/usr/local/bin"
   ExecStart=/usr/local/bin/gunicorn -w 4 -b 0.0.0.0:5000 c1_api_server:app
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```
   
   ```bash
   sudo systemctl enable c1-api
   sudo systemctl start c1-api
   ```

5. **Configure Nginx**
   ```bash
   sudo nano /etc/nginx/sites-available/c1-dashboard
   ```
   
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       # Frontend
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
       
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
   
   ```bash
   sudo ln -s /etc/nginx/sites-available/c1-dashboard /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Setup SSL (Let's Encrypt)**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```

---

## Post-Deployment Verification

### 1. Smoke Tests

- [ ] **Frontend Loads**
  - Visit production URL
  - Verify dashboard loads without errors
  - Check all sections are accessible

- [ ] **API Connectivity**
  - Test /health endpoint
  - Verify coach plans load
  - Test analysis endpoint (optional)

- [ ] **Navigation Works**
  - Click through all sidebar items
  - Test keyboard shortcuts
  - Verify mobile sidebar

### 2. Functional Tests

- [ ] **Home Section**
  - Recent activity displays
  - Quick stats show correct data
  - Quick action buttons work

- [ ] **Coaches Section**
  - Coach plans load
  - Auto-refresh works
  - Cards display correctly

- [ ] **Social Section**
  - Twitter feed loads
  - Ticker filtering works
  - Stocktwits toggle works

- [ ] **Analyze Section**
  - Form validation works
  - Analysis runs successfully
  - Results display correctly

- [ ] **Backtest Section**
  - Form validation works
  - Backtest runs successfully
  - Charts render correctly

- [ ] **Risk Section**
  - Calculations are accurate
  - Metrics display correctly
  - No console errors

- [ ] **Settings Section**
  - Settings save correctly
  - Theme switching works
  - Preferences persist

### 3. Performance Tests

- [ ] **Load Time**
  - Initial page load < 3 seconds
  - Section switching < 500ms
  - API responses < 2 seconds

- [ ] **Lighthouse Scores**
  - Performance: 90+
  - Accessibility: 90+
  - Best Practices: 90+
  - SEO: 80+

### 4. Monitoring Setup

- [ ] **Error Tracking**
  - Setup Sentry or similar
  - Configure error alerts
  - Test error reporting

- [ ] **Analytics**
  - Setup Google Analytics or similar
  - Track page views
  - Monitor user flows

- [ ] **Uptime Monitoring**
  - Setup UptimeRobot or similar
  - Monitor frontend and backend
  - Configure downtime alerts

- [ ] **Log Aggregation**
  - Setup log collection
  - Configure log retention
  - Setup log alerts

---

## Rollback Procedure

### If Deployment Fails

1. **Identify Issue**
   ```bash
   # Check frontend logs
   vercel logs  # or check PM2 logs
   
   # Check backend logs
   heroku logs --tail  # or check systemd logs
   ```

2. **Rollback Frontend**
   ```bash
   # Vercel
   vercel rollback
   
   # PM2
   pm2 stop c1-frontend
   git checkout previous-commit
   npm run build
   pm2 restart c1-frontend
   ```

3. **Rollback Backend**
   ```bash
   # Heroku
   heroku rollback
   
   # Systemd
   sudo systemctl stop c1-api
   git checkout previous-commit
   pip install -r requirements.txt
   sudo systemctl start c1-api
   ```

4. **Restore Database** (if needed)
   ```bash
   cp data/coach_plans.db.backup data/coach_plans.db
   ```

5. **Verify Rollback**
   - Test all critical functionality
   - Check error logs
   - Monitor for issues

---

## Maintenance

### Regular Tasks

- [ ] **Weekly**
  - Check error logs
  - Monitor API usage and costs
  - Review performance metrics

- [ ] **Monthly**
  - Update dependencies
  - Review security advisories
  - Backup database

- [ ] **Quarterly**
  - Run full security audit
  - Review and optimize performance
  - Update documentation

### Updating Dependencies

```bash
# Frontend
cd aiapp
npm outdated
npm update
npm audit fix

# Backend
pip list --outdated
pip install --upgrade package-name
```

---

## Support Contacts

- **Frontend Issues**: [Your contact]
- **Backend Issues**: [Your contact]
- **Infrastructure**: [Your contact]
- **Emergency**: [Your contact]

---

## Additional Resources

- [Dashboard Navigation Guide](./DASHBOARD_NAVIGATION_GUIDE.md)
- [API Documentation](../c1_api/README.md)
- [Testing Guide](./TESTING_VALIDATION_GUIDE.md)
- [Performance Optimization](./PERFORMANCE_OPTIMIZATIONS_COMPLETE.md)

---

**Last Updated**: November 2025  
**Version**: 1.0.0
