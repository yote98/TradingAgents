@echo off
echo ============================================================
echo Testing C1 Frontend Setup
echo ============================================================
echo.

echo Checking environment...
echo.

REM Check Thesys API key
findstr /C:"THESYS_API_KEY=sk-th-" c1-template\.env >nul
if %errorlevel%==0 (
    echo [OK] Thesys API key found
) else (
    echo [ERROR] Thesys API key missing or invalid
    echo Please add your key to c1-template/.env
    pause
    exit /b 1
)

REM Check node_modules
if exist "c1-template\node_modules" (
    echo [OK] Dependencies installed
) else (
    echo [WARN] Dependencies not installed
    echo Installing now...
    cd c1-template
    call npm install
    cd ..
)

echo.
echo ============================================================
echo Starting C1 Frontend...
echo ============================================================
echo.
echo The frontend will start on: http://localhost:3000
echo.
echo IMPORTANT: Make sure TradingAgents API is running first!
echo If not, open another terminal and run: python tradingagents_api.py
echo.
echo Press any key to start the frontend...
pause >nul

cd c1-template
npm run dev
