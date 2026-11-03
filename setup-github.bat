@echo off
REM ==============================================================================
REM Helper Script: Publish Pool League Manager to GitHub (Windows)
REM ==============================================================================

echo.
echo ====================================================================
echo  Pool League Manager - Publish to GitHub (Windows)
echo ====================================================================
echo.

IF NOT EXIST ".git" (
    echo [*] Initializing local Git repository...
    git init -b main
) ELSE (
    echo [v] Git repository already initialized.
)

echo [*] Staging all files...
git add .

echo [*] Committing changes...
git commit -m "Deploy Pool League Manager with Railway and PostgreSQL support"

set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/pool-league-manager.git): "

IF "%REPO_URL%"=="" (
    echo [!] No URL provided. Please manually run:
    echo     git remote add origin YOUR_URL
    echo     git push -u origin main
    pause
    exit /b 1
)

git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%
git branch -M main

echo.
echo [*] Pushing to GitHub...
git push -u origin main

echo.
echo ====================================================================
echo  Done! Your repository is now on GitHub!
echo  Next: Head to https://railway.app/new to deploy from GitHub!
echo ====================================================================
pause
