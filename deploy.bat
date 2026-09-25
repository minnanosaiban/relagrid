@echo off
setlocal

rem ============================================================
rem  relagrid deploy (GitHub Pages)
rem  Double-click after changes to update the live site.
rem  Pushing to main is the deploy: GitHub Pages rebuilds
rem  https://minnanosaiban.github.io/relagrid/ within ~1 minute.
rem
rem  First-time setup: none (remote origin is already
rem    https://github.com/minnanosaiban/relagrid.git)
rem ============================================================

echo === Deploy relagrid to GitHub Pages ===
cd /d "%~dp0"
echo Current: %CD%

echo === Commit ^& Push to GitHub (main) ===
git add .
git commit -m "Update relagrid" || echo No changes to commit
git push -u origin main
if %errorlevel% neq 0 (
    echo [ERROR] Git push failed. The live site was NOT updated.
    echo         Check your network or GitHub auth ^(gh auth status^).
    pause
    exit /b 1
)

echo === Done ===
echo Live site: https://minnanosaiban.github.io/relagrid/
echo (It may take about 1 minute for GitHub Pages to reflect changes.)
pause
