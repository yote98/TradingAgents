@echo off
echo ========================================
echo Vercel Deployment Quick Check
echo ========================================
echo.
echo 1. Open Vercel Dashboard
echo    https://vercel.com/dashboard
echo.
echo 2. Find your project and copy the URL
echo.
echo 3. Then run:
echo    python test_production_openai.py YOUR_URL
echo.
echo Example:
echo    python test_production_openai.py https://template-c1.vercel.app
echo.
echo ========================================
echo.
set /p url="Enter your Vercel URL (or press Enter to open dashboard): "
if "%url%"=="" (
    start https://vercel.com/dashboard
    echo Opening Vercel Dashboard...
) else (
    echo.
    echo Testing %url%...
    python test_production_openai.py %url%
)
echo.
pause
