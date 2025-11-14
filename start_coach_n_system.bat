@echo off
echo ========================================
echo Starting Coach N (Unusual Whales) System
echo ========================================
echo.
echo This will start:
echo 1. Discord bot (captures signals)
echo 2. Auto-analyzer (analyzes signals)
echo.
echo Press Ctrl+C to stop both processes
echo ========================================
echo.

REM Start Discord bot in a new window
start "Discord Bot - Coach N" cmd /k python discord_to_coach_n.py

REM Wait a moment for the bot to start
timeout /t 3 /nobreak > nul

REM Start auto-analyzer in a new window
start "Auto Analyzer - Coach N" cmd /k python auto_analyze_signals.py

echo.
echo ✅ Both processes started!
echo.
echo Check the new windows to see:
echo - Discord Bot: Capturing signals from Unusual Whales
echo - Auto Analyzer: Running analysis when signals arrive
echo.
pause
