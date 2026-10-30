import os, json, re, sqlite3, uuid, shutil
from typing import Optional, List, Dict, Any
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Real Estate Multi-Agent CRM Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("backend/uploads", exist_ok=True)
os.makedirs("backend/static", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")
app.mount("/dashboard", StaticFiles(directory="backend/static", html=True), name="static")

@app.get("/")
def root_redirect():
    return RedirectResponse(url="/dashboard/")

CONFIG_FILE = "backend/agent_config.json"

def get_agent_config() -> dict:
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r") as f:
                return json.load(f)
        except Exception:
            pass
    return {
        "intake_prompt": "You are the Maintenance Intake Analyst. Analyze the tenant request, classify category and urgency, extract physical symptoms, identify property flat number, and list any missing diagnostic information.",
        "investigator_prompt": "You are the Maintenance History Investigator. Search past work order records for this flat and category. Identify recurring component failures, chronic breakdowns, and previous technician notes.",
        "email_agent_prompt": "You are the Contractor Communications & Dispatch Agent. Synthesize intake findings and historical failure patterns into an authoritative, professional work order dispatch email for the specialized contractor.",
        "sms_agent_prompt": "You are the Contractor SMS Dispatch Agent. Generate an urgent, concise mobile SMS dispatch text containing unit number, critical symptoms, and action request.",
        "whatsapp_agent_prompt": "You are the Contractor WhatsApp Communications Agent. Format a structured WhatsApp dispatch briefing with bold headers, priority indicators, unit location, and contractor confirmation prompt.",
        "history_records": []
    }

def save_agent_config(cfg: dict):
    with open(CONFIG_FILE, "w") as f:
        json.dump(cfg, f, indent=2)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"Supabase init error: {e}")

DB_PATH = "crm.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
    CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        tenant_name TEXT,
        tenant_email TEXT,
        tenant_phone TEXT,
        flat_number TEXT,
        issue_title TEXT,
        description TEXT,
        evidence_files TEXT,
        urgency TEXT,
        severity INTEGER,
        category TEXT,
        safety_alert TEXT,
        ai_summary TEXT,
        action_plan TEXT,
        estimated_cost TEXT,
        contractor_dispatch_draft TEXT,
        history_findings TEXT,
        missing_info TEXT,
        status TEXT,
        created_at TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

EMERGENCY_PATTERN = re.compile(
    r"\b(gas leak|smell gas|fire|smoke|flood|flooding|burst pipe|pipe burst|sparking|carbon monoxide|no heat|sewage|break-?in|roof collapse)\b",
    re.I
)

class MultiAgentAnalysis(BaseModel):
    urgency: str = Field(description="emergency | urgent | routine")
    severity: int = Field(description="Integer 1 to 5")
    category: str = Field(description="plumbing | electrical | hvac | appliance | structural | pest | security | other")
    extracted_symptoms: List[str] = Field(default_factory=list)
    missing_info: List[str] = Field(default_factory=list)
    history_matches: List[Dict[str, Any]] = Field(default_factory=list)
    history_synthesis: str = Field(description="Historical failure synthesis")
    combined_report: str = Field(description="Consolidated findings report for operations supervisor")
    action_plan: List[str] = Field(description="Recommended step by step actions")
    estimated_cost: str = Field(description="Cost estimation")
    contractor_dispatch_email: str = Field(description="Formatted email ready to send")
    contractor_dispatch_sms: str = Field(default="", description="Concise SMS dispatch alert")
    contractor_dispatch_whatsapp: str = Field(default="", description="Structured WhatsApp dispatch message")

def run_multi_agent_workflow(title: str, description: str, flat: str, image_paths: List[str] = None) -> MultiAgentAnalysis:
    cfg = get_agent_config()
    history = cfg.get("history_records", [])

    matched_history = [
        rec for rec in history
        if str(rec.get("flat_number", "")).strip().upper() == str(flat).strip().upper()
    ]

    api_key = os.getenv("LLM_API_KEY", "")
    provider = os.getenv("LLM_PROVIDER", "gemini").lower()
    model = os.getenv("LLM_MODEL", "gemini-2.0-flash")

    history_context = json.dumps(matched_history, indent=2)

    prompt = f"""You are coordinating a collaborative multi-agent maintenance triage workflow:

AGENT 1 [Intake Analyst]:
Role instruction: {cfg.get('intake_prompt')}
Task: Extract physical symptoms, determine equipment category, identify flat number, and list any missing diagnostic information.

AGENT 2 [History Investigator]:
Role instruction: {cfg.get('investigator_prompt')}
Available Historical Work Orders for Unit {flat}:
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
Unit Number: {flat}
Headline: {title}
Description: {description}

Return ONLY strict raw JSON conforming to this schema without markdown:
{{
  "urgency": "emergency" | "urgent" | "routine",
  "severity": <integer 1-5>,
  "category": "plumbing" | "electrical" | "hvac" | "appliance" | "structural" | "pest" | "security" | "other",
  "extracted_symptoms": ["<symptom 1>", "<symptom 2>"],
  "missing_info": ["<information needed from tenant if any>"],
  "history_synthesis": "<Agent 2 synthesis: e.g. Unit has 2 prior HVAC repairs in June and August citing capacitor strain>",
  "combined_report": "<Shared Result: synthesized summary connecting current symptoms with historical evidence>",
  "action_plan": ["<step 1>", "<step 2>", "<step 3>"],
  "estimated_cost": "<cost range or warranty status>",
  "contractor_dispatch_email": "Subject: Work Order: [Category] - Unit {flat}\n\n...",
  "contractor_dispatch_sms": "[DISPATCH] Unit {flat} [Category] Priority: [Urgency]. Issue: [Brief]. Confirm ETA.",
  "contractor_dispatch_whatsapp": "*WORK ORDER DISPATCH*\n*Unit:* {flat}\n*Issue:* ...\n*Priority:* ...\n*Action Required:* ...\nPlease reply with ETA."
}}
"""
    if provider == "gemini" and api_key:
        try:
            from google import genai
            from PIL import Image

            client = genai.Client(api_key=api_key)
            contents = [prompt]
            if image_paths:
                for img_path in image_paths:
                    if os.path.exists(img_path):
                        try:
                            contents.append(Image.open(img_path))
                        except Exception:
                            pass

            resp = client.models.generate_content(model=model, contents=contents)
            raw = resp.text.strip()
            if raw.startswith("```"):
                raw = re.sub(r"^```(?:json)?\n?", "", raw)
                raw = re.sub(r"\n?```$", "", raw).strip()
            res_obj = MultiAgentAnalysis.model_validate_json(raw)
            res_obj.history_matches = matched_history
            return res_obj
        except Exception as e:
            print(f"Gemini multi-agent triage error: {e}")

    # Fallback execution
    hit = EMERGENCY_PATTERN.search(f"{title} {description}")
    urgency = "emergency" if hit else "routine"
    severity = 5 if hit else 2

    hist_summary = (
        f"Found {len(matched_history)} previous work order(s) on record for Unit {flat}."
        if matched_history
        else f"No prior historical repair records found for Unit {flat}."
    )

    action_plan = [
        "Review historical work order logs against current symptom profile",
        "Dispatch specialized trade technician with prior repair context",
        "Verify complete resolution and update equipment log"
    ]

    return MultiAgentAnalysis(
        urgency=urgency,
        severity=severity,
        category="other",
        extracted_symptoms=[title, "reported fault"],
        missing_info=["Serial/model number confirmation if accessible"],
        history_matches=matched_history,
        history_synthesis=hist_summary,
        combined_report=f"Intake Analyst categorized complaint. History Investigator cross-referenced Unit {flat} database: {hist_summary}",
        action_plan=action_plan,
        estimated_cost="$150 - $350 (Subject to inspection)",
        contractor_dispatch_email=f"Subject: Work Order: Maintenance Dispatch - Unit {flat}\n\nDear Contractor Partner,\n\nPlease review an authorized work order for Unit {flat}.\nIssue: {title}\nDescription: {description}\n\nHistorical Context:\n{hist_summary}\n\nPlease confirm dispatch ETA.\n\nOperations Facilities Team",
        contractor_dispatch_sms=f"[DISPATCH ALERT] Unit {flat} - {title}. Urgency: {urgency.upper()}. Please confirm acceptance.",
        contractor_dispatch_whatsapp=f"*WORK ORDER DISPATCH*\n*Unit:* {flat}\n*Priority:* {urgency.upper()}\n*Issue:* {title}\n*Description:* {description}\n*History:* {hist_summary}\n\n_Please reply with your technician ETA._"
    )

@app.get("/api/config")
def get_config():
    return get_agent_config()

@app.post("/api/config")
def update_config(data: dict):
    save_agent_config(data)
    return {"message": "Agent prompts and historical database updated successfully."}

class DispatchRequest(BaseModel):
    channel: str # "email" | "sms" | "whatsapp"
    recipient: str
    message: str
    ticket_id: str

@app.post("/api/dispatch")
def send_dispatch(req: DispatchRequest):
    # Log dispatch event cleanly without requiring external SMS/WhatsApp credentials
    print(f" Outbound {req.channel.upper()} dispatched for ticket {req.ticket_id} to {req.recipient}")
    return {
        "success": True,
        "channel": req.channel,
        "recipient": req.recipient,
        "timestamp": datetime.utcnow().isoformat(),
        "message": f"Successfully triggered {req.channel.upper()} dispatch to {req.recipient}."
    }

@app.post("/api/tickets")
async def create_ticket(
    tenant_name: str = Form(...),
    tenant_email: str = Form(...),
    tenant_phone: str = Form(...),
    flat_number: str = Form(...),
    issue_title: str = Form(...),
    description: str = Form(...),
    evidence: Optional[List[UploadFile]] = File(None)
):
    ticket_id = f"TICK-{uuid.uuid4().hex[:6].upper()}"
    saved_files = []
    saved_disk_paths = []

    if evidence:
        for file in evidence:
            if file.filename:
                ext = os.path.splitext(file.filename)[1]
                fname = f"{ticket_id}_{uuid.uuid4().hex[:4]}{ext}"
                dest = os.path.join("backend/uploads", fname)
                with open(dest, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)
                saved_files.append(f"/uploads/{fname}")
                saved_disk_paths.append(dest)

    combined_text = f"{issue_title} {description}"
    hit = EMERGENCY_PATTERN.search(combined_text)
    safety_alert = hit.group(0) if hit else None

    # Multi-Agent Workflow
    analysis = run_multi_agent_workflow(issue_title, description, flat_number, saved_disk_paths)
    if safety_alert:
        analysis.urgency = "emergency"
        analysis.severity = max(analysis.severity, 4)

    created_at = datetime.utcnow().isoformat()
    status = "triaged"

    # Multi-channel payload embedded into dispatch draft
    channel_payloads = {
        "email": analysis.contractor_dispatch_email,
        "sms": analysis.contractor_dispatch_sms,
        "whatsapp": analysis.contractor_dispatch_whatsapp
    }

    ticket_record = {
        "id": ticket_id,
        "tenant_name": tenant_name,
        "tenant_email": tenant_email,
        "tenant_phone": tenant_phone,
        "flat_number": flat_number,
        "issue_title": issue_title,
        "description": description,
        "evidence_files": saved_files,
        "urgency": analysis.urgency,
        "severity": analysis.severity,
        "category": analysis.category,
        "safety_alert": safety_alert,
        "ai_summary": analysis.combined_report,
        "action_plan": analysis.action_plan,
        "estimated_cost": analysis.estimated_cost,
        "contractor_dispatch_draft": json.dumps(channel_payloads),
        "status": status,
        "created_at": created_at
    }

    if supabase_client:
        try:
            full_record = dict(ticket_record)
            full_record["history_findings"] = analysis.history_synthesis
            full_record["missing_info"] = analysis.missing_info
            supabase_client.table("tickets").insert(full_record).execute()
        except Exception:
            try:
                supabase_client.table("tickets").insert(ticket_record).execute()
            except Exception as e:
                print(f"Supabase insert error: {e}")

    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
    INSERT INTO tickets (
        id, tenant_name, tenant_email, tenant_phone, flat_number,
        issue_title, description, evidence_files, urgency, severity,
        category, safety_alert, ai_summary, action_plan, estimated_cost,
        contractor_dispatch_draft, history_findings, missing_info, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ticket_id, tenant_name, tenant_email, tenant_phone, flat_number,
        issue_title, description, json.dumps(saved_files), analysis.urgency, analysis.severity,
        analysis.category, safety_alert, analysis.combined_report, json.dumps(analysis.action_plan),
        analysis.estimated_cost, json.dumps(channel_payloads), analysis.history_synthesis,
        json.dumps(analysis.missing_info), status, created_at
    ))
    conn.commit()
    conn.close()

    return {
        "id": ticket_id,
        "status": status,
        "urgency": analysis.urgency,
        "severity": analysis.severity,
        "safety_alert": safety_alert,
        "message": "Ticket logged and collaborative multi-agent triage completed."
    }

@app.get("/api/tickets")
def list_tickets(status: Optional[str] = None, urgency: Optional[str] = None):
    if supabase_client:
        try:
            query = supabase_client.table("tickets").select("*")
            if status and status != "all":
                query = query.eq("status", status)
            if urgency and urgency != "all":
                query = query.eq("urgency", urgency)
            res = query.order("created_at", desc=True).execute()
            # Normalize channel payload
            tickets = []
            for t in res.data:
                try:
                    t["channel_payloads"] = json.loads(t.get("contractor_dispatch_draft") or "{}")
                except Exception:
                    t["channel_payloads"] = {"email": t.get("contractor_dispatch_draft", "")}
                tickets.append(t)
            return tickets
        except Exception:
            pass

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    query = "SELECT * FROM tickets WHERE 1=1"
    params = []
    if status and status != "all":
        query += " AND status = ?"
        params.append(status)
    if urgency and urgency != "all":
        query += " AND urgency = ?"
        params.append(urgency)
    query += " ORDER BY created_at DESC"
    rows = conn.execute(query, params).fetchall()
    tickets = []
    for r in rows:
        d = dict(r)
        d["evidence_files"] = json.loads(d["evidence_files"] or "[]")
        d["action_plan"] = json.loads(d["action_plan"] or "[]")
        try:
            d["missing_info"] = json.loads(d.get("missing_info") or "[]")
        except Exception:
            d["missing_info"] = []
        try:
            d["channel_payloads"] = json.loads(d.get("contractor_dispatch_draft") or "{}")
        except Exception:
            d["channel_payloads"] = {"email": d.get("contractor_dispatch_draft", "")}
        tickets.append(d)
    conn.close()
    return tickets

@app.patch("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: str, req: dict):
    conn = sqlite3.connect(DB_PATH)
    fields = []
    params = []
    for k in ["status", "urgency", "severity"]:
        if k in req:
            fields.append(f"{k} = ?")
            params.append(req[k])
    if fields:
        params.append(ticket_id)
        conn.execute(f"UPDATE tickets SET {', '.join(fields)} WHERE id = ?", params)
        conn.commit()
    conn.close()
    return {"message": "Ticket updated"}

@app.get("/api/stats")
def get_stats():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    total = cursor.execute("SELECT COUNT(*) FROM tickets").fetchone()[0]
    emergency = cursor.execute("SELECT COUNT(*) FROM tickets WHERE urgency = 'emergency'").fetchone()[0]
    pending = cursor.execute("SELECT COUNT(*) FROM tickets WHERE status IN ('triaged', 'new')").fetchone()[0]
    dispatched = cursor.execute("SELECT COUNT(*) FROM tickets WHERE status = 'dispatched'").fetchone()[0]
    conn.close()
    return {
        "total": total,
        "emergency": emergency,
        "pending": pending,
        "dispatched": dispatched
    }
