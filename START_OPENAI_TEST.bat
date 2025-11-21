@echo off
echo ========================================
echo   OpenAI Migration Test
echo ========================================
echo.
echo Starting Next.js dev server...
echo.

cd c1-template
start cmd /k "npm run dev"

echo.
echo Waiting 10 seconds for server to start...
timeout /t 10 /nobreak > nul

echo.
echo Opening browser...
start http://localhost:3000/chat

echo.
echo ========================================
echo   Test Instructions:
echo ========================================
echo.
echo 1. Ask: "What's the current price of NVDA?"
echo 2. Verify it shows CURRENT price (not old cached $145)
echo 3. Ask: "Compare NVDA and TSLA"
echo 4. Verify both prices are fresh and current
echo.
echo Press any key to run Python test script...
pause > nul

python test_openai_migration.py

echo.
echo ========================================
echo   Migration Complete!
echo ========================================
echo.
pause
