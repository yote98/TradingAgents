@echo off
echo ========================================
echo DELETING TEMPORARY TEST FILES
echo ========================================
echo.
echo This will delete:
echo - Old test scripts
echo - Temporary diagnostic files
echo - Session summaries
echo - Duplicate documentation
echo.
echo Files to KEEP:
echo - README_MASTER.md
echo - COMPLETE_SYSTEM_ARCHITECTURE.md
echo - Source code (c1-template, tradingagents)
echo - .env files
echo.
pause

echo.
echo Deleting files...

REM Delete old test scripts
del /Q test_*.py 2>nul
del /Q check_*.py 2>nul
del /Q diagnose_*.py 2>nul
del /Q verify_*.py 2>nul
del /Q analyze_*.py 2>nul
del /Q demo_*.py 2>nul
del /Q quick_start.py 2>nul
del /Q setup_*.py 2>nul
del /Q prove_*.py 2>nul
del /Q clear_cache.py 2>nul

REM Delete old session summaries
del /Q SESSION_*.md 2>nul
del /Q FINAL_*.md 2>nul
del /Q *_SUMMARY.md 2>nul
del /Q *_STATUS.md 2>nul
del /Q *_COMPLETE.md 2>nul
del /Q *_PROGRESS.md 2>nul
del /Q *_ACCOMPLISHMENTS.md 2>nul

REM Delete temporary issue docs
del /Q *_FIX*.md 2>nul
del /Q *_ERROR*.md 2>nul
del /Q *_ISSUE*.md 2>nul
del /Q DEBUG_*.md 2>nul
del /Q PROBLEM_*.md 2>nul
del /Q EMERGENCY_*.md 2>nul
del /Q RECOVERY_*.md 2>nul

REM Delete cache/diagnosis docs
del /Q CACHE_*.md 2>nul
del /Q VISUAL_FLOW_*.md 2>nul
del /Q SYSTEM_FLOW_*.md 2>nul
del /Q CHAT_ISSUE_*.md 2>nul
del /Q MODEL_SWITCH_*.md 2>nul
del /Q TAURIC_*.md 2>nul
del /Q THESYS_CACHE_*.md 2>nul

REM Delete old guides (keep only essential ones)
del /Q QUICK_*.md 2>nul
del /Q START_*.md 2>nul
del /Q DO_THIS_*.md 2>nul
del /Q SLEEP_*.md 2>nul
del /Q WAIT_*.md 2>nul
del /Q SIMPLE_*.md 2>nul
del /Q GETTING_*.md 2>nul
del /Q GET_STARTED_*.md 2>nul

REM Delete duplicate/old checklists
del /Q *_CHECKLIST.md 2>nul
del /Q PRE_*.md 2>nul
del /Q BETA_*.md 2>nul

REM Delete old deployment docs
del /Q DEPLOY_*.md 2>nul
del /Q DEPLOYMENT_*.md 2>nul
del /Q VERCEL_*.md 2>nul
del /Q RENDER_*.md 2>nul

REM Delete old feature docs
del /Q BACKTESTING_*.md 2>nul
del /Q RISK_MANAGEMENT_*.md 2>nul
del /Q CUSTOM_ANALYSTS_*.md 2>nul
del /Q AGENT_*.md 2>nul
del /Q ANALYST_*.md 2>nul
del /Q COACH_*.md 2>nul
del /Q TWITTER_*.md 2>nul
del /Q SOCIAL_*.md 2>nul
del /Q MARKETDATA_*.md 2>nul
del /Q ALPACA_*.md 2>nul
del /Q CRYPTO_*.md 2>nul
del /Q MODAL_*.md 2>nul
del /Q STRIPE_*.md 2>nul
del /Q GEMINI_*.md 2>nul
del /Q OPENAI_*.md 2>nul

REM Delete old planning docs
del /Q TOMORROW_*.md 2>nul
del /Q THIS_WEEK_*.md 2>nul
del /Q THIS_MONTH_*.md 2>nul
del /Q THIS_QUARTER_*.md 2>nul
del /Q NEXT_STEPS_*.md 2>nul
del /Q TODAY_*.md 2>nul

REM Delete old status/tracking docs
del /Q WHATS_*.md 2>nul
del /Q WHAT_*.md 2>nul
del /Q WHICH_*.md 2>nul
del /Q API_SOURCES_*.md 2>nul
del /Q DATA_*.md 2>nul
del /Q CONFIDENCE_*.md 2>nul
del /Q IMPLEMENTATION_*.md 2>nul
del /Q INTEGRATION_*.md 2>nul

REM Delete old UI/enhancement docs
del /Q LANDING_PAGE_*.md 2>nul
del /Q DASHBOARD_*.md 2>nul
del /Q HYBRID_*.md 2>nul
del /Q VISUAL_*.md 2>nul
del /Q PRICE_ACCURACY_*.md 2>nul
del /Q DARK_*.md 2>nul
del /Q JADE_*.md 2>nul
del /Q HYDRATION_*.md 2>nul
del /Q SIDEBAR_*.md 2>nul

REM Delete old C1/Thesys docs
del /Q C1_*.md 2>nul
del /Q THESYS_*.md 2>nul

REM Delete old master guides
del /Q MASTER_*.md 2>nul

REM Delete old pricing/launch docs
del /Q PRICING_*.md 2>nul
del /Q LAUNCH_*.md 2>nul

REM Delete test HTML files
del /Q test_*.html 2>nul

REM Delete old batch files (keep only useful ones)
del /Q START_*.bat 2>nul
del /Q open_*.bat 2>nul
del /Q start_*.bat 2>nul

REM Delete old text files
del /Q QUICK_START.txt 2>nul
del /Q test_results.txt 2>nul

REM Delete walk forward report
del /Q walk_forward_report.md 2>nul

REM Delete AI response files
del /Q AI_*.md 2>nul

REM Delete old MCP docs
del /Q MCP_*.md 2>nul
del /Q ALPHA_VANTAGE_*.md 2>nul

REM Delete old test/prompt docs
del /Q TEST_PROMPTS.md 2>nul
del /Q test_price_accuracy.md 2>nul

REM Delete old comparison/help docs
del /Q AI_COMPARISON_*.md 2>nul
del /Q AI_HELP_*.md 2>nul

REM Delete solution docs
del /Q SOLUTION_*.md 2>nul

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Kept essential files:
echo - README_MASTER.md (main documentation)
echo - COMPLETE_SYSTEM_ARCHITECTURE.md (system overview)
echo - Source code folders
echo - Configuration files
echo.
echo Deleted:
echo - 100+ temporary test scripts
echo - Old session summaries
echo - Duplicate documentation
echo - Diagnostic files
echo.
pause
