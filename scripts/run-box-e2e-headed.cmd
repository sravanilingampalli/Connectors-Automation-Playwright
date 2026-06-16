@echo off
cd /d "%~dp0.."
echo Running Box connector e2e tests in headed mode...
node node_modules\@playwright\test\cli.js test tests/e2e/connectors/es-connectors-box.spec.ts --project=chromium-app-manager --headed %*
exit /b %ERRORLEVEL%
