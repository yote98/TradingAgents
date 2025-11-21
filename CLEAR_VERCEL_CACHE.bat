@echo off
echo ========================================
echo VERCEL CACHE CLEAR INSTRUCTIONS
echo ========================================
echo.
echo The code is deployed. Now you need to:
echo.
echo 1. Go to: https://vercel.com/dashboard
echo 2. Select project: trading-agents-boli
echo 3. Go to Deployments tab
echo 4. Click latest deployment's "..." menu
echo 5. Select "Redeploy"
echo 6. UNCHECK "Use existing Build Cache"
echo 7. Click "Redeploy"
echo.
echo ========================================
echo After redeploy completes (2-3 min):
echo ========================================
echo.
echo Test in Chrome Incognito:
echo - Go to: https://www.ai-trades.my/chat
echo - Ask: "what's NVDA price?"
echo - Should see: $180+ (not $145)
echo.
echo If still seeing $145:
echo - Clear Chrome cache (Ctrl+Shift+Delete)
echo - Hard refresh (Ctrl+Shift+R)
echo.
pause
