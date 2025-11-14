@echo off
echo ========================================
echo Dashboard Testing Suite Launcher
echo ========================================
echo.
echo This will open the dashboard test suite.
echo.
echo OPTION 1: Open as standalone HTML file
echo -----------------------------------------
start "" "aiapp\public\test-dashboard.html"
echo Opened test-dashboard.html in your browser
echo.
echo OPTION 2: Run with aiapp server (recommended)
echo -----------------------------------------
echo If you want full functionality, start the aiapp server:
echo   cd aiapp
echo   npm run dev
echo Then navigate to: http://localhost:3000/test-dashboard.html
echo.
pause
