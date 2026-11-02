import re
import json
from typing import Dict, Any, List, Optional
from backend.app.core.config import settings

EMERGENCY_PATTERN = re.compile(
    r"\b(gas leak|smell gas|fire|smoke|flood|flooding|burst pipe|pipe burst|sparking|carbon monoxide|no heat|sewage|break-?in|roof collapse)\b",
    re.I
)

def check_safety_hazards(text: str) -> Optional[str]:
    """Scan text for immediate life-safety hazards requiring emergency escalation."""
    match = EMERGENCY_PATTERN.search(text)
    return match.group(0) if match else None

def deterministic_fallback_triage(
    title: str,
    description: str,
    unit_history: List[Dict[str, Any]],
    hazard_match: Optional[str] = None
) -> Dict[str, Any]:
    """Heuristic fallback triage ensuring dependable classification without LLM dependency."""
    combined = f"{title} {description}".lower()
    
    # 1. Determine Category
    if any(k in combined for k in ["pipe", "water", "leak", "drip", "clog", "drain", "toilet", "faucet", "sink", "shower"]):
        category = "plumbing"
    elif any(k in combined for k in ["ac", "air condition", "heat", "heater", "furnace", "thermostat", "vent"]):
        category = "hvac"
    elif any(k in combined for k in ["spark", "outlet", "breaker", "circuit", "light", "power", "switch", "wire"]):
        category = "electrical"
    elif any(k in combined for k in ["door", "lock", "cabinet", "window", "hinge", "drawer", "deck", "wood"]):
        category = "carpentry"
    elif any(k in combined for k in ["fridge", "refrigerator", "stove", "oven", "dishwasher", "washer", "dryer"]):
        category = "appliance"
    elif any(k in combined for k in ["roof", "ceiling leak", "gutter", "shingle"]):
        category = "roofing"
    else:
        category = "other"

    # 2. Determine Urgency & Severity
    if hazard_match:
        urgency = "emergency"
        severity = 5
        rationale = f"Safety Shield Alert: Life-safety hazard keyword '{hazard_match}' triggered immediate emergency escalation."
    elif any(k in combined for k in ["urgent", "overflow", "freezing", "hot water", "no power", "spark"]):
        urgency = "urgent"
        severity = 4
        rationale = "Elevated urgency assigned due to risk of property damage or significant habitability impact."
    elif any(k in combined for k in ["broken", "not working", "fail", "slow"]):
        urgency = "urgent"
        severity = 3
        rationale = "Moderate urgency assigned: Standard functional impairment requiring technician inspection."
    else:
        urgency = "routine"
        severity = 2
        rationale = "Routine classification: Minor or non-blocking maintenance request."

    # 3. History Synthesis
    if unit_history:
        history_findings = f"Found {len(unit_history)} previous ticket(s) on file for this unit. Prior issues: " + "; ".join(
            [f"{h.get('title', '')} ({h.get('category', '')}, {h.get('status', '')})" for h in unit_history[:3]]
        )
    else:
        history_findings = "No prior recorded work orders or recurring failures found on file for this unit."

    # 4. Action plan & estimated cost
    action_plan = [
        "Acknowledge tenant submission and verify safety status",
        f"Dispatch licensed {category} contractor if repairs require on-site intervention",
        "Perform pressure/operation testing and confirm tenant satisfaction"
    ]

    cost_estimates = {
        "plumbing": "$120 - $350 (Standard Service & Parts)",
        "hvac": "$180 - $500 (Diagnostic & Component Service)",
        "electrical": "$150 - $400 (Licensed Electrician Callout)",
        "carpentry": "$90 - $280 (Labor & Materials)",
        "appliance": "$110 - $320 (Appliance Tech Diagnostic)",
        "roofing": "$250 - $750 (Roof / Flashing Inspection)",
        "other": "$85 - $200 (General Maintenance)"
    }
    est_cost = cost_estimates.get(category, "$100 - $300")
    ai_summary = f"{urgency.upper()}: {category.title()} request regarding '{title}'. Estimated cost: {est_cost}."

    return {
        "urgency": urgency,
        "severity": severity,
        "category": category,
        "ai_rationale": rationale,
        "ai_summary": ai_summary,
        "history_findings": history_findings,
        "action_plan": action_plan,
        "est_cost": est_cost,
        "safety_alert": hazard_match
    }

class TriageService:
    def triage_ticket(
        self,
        title: str,
        description: str,
        unit_history: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Run the two-stage triage pipeline:
        Stage 1: Safety Shield regex check (overrides all if life-hazard).
        Stage 2: Single structured Gemini call with fallback.
        """
        unit_history = unit_history or []
        hazard = check_safety_hazards(f"{title} {description}")

        # If LLM API key is present and provider is gemini, attempt single call
        if settings.LLM_API_KEY and settings.LLM_PROVIDER.lower() == "gemini":
            try:
                from google import genai
                client = genai.Client(api_key=settings.LLM_API_KEY)
                
                history_text = "\n".join(
                    [f"- {h.get('title')} ({h.get('category')}, status: {h.get('status')})" for h in unit_history[:4]]
                ) if unit_history else "No previous records."

                prompt = f"""You are an expert AI Property Maintenance Triage Agent.
Analyze this tenant request and return ONLY strict valid JSON conforming to the schema below.

Tenant Request:
Title: {title}
Description: {description}
Prior Unit History:
{history_text}

JSON Schema:
{{
  "urgency": "emergency" | "urgent" | "routine",
  "severity": <integer 1 to 5>,
  "category": "plumbing" | "electrical" | "hvac" | "carpentry" | "appliance" | "roofing" | "other",
  "ai_rationale": "<brief explanation of priority and severity>",
  "ai_summary": "<concise one-line summary>",
  "history_findings": "<synthesis of prior issues for this unit>",
  "action_plan": ["<step 1>", "<step 2>", "<step 3>"],
  "est_cost": "<cost estimate range, e.g. $150 - $350>"
}}
"""
                response = client.models.generate_content(
                    model=settings.LLM_MODEL,
                    contents=prompt
                )
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                data = json.loads(text.strip())

                # Enforce safety override if regex triggered
                if hazard:
                    data["urgency"] = "emergency"
                    data["severity"] = 5
                    data["safety_alert"] = hazard
                    data["ai_rationale"] = f"Safety Shield Alert: Life-safety hazard keyword '{hazard}' triggered emergency override. " + data.get("ai_rationale", "")

                return data
            except Exception:
                # Silently fallback to deterministic rule triage
                pass

        return deterministic_fallback_triage(title, description, unit_history, hazard)

triage_service = TriageService()

