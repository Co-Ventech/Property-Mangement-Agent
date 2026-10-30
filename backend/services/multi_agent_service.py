"""
Service Layer: Implements Multi-Agent Collaboration & AI Triage.
Coordinates:
- Safety Shield (deterministic keyword regex)
- Agent 1: Maintenance Intake Analyst
- Agent 2: History Investigator (queries 24-month work orders)
- Agent 3/4/5: Dispatch Generators (Email, SMS, WhatsApp)
"""
import os, json, re
from typing import List, Optional
from backend.config.settings import LLM_PROVIDER, LLM_MODEL, LLM_API_KEY
from backend.models.ticket import MultiAgentAnalysis
from backend.services.agent_config_service import AgentConfigService

EMERGENCY_PATTERN = re.compile(
    r"\b(gas leak|smell gas|fire|smoke|flood|flooding|burst pipe|pipe burst|sparking|carbon monoxide|no heat|sewage|break-?in|roof collapse)\b",
    re.I
)


class MultiAgentService:
    @staticmethod
    def check_safety_hazards(text: str) -> Optional[str]:
        """Scans submission text for immediate life-safety hazards."""
        hit = EMERGENCY_PATTERN.search(text)
        return hit.group(0) if hit else None

    @staticmethod
    def run_collaboration_pipeline(
        title: str,
        description: str,
        flat_number: str,
        image_paths: Optional[List[str]] = None
    ) -> MultiAgentAnalysis:
        """Executes the collaborative agent pipeline with LLM or deterministic fallback."""
        cfg = AgentConfigService.load_config()
        matched_history = AgentConfigService.get_unit_history(flat_number)
        history_context = json.dumps(matched_history, indent=2)

        prompt = f"""You are coordinating a collaborative multi-agent maintenance triage workflow:

AGENT 1 [Intake Analyst]:
Role instruction: {cfg.get('intake_prompt')}
Task: Extract physical symptoms, determine equipment category, identify flat number, and list any missing diagnostic information.

AGENT 2 [History Investigator]:
Role instruction: {cfg.get('investigator_prompt')}
Available Historical Work Orders for Unit {flat_number}:
{history_context if matched_history else 'No prior recorded service records for this specific unit.'}
Task: Cross-reference current complaint with past repair outcomes and flag repeat/chronic component failures.

AGENT 3 [Contractor Email Dispatch Agent]:
Role instruction: {cfg.get('email_agent_prompt')}
Task: Write an authoritative dispatch work order email citing history if relevant.

AGENT 4 [Contractor SMS Dispatch Agent]:
Role instruction: {cfg.get('sms_agent_prompt', 'Generate a concise SMS dispatch alert.')}
Task: Write an urgent, concise SMS text for mobile dispatch.

AGENT 5 [Contractor WhatsApp Dispatch Agent]:
Role instruction: {cfg.get('whatsapp_agent_prompt', 'Format a structured WhatsApp dispatch briefing.')}
Task: Write a structured WhatsApp dispatch message with bold headers and action steps.

Current Tenant Submission:
Unit Number: {flat_number}
Headline: {title}
Description: {description}

Return ONLY strict raw JSON conforming to this schema without markdown:
{{
  "urgency": "emergency" | "urgent" | "routine",
  "severity": <integer 1-5>,
  "category": "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "pest" | "security" | "other",
  "extracted_symptoms": ["<symptom 1>", "<symptom 2>"],
  "missing_info": ["<information needed from tenant if any>"],
  "history_synthesis": "<Agent 2 synthesis: e.g. Unit has 2 prior HVAC repairs in June ($240) and August ($210) citing capacitor strain>",
  "combined_report": "<Shared Result: synthesized summary connecting current symptoms with historical evidence>",
  "ai_rating_rationale": "<Plain-English explanation of why this priority and severity were assigned>",
  "action_plan": ["<step 1>", "<step 2>", "<step 3>"],
  "estimated_cost": "<cost range or warranty status>",
  "contractor_dispatch_email": "Subject: Work Order: [Category] - Unit {flat_number}\\n\\n...",
  "contractor_dispatch_sms": "[DISPATCH] Unit {flat_number} [Category] Priority: [Urgency]. Issue: [Brief]. Confirm ETA.",
  "contractor_dispatch_whatsapp": "*WORK ORDER DISPATCH*\\n*Unit:* {flat_number}\\n*Issue:* ...\\n*Priority:* ...\\n*Action Required:* ...\\nPlease reply with ETA."
}}
"""
        if LLM_PROVIDER == "gemini" and LLM_API_KEY:
            try:
                from google import genai
                from PIL import Image

                client = genai.Client(api_key=LLM_API_KEY)
                contents = [prompt]
                if image_paths:
                    for img_path in image_paths:
                        if os.path.exists(img_path):
                            try:
                                contents.append(Image.open(img_path))
                            except Exception:
                                pass

                resp = client.models.generate_content(model=LLM_MODEL, contents=contents)
                raw = resp.text.strip()
                if raw.startswith("```"):
                    raw = re.sub(r"^```(?:json)?\n?", "", raw)
                    raw = re.sub(r"\n?```$", "", raw).strip()
                res_obj = MultiAgentAnalysis.model_validate_json(raw)
                res_obj.history_matches = matched_history
                return res_obj
            except Exception as e:
                print(f"[MultiAgentService] Gemini invocation error: {e}")

        # Deterministic Heuristic Fallback
        hit = MultiAgentService.check_safety_hazards(f"{title} {description}")
        urgency = "emergency" if hit else "routine"
        severity = 5 if hit else 2

        hist_summary = (
            f"Found {len(matched_history)} previous work order(s) on record for Unit {flat_number}."
            if matched_history
            else f"No prior historical repair records found for Unit {flat_number}."
        )

        action_plan = [
            "Review historical work order logs against current symptom profile",
            "Dispatch specialized trade technician with prior repair context",
            "Verify complete resolution and update equipment log"
        ]

        rationale = (
            f"Assigned {urgency.upper()} with severity score {severity}/5 based on physical symptom analysis and building risk mitigation guidelines."
        )

        return MultiAgentAnalysis(
            urgency=urgency,
            severity=severity,
            category="other",
            extracted_symptoms=[title, "reported fault"],
            missing_info=["Serial/model number confirmation if accessible"],
            history_matches=matched_history,
            history_synthesis=hist_summary,
            combined_report=f"Intake Analyst categorized complaint. History Investigator cross-referenced Unit {flat_number} database: {hist_summary}",
            ai_rating_rationale=rationale,
            action_plan=action_plan,
            estimated_cost="$150 - $350 (Subject to inspection)",
            contractor_dispatch_email=f"Subject: Work Order: Maintenance Dispatch - Unit {flat_number}\n\nDear Contractor Partner,\n\nPlease review an authorized work order for Unit {flat_number}.\nIssue: {title}\nDescription: {description}\n\nHistorical Context:\n{hist_summary}\n\nPlease confirm dispatch ETA.\n\nOperations Facilities Team",
            contractor_dispatch_sms=f"[DISPATCH ALERT] Unit {flat_number} - {title}. Urgency: {urgency.upper()}. Please confirm acceptance.",
            contractor_dispatch_whatsapp=f"*WORK ORDER DISPATCH*\n*Unit:* {flat_number}\n*Priority:* {urgency.upper()}\n*Issue:* {title}\n*Description:* {description}\n*History:* {hist_summary}\n\n_Please reply with your technician ETA._"
        )

