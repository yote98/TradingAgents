@echo off
echo ========================================
echo Starting TradingAgents System
echo ========================================
echo.

REM Set environment variables
set OPENAI_API_KEY=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
set ALPHA_VANTAGE_API_KEY=H0MDWALD76X9X96C

echo Environment variables set
echo.
echo System is ready!
echo.
echo Available interfaces:
echo 1. C1 Chat - Open C1 application
echo 2. Dashboard - Run: cd aiapp ^&^& npm run dev
echo 3. Python - Run: python demo_complete_system.py
echo.
echo Press any key to exit...
pause > nul
