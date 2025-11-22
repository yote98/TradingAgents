@echo off
echo ========================================
echo WAIT AND TEST PLAN
echo ========================================
echo.
echo The latest fix is deploying to Vercel now.
echo.
echo WAIT 2-3 MINUTES, then:
echo.
echo 1. Go to: https://www.ai-trades.my/chat
echo 2. Click "New Chat" button (creates fresh thread)
echo 3. Ask: "what's NVDA price?"
echo.
echo Expected result: $180+ (correct price)
echo.
echo If you see $145 again, we'll switch to Render.
echo Render has ZERO caching issues.
echo.
echo ========================================
echo BACKUP PLAN: Deploy to Render
echo ========================================
echo.
echo 1. Go to https://render.com
echo 2. New Web Service
echo 3. Connect GitHub repo: TradingAgents
echo 4. Root Directory: c1-template
echo 5. Build: npm install ^&^& npm run build
echo 6. Start: npm start
echo 7. Add environment variables
echo 8. Deploy!
echo.
echo Render is simpler and has no caching nightmares.
echo.
pause
