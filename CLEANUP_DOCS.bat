@echo off
echo ========================================
echo ORGANIZING DOCUMENTATION
echo ========================================

REM Create docs folder structure
mkdir docs 2>nul
mkdir docs\guides 2>nul
mkdir docs\testing 2>nul
mkdir docs\issues 2>nul
mkdir docs\archive 2>nul

echo.
echo Moving documentation files...

REM Move guides
move /Y *_GUIDE.md docs\guides\ 2>nul
move /Y *_CHECKLIST.md docs\guides\ 2>nul
move /Y *_PLAN.md docs\guides\ 2>nul
move /Y QUICK_*.md docs\guides\ 2>nul
move /Y START_*.md docs\guides\ 2>nul

REM Move testing files
move /Y test_*.py docs\testing\ 2>nul
move /Y *_TEST*.md docs\testing\ 2>nul
move /Y diagnose_*.py docs\testing\ 2>nul
move /Y check_*.py docs\testing\ 2>nul
move /Y verify_*.py docs\testing\ 2>nul

REM Move issue documentation
move /Y *_ISSUE*.md docs\issues\ 2>nul
move /Y *_FIX*.md docs\issues\ 2>nul
move /Y *_ERROR*.md docs\issues\ 2>nul
move /Y *_DIAGNOSIS.md docs\issues\ 2>nul
move /Y CACHE_*.md docs\issues\ 2>nul
move /Y THESYS_*.md docs\issues\ 2>nul

REM Move old summaries to archive
move /Y SESSION_*.md docs\archive\ 2>nul
move /Y FINAL_*.md docs\archive\ 2>nul
move /Y *_SUMMARY.md docs\archive\ 2>nul
move /Y *_STATUS.md docs\archive\ 2>nul
move /Y *_COMPLETE.md docs\archive\ 2>nul

REM Keep important files in root
echo.
echo Keeping in root:
echo - README_MASTER.md (main documentation)
echo - COMPLETE_SYSTEM_ARCHITECTURE.md (system overview)
echo - .env files
echo - package.json files
echo - Source code folders

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Documentation organized in:
echo   docs\guides\    - Setup and usage guides
echo   docs\testing\   - Test scripts
echo   docs\issues\    - Issue tracking and fixes
echo   docs\archive\   - Old session notes
echo.
pause
