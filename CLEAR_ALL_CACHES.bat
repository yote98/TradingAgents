@echo off
echo ========================================
echo CLEARING ALL CACHES - NUCLEAR OPTION
echo ========================================

cd c1-template

echo.
echo [1/5] Stopping any running dev servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [2/5] Deleting .next build cache...
if exist .next (
    rmdir /s /q .next
    echo ✓ Deleted .next
) else (
    echo - No .next folder found
)

echo.
echo [3/5] Deleting node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✓ Deleted node_modules/.cache
) else (
    echo - No cache folder found
)

echo.
echo [4/5] Clearing npm cache...
call npm cache clean --force
echo ✓ NPM cache cleared

echo.
echo [5/5] Reinstalling dependencies...
call npm install
echo ✓ Dependencies reinstalled

echo.
echo ========================================
echo ALL CACHES CLEARED!
echo ========================================
echo.
echo Now run: npm run dev
echo Then hard refresh your browser (Ctrl+Shift+R)
echo.
pause
