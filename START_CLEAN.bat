@echo off
echo ============================================
echo TradingAgents - Clean Start
echo ============================================
echo.
echo This will start ONLY the frontend.
echo Backend is already running on Render.
echo.
echo Press Ctrl+C to stop at any time.
echo ============================================
echo.

cd c1-template
echo Starting frontend on http://localhost:3000...
echo.
npm run dev
