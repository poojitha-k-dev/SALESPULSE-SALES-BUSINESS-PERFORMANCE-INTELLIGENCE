@echo off
echo ========================================================
echo Launching SalesPulse BI Platform (Backend + Frontend)...
echo ========================================================
cd /d "%~dp0"
start "SalesPulse Backend API (:8000)" cmd /k run_backend.bat
timeout /t 3 /nobreak >nul
start "SalesPulse Frontend Dashboard (:5173)" cmd /k run_frontend.bat
echo Both services launched in separate windows!
echo Backend:  http://127.0.0.1:8000/docs
echo Frontend: http://localhost:5173
pause

