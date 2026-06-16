@echo off
cd /d "%~dp0.."
echo Installing Playwright Chromium browser to your user profile...
node node_modules\@playwright\test\cli.js install chromium
if %ERRORLEVEL% NEQ 0 (
  echo Browser install failed.
  exit /b %ERRORLEVEL%
)
echo Done. Browsers installed successfully.
