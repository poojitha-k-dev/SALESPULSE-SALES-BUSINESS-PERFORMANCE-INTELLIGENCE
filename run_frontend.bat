@echo off
echo ========================================================
echo Starting SalesPulse React Frontend Dashboard...
echo URL: http://localhost:5173
echo ========================================================
cd /d "%~dp0frontend"
pnpm run dev
pause

