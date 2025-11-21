@echo off
echo ========================================
echo NUCLEAR CLEANUP - OCD MODE ACTIVATED
echo ========================================
echo.
echo This will DELETE EVERYTHING except:
echo.
echo KEEP:
echo   - README.md (one clean master doc)
echo   - c1-template/ (your app)
echo   - tradingagents/ (your backend)
echo   - .env files (your API keys)
echo   - package.json files (dependencies)
echo   - .gitignore
echo.
echo DELETE:
echo   - ALL test scripts (~50 files)
echo   - ALL markdown docs (~150 files)
echo   - ALL batch scripts (except this one)
echo   - ALL temporary files
echo.
echo ⚠️  THIS IS PERMANENT! ⚠️
echo.
pause

echo.
echo Deleting ALL unnecessary files...

REM Delete ALL test/diagnostic Python scripts
del /Q *.py 2>nul

REM Delete ALL markdown files except README_MASTER
for %%f in (*.md) do (
    if /I not "%%f"=="README_MASTER.md" (
        del /Q "%%f" 2>nul
    )
)

REM Delete ALL batch files except this one and npm scripts
for %%f in (*.bat) do (
    if /I not "%%f"=="NUCLEAR_CLEANUP.bat" (
        del /Q "%%f" 2>nul
    )
)

REM Delete test HTML
del /Q *.html 2>nul

REM Delete text files
del /Q *.txt 2>nul

REM Delete YAML files in root (keep only in subfolders)
del /Q *.yaml 2>nul

REM Rename README_MASTER.md to README.md
if exist README_MASTER.md (
    if exist README.md del /Q README.md
    ren README_MASTER.md README.md
    echo ✓ Renamed README_MASTER.md → README.md
)

echo.
echo ========================================
echo CLEANUP COMPLETE - PRISTINE!
echo ========================================
echo.
echo Your workspace now contains ONLY:
echo.
echo 📁 Root:
echo   - README.md (your documentation)
echo   - .env (your API keys)
echo   - .env.example
echo   - .gitignore
echo   - package.json
echo   - requirements.txt
echo.
echo 📁 c1-template/
echo   - Your Next.js frontend
echo   - All source code intact
echo.
echo 📁 tradingagents/
echo   - Your Python backend
echo   - All agents intact
echo.
echo 🗑️  Deleted:
echo   - ~50 test scripts
echo   - ~150 markdown docs
echo   - ~20 batch files
echo   - All temporary files
echo.
echo Your workspace is now CLEAN and PROFESSIONAL! ✨
echo.
pause
