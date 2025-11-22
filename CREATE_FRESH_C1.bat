@echo off
echo ========================================
echo CREATE FRESH C1 APP - OFFICIAL THESYS
echo ========================================
echo.
echo This will create a brand new C1 app using Thesys official CLI
echo.
pause

cd "C:\Users\CVN B850I GAMING\.kiro\TradingAgents"

echo Creating fresh C1 app...
npx create-c1-app@latest alphaflow-fresh

echo.
echo ========================================
echo DONE! Now configure it:
echo ========================================
echo.
echo 1. cd alphaflow-fresh
echo 2. Create .env file with:
echo    THESYS_API_KEY=your_key_here
echo 3. npm run dev
echo 4. Test at http://localhost:3000
echo.
pause
