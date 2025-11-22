@echo off
echo ========================================
echo Testing Financial Datasets MCP Setup
echo ========================================
echo.

echo Step 1: Testing MCP API directly...
python test_financial_datasets_mcp.py

echo.
echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. If MCP API test passed, start the dev server:
echo    cd c1-template
echo    npm run dev
echo.
echo 2. Then run this script again to test chat integration
echo.
echo 3. Or open http://localhost:3002 and ask "What's NVDA price?"
echo.
pause
