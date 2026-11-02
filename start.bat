@echo off
REM Real Estate AI Operations Hub - One-Click Launcher (v3.0.0)
echo =========================================================
echo   Starting Real Estate AI Maintenance Operations Hub
echo   Architecture: FastAPI + React Vite TypeScript + Supabase
echo =========================================================

if not exist .env (
    if exist .env.example (
        echo [.env] not found. Generating default [.env] from [.env.example]...
        copy .env.example .env > nul
    )
)

echo.
echo Launching Full-Stack Operations Hub server on http://127.0.0.1:8000/ ...
echo Default Admin Login: admin@realestate.com / Admin12345!
echo Default Tenant Login: johnny@cashmusic.com / Tenant12345!
echo.
echo Press Ctrl+C to terminate the server.
echo.

python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1
pause
