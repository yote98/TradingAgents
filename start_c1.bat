@echo off
echo ============================================================
echo Starting C1 + TradingAgents System
echo ============================================================
echo.

REM Check if .env exists
if not exist ".env" (
    echo ERROR: .env file not found!
    echo Please create .env with your OPENAI_API_KEY
    pause
    exit /b 1
)

REM Check if c1-template/.env exists
if not exist "c1-template\.env" (
    echo ERROR: c1-template/.env file not found!
    echo Please create it with your THESYS_API_KEY
    pause
    exit /b 1
)

echo Step 1: Starting TradingAgents API Server...
echo.
start "TradingAgents API" cmd /k "python tradingagents_api.py"

echo Waiting 5 seconds for API to start...
timeout /t 5 /nobreak > nul

echo.
echo Step 2: Starting C1 Frontend...
echo.
cd c1-template
start "C1 Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ============================================================
echo SYSTEM STARTED!
echo ============================================================
echo.
echo TradingAgents API: http://localhost:5000
echo C1 Frontend: http://localhost:3000
echo.
echo Wait 10-15 seconds for both servers to fully start,
echo then open: http://localhost:3000
echo.
echo Try asking: "Analyze AAPL stock"
echo.
echo Press any key to open browser...
pause > nul
start http://localhost:3000
