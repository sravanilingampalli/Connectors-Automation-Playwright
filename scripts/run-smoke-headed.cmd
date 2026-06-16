@echo off
cd /d "%~dp0.."
echo Running smoke test in headed mode...
node node_modules\@playwright\test\cli.js test tests/smoke/es-connectors-admin-panel.smoke.spec.ts --project=chromium-app-manager --headed
exit /b %ERRORLEVEL%
