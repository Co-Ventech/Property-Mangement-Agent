"""
Seed Script: Seeds verifiable, multi-urgency maintenance tickets into the database.
Works seamlessly offline (local SQLite) or directly against Supabase if configured.
Updated with modern, realistic operational numbers, costs, and phone numbers.
"""
import os, json, sqlite3
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

DUMMY_TICKETS = [
    {
        "id": "TICK-EMRG01",
        "tenant_name": "Sarah Jenkins",
        "tenant_email": "sarah.j@residence.com",
        "tenant_phone": "+1 (512) 492-1084",
        "flat_number": "12A",
        "issue_title": "Severe gas leak smell near oven and water heater",
        "description": "Strong natural gas smell filling corridor and kitchen. Stove was off, suspect line leak. Occupants feeling dizzy.",
        "evidence_files": [],
        "urgency": "emergency",
        "severity": 5,
        "category": "hvac",
        "safety_alert": "gas leak",
        "ai_summary": "CRITICAL LIFE SAFETY INCIDENT. Immediate risk of gas explosion and asphyxiation. Deterministic safety rule triggered with priority override.",
        "action_plan": [
            "Evacuate occupants and open windows if safe",
            "Shut off main building gas valve at junction B",
            "Dispatch emergency utility line technician immediately"
        ],
        "estimated_cost": "$450 - $850 (Emergency Utility Dispatch & Certification)",
        "contractor_dispatch_draft": json.dumps({
            "email": "Subject: EMERGENCY WORK ORDER: Gas Leak - Unit 12A\n\nAttn: Emergency Dispatch Team,\nImmediate response required for Unit 12A. Combustible natural gas odor confirmed. Target arrival SLA: < 30 minutes.",
            "sms": "[CRITICAL EMERGENCY] Gas leak at Unit 12A. Evacuation active. Respond immediately with utility shut-off gear.",
            "whatsapp": "*EMERGENCY DISPATCH*\n*Unit:* 12A\n*Issue:* Natural gas odor detected.\n*Action:* Immediate emergency trade response required (SLA: < 30 min)."
        }),
        "history_findings": "Unit 12A had electrical breaker upgrades in May 2026 ($320). No prior gas line issues reported on record.",
        "missing_info": ["Building gas meter reading"],
        "ai_rating_rationale": "Classified as EMERGENCY (Severity 5/5) because combustible gas exposure presents immediate danger to life, safety, and property integrity. Mandates immediate priority escalation over standard ticketing.",
        "status": "triaged",
        "created_at": "2026-10-29T10:15:00Z"
    },
    {
        "id": "TICK-URG002",
        "tenant_name": "Marcus Vance",
        "tenant_email": "m.vance@urbanliving.com",
        "tenant_phone": "+1 (512) 782-9910",
        "flat_number": "4B",
        "issue_title": "AC stopped cooling again and compressor making loud grinding noise",
        "description": "Living room HVAC unit is blowing warm humid air. Third time this season. Grinding sound coming from outside condenser.",
        "evidence_files": [],
        "urgency": "urgent",
        "severity": 3,
        "category": "hvac",
        "safety_alert": None,
        "ai_summary": "Chronic equipment failure. Unit 4B HVAC has suffered 2 previous failures this summer (refrigerant leak in June, capacitor replacement in August). Compressor motor is seizing.",
        "action_plan": [
            "Perform electrical load test on run capacitor and winding resistance",
            "Verify condenser fan bearings and R-410A system pressure",
            "Initiate OEM compressor warranty replacement instead of repeat patch"
        ],
        "estimated_cost": "$350 - $650 (Labor & diagnostic; compressor under OEM warranty)",
        "contractor_dispatch_draft": json.dumps({
            "email": "Subject: Work Order: HVAC Chronic Recurrence - Unit 4B\n\nDear Apex Mechanical,\nUnit 4B AC has failed again. Please review technician logs from June ($240) and August ($210). Unit is experiencing recurrent compressor seizure.",
            "sms": "[URGENT] Unit 4B AC down again (compressor grinding). Please review prior summer logs and confirm technician ETA.",
            "whatsapp": "*WORK ORDER DISPATCH*\n*Unit:* 4B\n*Equipment:* HVAC\n*Note:* Repeat breakdown. Prior repairs failed to resolve compressor strain. Target SLA: < 24 hrs."
        }),
        "history_findings": "History Investigator: Unit 4B had repairs on 2026-06-12 ($240) and 2026-08-20 ($210). Recurring compressor electrical strain noted by technician. Potential $450 in redundant patch spend avoided by requesting OEM warranty replacement.",
        "missing_info": ["Thermostat error code"],
        "ai_rating_rationale": "Assigned URGENT priority (Severity 3/5) due to repeated failure history and loss of essential climate control. Not an immediate safety hazard, but technician notes indicate chronic compressor wear requiring prompt intervention before total burnout.",
        "status": "triaged",
        "created_at": "2026-10-29T11:45:00Z"
    },
    {
        "id": "TICK-URG003",
        "tenant_name": "Elena Rostova",
        "tenant_email": "elena.rostova@techcorp.io",
        "tenant_phone": "+1 (512) 301-4477",
        "flat_number": "7C",
        "issue_title": "Water leaking through bathroom ceiling drywall from upstairs",
        "description": "Active dripping from ceiling seam above bathtub. Drywall is soft and blistering. Bucket catching 1 cup per hour.",
        "evidence_files": [],
        "urgency": "urgent",
        "severity": 4,
        "category": "plumbing",
        "safety_alert": None,
        "ai_summary": "Active plumbing ingress from upper unit 8C. Risk of drywall collapse and mold progression if not contained within 24 hours.",
        "action_plan": [
            "Inspect Unit 8C bathroom floor seal, tub flange, and waste line",
            "Relieve drywall hydrostatic pressure to prevent ceiling collapse",
            "Deploy commercial dehumidifier and monitor moisture levels"
        ],
        "estimated_cost": "$380 - $720 (Trap repair & commercial drying)",
        "contractor_dispatch_draft": json.dumps({
            "email": "Subject: Urgent Work Order: Ceiling Water Leak - Unit 7C\n\nDear Vanguard Plumbing,\nActive water dripping from ceiling in Unit 7C originating from Unit 8C bathroom floor. Immediate inspection required.",
            "sms": "[URGENT PLUMBING] Unit 7C active ceiling drip from 8C. Required dispatch within 2 hours.",
            "whatsapp": "*URGENT DISPATCH*\n*Unit:* 7C / 8C\n*Issue:* Water penetration through drywall.\n*Action:* Trace supply/drain leak in upper unit immediately."
        }),
        "history_findings": "Unit 7C had bathroom damp stain treated on 2026-07-22 ($165). Prior silicone caulking in 8C appears to have degraded or a secondary waste pipe joint has failed.",
        "missing_info": ["Unit 8C resident availability window"],
        "ai_rating_rationale": "Rated URGENT with high Severity 4/5 because active water penetration causes progressive structural damage to drywall and electrical fixtures beneath, escalating repair costs rapidly if not mitigated within hours.",
        "status": "triaged",
        "created_at": "2026-10-29T13:20:00Z"
    },
    {
        "id": "TICK-ROUT04",
        "tenant_name": "David Kim",
        "tenant_email": "dkim88@consulting.org",
        "tenant_phone": "+1 (512) 912-3341",
        "flat_number": "3A",
        "issue_title": "Kitchen cabinet hinge loose and dishwasher rack wheel stuck",
        "description": "Upper cupboard door sags when opening. Bottom rack of dishwasher misses one roller wheel causing it to slide unevenly.",
        "evidence_files": [],
        "urgency": "routine",
        "severity": 1,
        "category": "appliance",
        "safety_alert": None,
        "ai_summary": "Cosmetic carpentry adjustment and standard dishwasher accessory replacement. Zero functional safety hazard.",
        "action_plan": [
            "Re-align cabinet Euro hinge screws with wood dowel reinforcement",
            "Order OEM replacement roller wheel kit for dishwasher rack",
            "Batch visit during weekly routine maintenance route"
        ],
        "estimated_cost": "$75 - $130 (Standard batch route visit)",
        "contractor_dispatch_draft": json.dumps({
            "email": "Subject: Routine Maintenance: Cabinet & Dishwasher - Unit 3A\n\nPlease schedule during next available standard maintenance route window.",
            "sms": "[ROUTINE] Unit 3A cabinet hinge & rack roller. Schedule next open window.",
            "whatsapp": "*ROUTINE WORK ORDER*\n*Unit:* 3A\n*Items:* Cupboard hinge + dishwasher wheel\n*Schedule:* Non-urgent batch route visit."
        }),
        "history_findings": "No prior work orders logged for Unit 3A.",
        "missing_info": ["Dishwasher model number plate"],
        "ai_rating_rationale": "Assigned ROUTINE priority and Severity 1/5 because the reported defects are cosmetic and minor hardware wear. There is no risk to habitability, safety, or structural durability, permitting batched scheduling.",
        "status": "triaged",
        "created_at": "2026-10-29T14:05:00Z"
    },
    {
        "id": "TICK-ROUT05",
        "tenant_name": "Chloe Bennett",
        "tenant_email": "chloe.b@designstudio.co",
        "tenant_phone": "+1 (512) 223-9081",
        "flat_number": "9F",
        "issue_title": "Window draft seal whistling during high winds",
        "description": "Bedroom double-glazed window weather-stripping is worn out on lower sash edge, whistling when windy outside.",
        "evidence_files": [],
        "urgency": "routine",
        "severity": 2,
        "category": "structural",
        "safety_alert": None,
        "ai_summary": "Acoustic comfort concern caused by degraded rubber weather-stripping on window perimeter. Window lock and latching mechanism intact.",
        "action_plan": [
            "Inspect sash alignment and silicone rubber perimeter seals",
            "Replace EPDM weather-seal strip on bottom track",
            "Calibrate window lock latch tension"
        ],
        "estimated_cost": "$90 - $160 (Perimeter EPDM weatherstrip replacement)",
        "contractor_dispatch_draft": json.dumps({
            "email": "Subject: Routine Maintenance: Window Seal - Unit 9F\n\nNon-urgent weather-stripping replacement requested for Unit 9F. Please attend during scheduled route.",
            "sms": "[ROUTINE] Unit 9F window seal replacement. Please schedule during weekly route.",
            "whatsapp": "*ROUTINE DISPATCH*\n*Unit:* 9F\n*Task:* Window weather-seal replacement."
        }),
        "history_findings": "No prior window or structural tickets recorded for Unit 9F.",
        "missing_info": [],
        "ai_rating_rationale": "Classified as ROUTINE with Severity 2/5. The issue impacts acoustic comfort but glass and locking hardware are secure, meaning habitability standards are satisfied while scheduling at routine convenience.",
        "status": "triaged",
        "created_at": "2026-10-29T14:40:00Z"
    }
]

def seed_database():
    db_path = "crm.db"
    conn = sqlite3.connect(db_path)
    
    # Ensure columns exist
    cols = [c[1] for c in conn.execute("PRAGMA table_info(tickets)").fetchall()]
    for col in ["ai_rating_rationale", "history_findings", "missing_info"]:
        if col not in cols:
            conn.execute(f"ALTER TABLE tickets ADD COLUMN {col} TEXT")
            conn.commit()

    for t in DUMMY_TICKETS:
        conn.execute("""
        INSERT OR REPLACE INTO tickets (
            id, tenant_name, tenant_email, tenant_phone, flat_number,
            issue_title, description, evidence_files, urgency, severity,
            category, safety_alert, ai_summary, action_plan, estimated_cost,
            contractor_dispatch_draft, history_findings, missing_info, ai_rating_rationale, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["id"], t["tenant_name"], t["tenant_email"], t["tenant_phone"], t["flat_number"],
            t["issue_title"], t["description"], json.dumps(t["evidence_files"]), t["urgency"], t["severity"],
            t["category"], t["safety_alert"], t["ai_summary"], json.dumps(t["action_plan"]), t["estimated_cost"],
            t["contractor_dispatch_draft"], t["history_findings"], json.dumps(t["missing_info"]),
            t["ai_rating_rationale"], t["status"], t["created_at"]
        ))
    conn.commit()
    count = conn.execute("SELECT count(*) FROM tickets").fetchone()[0]
    conn.close()
    print(f" SQLite seed complete. Total tickets in crm.db: {count}")

    # Optional Supabase Sync
    supabase_url = os.getenv("SUPABASE_URL", "")
    supabase_key = os.getenv("SUPABASE_KEY", "")
    if supabase_url and supabase_key and "your-project" not in supabase_url:
        try:
            from supabase import create_client
            client = create_client(supabase_url, supabase_key)
            for t in DUMMY_TICKETS:
                clean_t = {
                    "id": t["id"],
                    "tenant_name": t["tenant_name"],
                    "tenant_email": t["tenant_email"],
                    "tenant_phone": t["tenant_phone"],
                    "flat_number": t["flat_number"],
                    "issue_title": t["issue_title"],
                    "description": t["description"],
                    "evidence_files": t["evidence_files"],
                    "urgency": t["urgency"],
                    "severity": t["severity"],
                    "category": t["category"],
                    "safety_alert": t["safety_alert"],
                    "ai_summary": t["ai_summary"],
                    "action_plan": t["action_plan"],
                    "estimated_cost": t["estimated_cost"],
                    "contractor_dispatch_draft": t["contractor_dispatch_draft"],
                    "status": t["status"],
                    "created_at": t["created_at"]
                }
                client.table("tickets").upsert(clean_t).execute()
            print(" Supabase seed sync complete.")
        except Exception as e:
            print(f" Supabase seed note: {e}")

if __name__ == "__main__":
    seed_database()
