@echo off
echo ========================================
echo COPY FRESH THESYS TEMPLATE
echo ========================================
echo.
echo This will copy the fresh Thesys template from Downloads
echo to your workspace as 'c1-fresh'
echo.
pause

cd "C:\Users\CVN B850I GAMING\Downloads\template-c1-next (3)"

echo Copying template...
xcopy /E /I /Y . "C:\Users\CVN B850I GAMING\.kiro\TradingAgents\c1-fresh"

echo.
echo ========================================
echo DONE! Fresh template copied to c1-fresh
echo ========================================
echo.
echo Next steps:
echo 1. cd c1-fresh
echo 2. Copy .env from c1-template
echo 3. npm install
echo 4. npm run dev
echo 5. Test at http://localhost:3000/chat
echo.
pause
