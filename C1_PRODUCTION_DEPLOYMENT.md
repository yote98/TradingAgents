# C1 Production Deployment Checklist

## Overview

Complete checklist for deploying your TradingAgents + C1 system to production. Follow this guide to ensure a smooth, secure, and reliable deployment.

---

## 📋 Pre-Deployment Checklist

### 1. Model Selection ✅

**Use stable, production-ready models:**

```typescript
// ✅ GOOD - Stable production model
model: "c1/anthropic/claude-sonnet-4/v-20250617"

// ❌ BAD - Deprecated or beta model
model: "c1/gpt-4-preview"
```

**Recommended models for TradingAgents:**
- **Primary**: `c1/anthropic/claude-sonnet-4/v-20250617`
- **Fallback**: `c1/openai/gpt-4o`
- **Budget**: `c1/openai/gpt-4o-mini`

**Check compatibility:**
- Visit: https://docs.thesys.dev/guides/models-pricing
- Verify your model is listed as "stable"
- Check SDK compatibility matrix

---

### 2. SDK Version Compatibility ✅

**Verify your SDK versions:**

```json
// package.json
{
  "dependencies": {
    "@thesysai/genui-sdk": "^0.6.31",  // Check latest stable
    "@crayonai/react-ui": "^0.8.24",   // Check compatibility
    "@crayonai/react-core": "^0.7.6"   // Check compatibility
  }
}
```

**Compatibility check:**
```bash
npm outdated
npm audit
```

**Update if needed:**
```bash
npm update @thesysai/genui-sdk @crayonai/react-ui @crayonai/react-core
```

---

### 3. Brand Customization ✅

**Apply your brand colors and styling:**

```typescript
// aiapp/src/app/page.tsx
<ThemeProvider
  theme={{
    colors: {
      primary: "#10b981",        // Your brand green
      secondary: "#3b82f6",      // Your brand blue
      background: "#111827",     // Dark background
      surface: "#1f2937",        // Card background
      text: "#f9fafb",          // Text color
      textSecondary: "#9ca3af", // Secondary text
      border: "#374151",        // Border color
      error: "#ef4444",         // Error red
      success: "#10b981",       // Success green
      warning: "#f59e0b",       // Warning orange
    },
    typography: {
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
      },
    },
    spacing: {
      xs: "0.25rem",
      sm: "0.5rem",
      md: "1rem",
      lg: "1.5rem",
      xl: "2rem",
    },
    borderRadius: {
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
    },
  }}
>
  <C1Chat apiUrl="/api/chat" />
</ThemeProvider>
```

**Add custom CSS:**

```css
/* aiapp/src/styles/c1-production.css */

/* Brand-specific overrides */
.crayon-chat-container {
  font-family: 'Inter', system-ui, sans-serif;
}

.crayon-message-user {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.crayon-message-assistant {
  background: #1f2937;
  border-left: 3px solid #10b981;
}

.crayon-button-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.crayon-chart {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

/* Loading states */
.crayon-loading {
  color: #10b981;
}

/* Error states */
.crayon-error {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid #ef4444;
}
```

---

### 4. Environment Configuration ✅

**Production environment variables:**

```bash
# .env.production

# API Keys
THESYS_API_KEY=your_production_key_here
OPENAI_API_KEY=your_openai_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# API URLs
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
TRADINGAGENTS_API_URL=https://tradingagents.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/tradingagents_prod
REDIS_URL=redis://host:6379

# Security
JWT_SECRET=your_secure_jwt_secret_here
SESSION_SECRET=your_secure_session_secret_here
CORS_ORIGIN=https://yourdomain.com

# Monitoring
SENTRY_DSN=your_sentry_dsn_here
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Feature Flags
ENABLE_THREAD_SHARING=true
ENABLE_ARTIFACT_EDITING=true
ENABLE_ANALYTICS=true
```

**Security checklist:**
- [ ] All API keys are production keys
- [ ] No development keys in production
- [ ] Secrets stored in secure vault (not in code)
- [ ] Environment variables properly scoped
- [ ] CORS configured correctly

---

### 5. Database Setup ✅

**Production database schema:**

```sql
-- threads table
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_public BOOLEAN DEFAULT FALSE,
  share_token VARCHAR(64) UNIQUE
);

-- messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- artifacts table
CREATE TABLE artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  artifact_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);

-- analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- indexes
CREATE INDEX idx_threads_user_id ON threads(user_id);
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_artifacts_thread_id ON artifacts(thread_id);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
```

**Database migrations:**
```bash
# Run migrations
npm run db:migrate

# Verify
npm run db:verify
```

---

### 6. Performance Optimization ✅

**Caching strategy:**

```typescript
// aiapp/src/lib/cache.ts
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function cacheToolResult(
  key: string,
  data: any,
  ttl: number = 300 // 5 minutes
) {
  await redis.setex(key, ttl, JSON.stringify(data));
}

export async function getCachedToolResult(key: string) {
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached) : null;
}

// Usage in chat endpoint
const cacheKey = `analysis:${ticker}:${Date.now() - (Date.now() % 300000)}`;
const cached = await getCachedToolResult(cacheKey);

if (cached) {
  return cached;
}

const result = await tradingAgents.analyze(ticker);
await cacheToolResult(cacheKey, result);
```

**Rate limiting:**

```typescript
// aiapp/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20, // 20 chat messages per minute
  message: 'Too many messages, please slow down',
});
```

**CDN configuration:**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['cdn.yourdomain.com'],
    loader: 'cloudinary', // or 'imgix', 'akamai'
  },
  
  // Enable compression
  compress: true,
  
  // Optimize builds
  swcMinify: true,
  
  // Static optimization
  output: 'standalone',
};
```

---

### 7. Security Hardening ✅

**API security:**

```typescript
// aiapp/src/middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  // Helmet for security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://api.thesys.dev"],
      },
    },
  }),
  
  // CORS
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
];
```

**Input validation:**

```typescript
// aiapp/src/lib/validation.ts
import { z } from 'zod';

export const chatRequestSchema = z.object({
  prompt: z.object({
    content: z.string().min(1).max(5000),
  }),
  threadId: z.string().uuid(),
});

export const analyzeRequestSchema = z.object({
  ticker: z.string().regex(/^[A-Z]{1,5}$/),
  analysts: z.array(z.enum(['market', 'fundamentals', 'news', 'social'])).optional(),
});

// Usage
export async function POST(req: NextRequest) {
  const body = await req.json();
  const validated = chatRequestSchema.parse(body); // Throws if invalid
  // ... proceed with validated data
}
```

**Authentication:**

```typescript
// aiapp/src/middleware/auth.ts
import { verify } from 'jsonwebtoken';

export async function authenticateRequest(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('No authentication token');
  }
  
  try {
    const decoded = verify(token, process.env.JWT_SECRET!);
    return decoded;
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}
```

---

### 8. Monitoring & Logging ✅

**Error tracking:**

```typescript
// aiapp/src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export function logError(error: Error, context?: any) {
  Sentry.captureException(error, {
    extra: context,
  });
  
  console.error('Error:', error, context);
}

export function logInfo(message: string, data?: any) {
  console.log(message, data);
}
```

**Analytics:**

```typescript
// aiapp/src/lib/analytics.ts
export async function trackEvent(
  userId: string,
  eventType: string,
  eventData: any
) {
  await fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
    }),
  });
}

// Usage
trackEvent(userId, 'stock_analyzed', { ticker: 'AAPL' });
trackEvent(userId, 'thread_shared', { threadId });
trackEvent(userId, 'artifact_edited', { artifactId });
```

**Health checks:**

```typescript
// aiapp/src/app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    tradingagents: await checkTradingAgents(),
    thesys: await checkThesysAPI(),
  };
  
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  
  return Response.json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  }, {
    status: healthy ? 200 : 503,
  });
}
```

---

### 9. Testing ✅

**Pre-deployment tests:**

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Load tests
npm run test:load

# Security scan
npm audit
npm run security:scan
```

**Test checklist:**
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Load tests show acceptable performance
- [ ] No critical security vulnerabilities
- [ ] Manual testing completed
- [ ] Cross-browser testing done
- [ ] Mobile testing done

---

### 10. Deployment Strategy ✅

**Blue-Green Deployment:**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app-blue:
    image: tradingagents-c1:latest
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_COLOR=blue
    ports:
      - "3000:3000"
  
  app-green:
    image: tradingagents-c1:latest
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_COLOR=green
    ports:
      - "3001:3000"
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
```

**Deployment steps:**

```bash
# 1. Build production image
docker build -t tradingagents-c1:latest .

# 2. Run tests on image
docker run tradingagents-c1:latest npm test

# 3. Deploy to green (inactive)
docker-compose up -d app-green

# 4. Health check green
curl https://green.yourdomain.com/api/health

# 5. Switch traffic to green
./scripts/switch-to-green.sh

# 6. Monitor for issues
./scripts/monitor.sh

# 7. If issues, rollback to blue
./scripts/rollback-to-blue.sh
```

---

## 📊 Production Checklist

### Pre-Launch
- [ ] Stable model selected
- [ ] SDK versions verified
- [ ] Brand customization applied
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Caching implemented
- [ ] Rate limiting configured
- [ ] Security hardened
- [ ] Monitoring set up
- [ ] All tests passing

### Launch Day
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Test critical user flows
- [ ] Verify analytics tracking
- [ ] Monitor API costs
- [ ] Check database performance

### Post-Launch
- [ ] Monitor for 24 hours
- [ ] Review error logs
- [ ] Check user feedback
- [ ] Analyze performance
- [ ] Optimize slow queries
- [ ] Review API costs
- [ ] Plan improvements

---

## 🚨 Rollback Plan

**If issues occur:**

```bash
# 1. Immediate rollback
./scripts/rollback.sh

# 2. Investigate issue
tail -f /var/log/app.log

# 3. Fix in development
git checkout -b hotfix/issue-name

# 4. Test fix
npm test

# 5. Deploy fix
./scripts/deploy-hotfix.sh

# 6. Monitor
./scripts/monitor.sh
```

---

## 📈 Performance Targets

### Response Times
- Chat response: < 2s (p95)
- Tool calls: < 5s (p95)
- Page load: < 1s (p95)

### Availability
- Uptime: 99.9%
- Error rate: < 0.1%

### Scalability
- Concurrent users: 1000+
- Messages/minute: 10,000+
- Database queries/second: 1000+

---

## 🔧 Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor API costs
- [ ] Review performance metrics

### Weekly
- [ ] Review user feedback
- [ ] Analyze usage patterns
- [ ] Update dependencies
- [ ] Backup database

### Monthly
- [ ] Security audit
- [ ] Performance optimization
- [ ] Cost optimization
- [ ] Feature planning

---

## 📚 Resources

- **C1 Docs**: https://docs.thesys.dev
- **Your Guides**: `C1_MASTER_INDEX.md`
- **Monitoring**: Sentry, DataDog, etc.
- **Support**: Thesys Discord

---

## ✅ Final Checklist

Before going live:

- [ ] All items in Pre-Launch checklist complete
- [ ] Rollback plan tested
- [ ] Team trained on monitoring
- [ ] Documentation updated
- [ ] Support team ready
- [ ] Announcement prepared
- [ ] Backup verified
- [ ] SSL certificates valid
- [ ] DNS configured
- [ ] CDN configured

**Ready to deploy!** 🚀
