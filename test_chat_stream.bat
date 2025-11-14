@echo off
echo ========================================
echo Chat Stream Tester Launcher
echo ========================================
echo.
echo This tool tests your chat API streaming.
echo.
echo IMPORTANT: Your server must be running!
echo.
echo For c1-template:
echo   cd c1-template
echo   npm run dev
echo.
echo Then navigate to:
echo   http://localhost:3000/test-chat-stream.html
echo.
echo Opening in browser...
timeout /t 2 >nul
start http://localhost:3000/test-chat-stream.html
echo.
echo If the page doesn't load, make sure:
echo 1. Server is running (npm run dev)
echo 2. Server is on port 3000
echo 3. No errors in the terminal
echo.
pause
