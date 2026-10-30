"""
Configuration & Environment Settings Module.
Centralizes app parameters, database connection strings, and provider policies.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# App settings
PORT = int(os.getenv("PORT", 8000))
HOST = os.getenv("HOST", "127.0.0.1")

# Database settings
DB_PATH = os.getenv("DB_PATH", "crm.db")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# AI / LLM Provider settings
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").lower()
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.0-flash")
LLM_API_KEY = os.getenv("LLM_API_KEY", "")
ALLOW_PAID_SERVICES = os.getenv("ALLOW_PAID_SERVICES", "false").lower() == "true"

# Paths
AGENT_CONFIG_FILE = "backend/agent_config.json"
HISTORICAL_RECORDS_FILE = "backend/historical_records.json"
UPLOADS_DIR = "backend/uploads"
FRONTEND_DIR = "frontend"
STATIC_DIR = "frontend"

# Provider validation
FREE_PROVIDERS = {"gemini", "ollama"}


def validate_provider_config():
    """Validates that provider adheres to the free-first policy."""
    if LLM_PROVIDER not in FREE_PROVIDERS and not ALLOW_PAID_SERVICES:
        raise RuntimeError(
            f"Provider '{LLM_PROVIDER}' is not in free baseline. Set ALLOW_PAID_SERVICES=true to authorize."
        )

    if LLM_PROVIDER != "ollama" and not LLM_API_KEY:
        raise RuntimeError(f"LLM_API_KEY is required for '{LLM_PROVIDER}' provider.")

    return LLM_PROVIDER, LLM_API_KEY

