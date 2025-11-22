@echo off
echo ========================================
echo Testing FREE MCP Tool Calling
echo ========================================
echo.
echo Using FREE APIs - No credits needed!
echo   - MarketData.app (FREE)
echo   - Alpha Vantage (FREE, 25/day)
echo   - yfinance (FREE, unlimited)
echo.
echo ========================================
echo.

python test_free_mcp.py

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Start dev server (if not running):
echo    cd c1-template
echo    npm run dev
echo.
echo 2. Open browser:
echo    http://localhost:3002
echo.
echo 3. Ask questions:
echo    "What's NVDA price?"
echo    "What's Nvidia trading at?"
echo    "Should I buy Apple?"
echo.
echo 4. Watch console for:
echo    [TESTING MODE] Fetching data via free APIs
echo    Got data from MarketData.app (FREE)
echo.
pause
