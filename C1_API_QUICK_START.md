# C1 Backend API - Quick Start Guide

Your C1 Backend API is ready to run! Here's how to get started.

## What's Been Built

✅ **Complete API Structure**:
- Coach plans endpoints (`/api/coach-plans/all`, `/api/coach-plans/{id}`)
- System endpoints (`/health`, `/metrics`)
- Mock mode for testing without Discord
- CORS configured for frontend access

✅ **Tasks Completed**:
- Task 1: Project structure ✓
- Task 2: Coach service layer ✓
- Task 3: Coach plans API routes ✓
- Task 6: System routes ✓
- Task 7: Main Flask application ✓
- Task 8: Error handling ✓

## Quick Start (3 Steps)

### 1. Install Dependencies

```bash
# Install Flask and CORS
pip install -r requirements-c1-api.txt
```

### 2. Verify Configuration

Your `.env` file is already configured with:
- `USE_MOCK_MODE=true` (no Discord needed!)
- `API_PORT=5000`
- `CORS_ORIGINS` includes localhost:3000

### 3. Start the Server

```bash
python c1_api_server.py
```

You should see:
```
============================================================
C1 Backend API Server Starting
============================================================
Mode: Mock
Debug: False
CORS Origins: ['http://localhost:3000', 'http://localhost:3001']
============================================================
 * Running on http://0.0.0.0:5000
```

## Test the API

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime_seconds": 5.23
}
```

### Get All Coach Plans
```bash
curl http://localhost:5000/api/coach-plans/all
```

Expected response:
```json
{
  "coach_d": {
    "plan": "NVDA showing bullish flag pattern...",
    "created_at": "2024-01-15T10:30:00Z",
    "charts": ["https://example.com/chart.png"]
  },
  "coach_i": { ... },
  "coach_s": { ... },
  "coach_n": { ... }
}
```

### Get Specific Coach Plan
```bash
curl http://localhost:5000/api/coach-plans/coach_d
```

### Get Metrics
```bash
curl http://localhost:5000/metrics
```

## Connect Your Frontend

Your C1 frontend is already configured! Just:

1. Make sure the backend is running on port 5000
2. In your frontend `.env.local`, set:
   ```
   NEXT_PUBLIC_USE_MOCK_DATA=false
   NEXT_PUBLIC_TRADINGAGENTS_API_URL=http://localhost:5000
   ```
3. Restart your Next.js dev server
4. Visit your dashboard - coach plans should load!

## Available Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/metrics` | GET | API metrics |
| `/api/coach-plans/all` | GET | Get all coach plans |
| `/api/coach-plans/{id}` | GET | Get specific coach plan |
| `/api/coach-plans/info` | GET | Get service info |

## Mock Mode vs Real Mode

**Mock Mode** (current):
- No Discord bot needed
- Returns realistic sample data
- Perfect for development

**Real Mode** (when ready):
1. Set up Discord bot (see `docs/COACH_DISCORD_SETUP.md`)
2. Update `.env`: `USE_MOCK_MODE=false`
3. Add `DISCORD_BOT_TOKEN=your_token`
4. Restart server

## Troubleshooting

### Port Already in Use
```bash
# Windows: Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or use a different port
API_PORT=8000 python c1_api_server.py
```

### CORS Errors
- Check `CORS_ORIGINS` in `.env` includes your frontend URL
- Restart the API server after changing `.env`

### Import Errors
```bash
# Make sure you're in the project root
cd path/to/tradingagents

# Install dependencies
pip install -r requirements-c1-api.txt
```

## Next Steps

### Remaining Tasks (Optional)

- **Task 4-5**: Analysis endpoints (for running TradingAgents analysis)
- **Task 9**: Environment documentation (already done!)
- **Task 10**: API documentation (see `c1_api/README.md`)
- **Task 11**: Tests (optional)

### Add Analysis Endpoint

When you're ready to add stock analysis:
1. Implement Task 4 (analysis service)
2. Implement Task 5 (analysis routes)
3. Register analysis blueprint in `c1_api_server.py`

## Production Deployment

For production, use a proper WSGI server:

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 c1_api_server:app
```

## Support

- Full API docs: `c1_api/README.md`
- Spec files: `.kiro/specs/c1-backend-api/`
- Discord setup: `docs/COACH_DISCORD_SETUP.md`

---

**Your API is ready to use!** 🚀

Start the server and test it with the commands above.
