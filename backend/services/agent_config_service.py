"""
Service Layer: Handles Agent Configurations and Historical Work Order Lookups.
"""
import os, json
from typing import Dict, Any, List
from backend.config.settings import AGENT_CONFIG_FILE, HISTORICAL_RECORDS_FILE

DEFAULT_CONFIG = {
    "intake_prompt": "You are the Maintenance Intake Analyst. Analyze the tenant request, classify category and urgency, extract physical symptoms, identify property flat number, and list any missing diagnostic information.",
    "investigator_prompt": "You are the Maintenance History Investigator. Search past work order records for this flat and category. Identify recurring component failures, chronic breakdowns, and previous technician notes.",
    "email_agent_prompt": "You are the Contractor Communications & Dispatch Agent. Synthesize intake findings and historical failure patterns into an authoritative, professional work order dispatch email for the specialized contractor.",
    "sms_agent_prompt": "You are the Contractor SMS Dispatch Agent. Generate an urgent, concise mobile SMS dispatch text containing unit number, critical symptoms, and action request.",
    "whatsapp_agent_prompt": "You are the Contractor WhatsApp Communications Agent. Format a structured WhatsApp dispatch briefing with bold headers, priority indicators, unit location, and contractor confirmation prompt.",
    "history_records": []
}


class AgentConfigService:
    @staticmethod
    def load_config() -> Dict[str, Any]:
        """Loads prompt configurations and historical repair datasets."""
        cfg = dict(DEFAULT_CONFIG)
        if os.path.exists(AGENT_CONFIG_FILE):
            try:
                with open(AGENT_CONFIG_FILE, "r") as f:
                    cfg.update(json.load(f))
            except Exception as e:
                print(f"[AgentConfigService] Read error: {e}")

        if not cfg.get("history_records") and os.path.exists(HISTORICAL_RECORDS_FILE):
            try:
                with open(HISTORICAL_RECORDS_FILE, "r") as f:
                    cfg["history_records"] = json.load(f)
            except Exception:
                pass

        return cfg

    @staticmethod
    def save_config(cfg: Dict[str, Any]):
        """Persists agent prompt modifications."""
        with open(AGENT_CONFIG_FILE, "w") as f:
            json.dump(cfg, f, indent=2)

    @staticmethod
    def get_unit_history(flat_number: str) -> List[Dict[str, Any]]:
        """Finds all previous work order records for a specific unit."""
        cfg = AgentConfigService.load_config()
        history = cfg.get("history_records", [])
        target = str(flat_number).strip().upper()
        return [
            rec for rec in history
            if str(rec.get("flat_number", "")).strip().upper() == target
        ]

