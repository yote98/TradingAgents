@echo off
echo ========================================
echo FIXING AND RESTARTING DEV SERVER
echo ========================================

cd c1-template

echo.
echo [1/4] Killing existing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Deleting .next build cache...
if exist .next (
    rmdir /s /q .next
    echo ✓ Deleted .next
)

echo.
echo [3/4] Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Deleted cache
)

echo.
echo [4/4] Starting fresh dev server...
echo.
echo ========================================
echo Server starting... Watch for:
echo   - "Ready" message
echo   - "Local: http://localhost:3000"
echo ========================================
echo.

npm run dev
