@echo off
echo ========================================================
echo Starting SalesPulse FastAPI Backend Server...
echo API URL: http://127.0.0.1:8000
echo Swagger Docs: http://127.0.0.1:8000/docs
echo ========================================================
cd /d "%~dp0"
call .venv\Scripts\activate.bat
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
pause

