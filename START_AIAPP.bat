@echo off
echo ============================================================
echo Starting aiapp (Custom Dashboard)
echo ============================================================
echo.

echo Step 1: Starting TradingAgents API...
start "TradingAgents API" cmd /k "python tradingagents_api.py"

echo Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo.
echo Step 2: Starting aiapp Dashboard...
cd aiapp
start "aiapp Dashboard" cmd /k "npm run dev"
cd ..

echo.
echo ============================================================
echo STARTED!
echo ============================================================
echo.
echo Wait 15 seconds, then open: http://localhost:3000
echo.
echo Try the chat in the dashboard!
echo.
pause
