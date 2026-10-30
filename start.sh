#!/bin/bash
# Real Estate AI Operations Hub - One-Click Launcher (Linux / macOS)

echo "========================================================="
echo "  Starting Real Estate AI Maintenance Operations Hub"
echo "========================================================="

if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "[.env] not found. Generating default [.env] from [.env.example]..."
        cp .env.example .env
    fi
fi

python3 -m pip install -q -r requirements.txt
echo "Launching Operations Hub server on http://127.0.0.1:8000/dashboard/ ..."
python3 -m uvicorn backend.main:app --port 8000 --host 127.0.0.1

