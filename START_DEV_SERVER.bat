@echo off
echo ========================================
echo STARTING DEV SERVER WITH LOGS
echo ========================================

cd c1-template

echo.
echo Killing any existing Node processes...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting dev server...
echo Watch for these logs when you test:
echo   - Cache-busting ID
echo   - Injected data
echo.

npm run dev

pause
