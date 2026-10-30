@echo off
REM Real Estate AI Operations Hub - One-Click Launcher
echo =========================================================
echo   Starting Real Estate AI Maintenance Operations Hub
echo =========================================================

if not exist .env (
    if exist .env.example (
        echo [.env] not found. Generating default [.env] from [.env.example]...
        copy .env.example .env > nul
    )
)

echo Checking dependencies...
py -m pip install -q -r requirements.txt

echo.
echo Launching Operations Hub server on http://127.0.0.1:8000/dashboard/ ...
echo Press Ctrl+C to terminate the server.
echo.

py -m uvicorn backend.main:app --port 8000 --host 127.0.0.1
pause

