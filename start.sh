#!/usr/bin/env bash
# Real Estate AI Operations Hub - One-Click Launcher (v3.0.0)
set -e

echo "========================================================="
echo "  Starting Real Estate AI Maintenance Operations Hub"
echo "  Architecture: FastAPI + React Vite TypeScript + Supabase"
echo "========================================================="

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "[.env] not found. Copying from [.env.example]..."
        cp .env.example .env
    fi
fi

echo ""
echo "Launching Operations Hub server on http://127.0.0.1:8000/ ..."
echo "Default Admin: admin@realestate.com / Admin12345!"
echo "Default Tenant: johnny@cashmusic.com / Tenant12345!"
echo ""

python3 -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1
