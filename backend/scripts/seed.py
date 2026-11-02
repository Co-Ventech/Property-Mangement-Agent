"""
Seed Script for Real Estate Operations Hub
Populates clean demo data into Supabase PostgreSQL:
- Admin user (admin@realestate.com)
- Units (4B, 12A, 7C, 2D)
- Contractors (Carpentry, Plumbing, Electrical, HVAC, Appliance, Roofing)
- Tenants with active leases
- Tickets (Active & Past Resolved for history)
- Contractor payments ledger
- Manual & recurring scheduled visits
- Rent payment records
"""
import sys
from pathlib import Path
from datetime import date, datetime, timedelta, timezone

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT_DIR))

from backend.app.core.config import settings
from backend.app.core.security import hash_password
from backend.app.db.client import db

def run_seed():
    print("Beginning database seed...")

    # 1. Seed Admin
    admin_email = settings.ADMIN_EMAIL
    admin_pass = settings.ADMIN_PASSWORD
    print(f"Creating/updating admin user: {admin_email}")
    admin_hash = hash_password(admin_pass)
    
    # Check if admin exists
    admin_res = db.table("users").select("id").eq("email", admin_email).execute()
    if not admin_res.data:
        admin_data = db.table("users").insert({
            "email": admin_email,
            "password_hash": admin_hash,
            "role": "admin",
            "full_name": "Property Operations Manager",
            "phone": "(512) 555-0100"
        }).execute()
        admin_id = admin_data.data[0]["id"]
    else:
        admin_id = admin_res.data[0]["id"]
        db.table("users").update({"password_hash": admin_hash}).eq("id", admin_id).execute()

    # 2. Seed Units
    units_to_seed = [
        {"unit_number": "4B", "address": "1024 Capital View Blvd, Austin, TX 78704", "bedrooms": 2, "bathrooms": 2.0, "sq_ft": 980, "monthly_rent": 1850.00},
        {"unit_number": "12A", "address": "1024 Capital View Blvd, Austin, TX 78704", "bedrooms": 1, "bathrooms": 1.0, "sq_ft": 720, "monthly_rent": 1550.00},
        {"unit_number": "7C", "address": "1024 Capital View Blvd, Austin, TX 78704", "bedrooms": 3, "bathrooms": 2.0, "sq_ft": 1280, "monthly_rent": 2400.00},
        {"unit_number": "2D", "address": "1024 Capital View Blvd, Austin, TX 78704", "bedrooms": 1, "bathrooms": 1.0, "sq_ft": 650, "monthly_rent": 1400.00}
    ]
    unit_map = {}
    for u in units_to_seed:
        existing = db.table("units").select("id").eq("unit_number", u["unit_number"]).execute()
        if existing.data:
            unit_map[u["unit_number"]] = existing.data[0]["id"]
        else:
            ins = db.table("units").insert(u).execute()
            unit_map[u["unit_number"]] = ins.data[0]["id"]
    print(f"Seeded {len(unit_map)} units.")

    # 3. Seed Contractors
    contractors_to_seed = [
        {
            "name": "Apex Mechanical Specialists",
            "trade": "HVAC",
            "email": "hvac@apexspecialists.com",
            "phone": "(512) 555-0142",
            "location": "Austin, TX - Central",
            "hourly_rate": 110.00,
            "notes": "Licensed EPA certified technicians. 24/7 emergency dispatch."
        },
        {
            "name": "Vanguard Plumbing Co.",
            "trade": "Plumbing",
            "email": "dispatch@vanguardplumbing.com",
            "phone": "(512) 555-0188",
            "location": "Austin, TX - North",
            "hourly_rate": 95.00,
            "notes": "Master plumber license #M-38291. Camera inspections and jetting."
        },
        {
            "name": "MetroPoint Electric",
            "trade": "Electrical",
            "email": "service@metropointelectric.com",
            "phone": "(512) 555-0199",
            "location": "Austin, TX - South",
            "hourly_rate": 105.00,
            "notes": "Residential electrical contractors. Panel upgrades and rewiring."
        },
        {
            "name": "Oakridge Carpentry & Doors",
            "trade": "Carpentry",
            "email": "contact@oakridgecraft.com",
            "phone": "(512) 555-0177",
            "location": "Austin, TX - East",
            "hourly_rate": 85.00,
            "notes": "Cabinet repairs, custom doors, locks, frames, trim work."
        },
        {
            "name": "ClearView Appliance Repair",
            "trade": "Appliance",
            "email": "support@clearviewappliances.com",
            "phone": "(512) 555-0165",
            "location": "Austin, TX - Central",
            "hourly_rate": 80.00,
            "notes": "Specialists for Whirlpool, GE, Samsung, Bosch refrigerators & ranges."
        },
        {
            "name": "ProShield Roofing & Gutters",
            "trade": "Roofing",
            "email": "repairs@proshieldroof.com",
            "phone": "(512) 555-0133",
            "location": "Austin, TX - West",
            "hourly_rate": 90.00,
            "notes": "Leak remediation, flashing repair, downspout clearing."
        }
    ]
    contractor_map = {}
    for c in contractors_to_seed:
        existing = db.table("contractors").select("id").eq("name", c["name"]).execute()
        if existing.data:
            contractor_map[c["trade"]] = existing.data[0]["id"]
        else:
            ins = db.table("contractors").insert(c).execute()
            contractor_map[c["trade"]] = ins.data[0]["id"]
    print(f"Seeded {len(contractor_map)} contractors.")

    # 4. Seed Tenants & Leases
    tenant_default_pass = "Tenant12345!"
    tenant_hash = hash_password(tenant_default_pass)
    tenants_to_seed = [
        {"email": "johnny@cashmusic.com", "full_name": "Johnny Cash", "phone": "(512) 555-0201", "unit": "4B", "rent": 1850.00},
        {"email": "sarah.connor@skyline.org", "full_name": "Sarah Connor", "phone": "(512) 555-0202", "unit": "12A", "rent": 1550.00},
        {"email": "mbrody@archeology.edu", "full_name": "Marcus Brody", "phone": "(512) 555-0203", "unit": "7C", "rent": 2400.00}
    ]
    tenant_map = {}
    lease_map = {}
    for t in tenants_to_seed:
        existing = db.table("users").select("id").eq("email", t["email"]).execute()
        if existing.data:
            u_id = existing.data[0]["id"]
        else:
            ins = db.table("users").insert({
                "email": t["email"],
                "password_hash": tenant_hash,
                "role": "tenant",
                "full_name": t["full_name"],
                "phone": t["phone"]
            }).execute()
            u_id = ins.data[0]["id"]
        tenant_map[t["email"]] = u_id

        # Lease
        unit_id = unit_map[t["unit"]]
        lease_res = db.table("leases").select("id").eq("tenant_id", u_id).eq("status", "active").execute()
        if not lease_res.data:
            l_ins = db.table("leases").insert({
                "unit_id": unit_id,
                "tenant_id": u_id,
                "start_date": "2026-01-01",
                "end_date": "2026-12-31",
                "monthly_rent": t["rent"],
                "deposit": t["rent"],
                "status": "active"
            }).execute()
            lease_map[u_id] = l_ins.data[0]["id"]
        else:
            lease_map[u_id] = lease_res.data[0]["id"]
    print(f"Seeded {len(tenant_map)} tenants and active leases.")

    # 5. Seed Tickets
    johnny_id = tenant_map["johnny@cashmusic.com"]
    sarah_id = tenant_map["sarah.connor@skyline.org"]
    marcus_id = tenant_map["mbrody@archeology.edu"]

    tickets_to_seed = [
        {
            "id": "TICK-1001",
            "tenant_id": johnny_id,
            "unit_id": unit_map["4B"],
            "title": "Air conditioning unit blowing lukewarm air and humming",
            "description": "The AC in the living room has stopped cooling. Thermostat shows 78 degrees even though it is set to 70. There is also an intermittent buzzing sound coming from the outside compressor unit.",
            "category": "hvac",
            "severity": 4,
            "urgency": "urgent",
            "status": "triaged",
            "contractor_id": contractor_map["HVAC"],
            "ai_rationale": "High temperature elevation in apartment with potential electrical compressor failure warrants elevated urgent dispatch.",
            "ai_summary": "URGENT: HVAC compressor malfunction in Unit 4B requiring diagnostic inspection.",
            "history_findings": "Found prior service record: R-410A refrigerant recharge performed 4 months prior.",
            "action_plan": ["Dispatch HVAC technician for dual run capacitor and refrigerant pressure test", "Inspect condenser coil airflow", "Verify thermostat signals"],
            "est_cost": "$180 - $420",
            "evidence": ["/evidence/ac_unit_compressor.jpg"]
        },
        {
            "id": "TICK-1002",
            "tenant_id": sarah_id,
            "unit_id": unit_map["12A"],
            "title": "Circuit breaker tripping repeatedly in kitchen",
            "description": "Whenever the microwave and electric kettle run at the same time, the kitchen breaker trips in the main subpanel.",
            "category": "electrical",
            "severity": 3,
            "urgency": "urgent",
            "status": "new",
            "contractor_id": contractor_map["Electrical"],
            "ai_rationale": "Overloaded kitchen branch circuit requires licensed electrician load balancing.",
            "ai_summary": "URGENT: Kitchen electrical branch circuit overload on Unit 12A.",
            "history_findings": "No previous electrical complaints recorded for Unit 12A.",
            "action_plan": ["Inspect circuit breaker amperage", "Separate microwave to dedicated 20A branch circuit"],
            "est_cost": "$150 - $350",
            "evidence": []
        },
        {
            "id": "TICK-1003",
            "tenant_id": johnny_id,
            "unit_id": unit_map["4B"],
            "title": "Kitchen sink faucet slow drip and valve leak",
            "description": "Dripping faucet under sink bowl into cabinet basin.",
            "category": "plumbing",
            "severity": 2,
            "urgency": "routine",
            "status": "resolved",
            "contractor_id": contractor_map["Plumbing"],
            "ai_rationale": "Standard plumbing fixture wear; internal disc cartridge replaced.",
            "ai_summary": "ROUTINE: Kitchen sink faucet cartridge replacement.",
            "history_findings": "Resolved successfully on first visit.",
            "action_plan": ["Replace ceramic disc cartridge", "Pressure test valve supply lines"],
            "est_cost": "$115",
            "evidence": [],
            "resolved_at": (datetime.now(timezone.utc) - timedelta(days=20)).isoformat()
        },
        {
            "id": "TICK-1004",
            "tenant_id": marcus_id,
            "unit_id": unit_map["7C"],
            "title": "Master bathroom ceiling water ring discoloration",
            "description": "Small yellow damp ring appearing below upstairs bathroom perimeter.",
            "category": "plumbing",
            "severity": 3,
            "urgency": "urgent",
            "status": "resolved",
            "contractor_id": contractor_map["Plumbing"],
            "ai_rationale": "Upper unit flange seal failure treated promptly to prevent drywall rot.",
            "ai_summary": "URGENT: Upper unit plumbing flange reseal and ceiling moisture treatment.",
            "history_findings": "Treated with antimicrobial stain barrier.",
            "action_plan": ["Reseal upper bathtub flange", "Dry moisture and apply stain blocker"],
            "est_cost": "$165",
            "evidence": [],
            "resolved_at": (datetime.now(timezone.utc) - timedelta(days=12)).isoformat()
        }
    ]
    for tick in tickets_to_seed:
        existing = db.table("tickets").select("id").eq("id", tick["id"]).execute()
        if not existing.data:
            db.table("tickets").insert(tick).execute()
    print("Seeded sample tickets.")

    # 6. Seed Contractor Payments
    vanguard_id = contractor_map["Plumbing"]
    apex_id = contractor_map["HVAC"]
    metro_id = contractor_map["Electrical"]
    
    payments = [
        {"contractor_id": vanguard_id, "ticket_id": "TICK-1003", "amount": 115.00, "paid_on": "2026-10-10", "status": "paid", "note": "Faucet ceramic cartridge replacement"},
        {"contractor_id": vanguard_id, "ticket_id": "TICK-1004", "amount": 165.00, "paid_on": "2026-10-18", "status": "paid", "note": "Upper flange seal & stain barrier"},
        {"contractor_id": apex_id, "ticket_id": None, "amount": 240.00, "paid_on": "2026-06-15", "status": "paid", "note": "Bi-annual condenser coil chemical cleaning"},
        {"contractor_id": metro_id, "ticket_id": None, "amount": 320.00, "paid_on": "2026-05-20", "status": "paid", "note": "Common area subpanel circuit breaker upgrade"}
    ]
    for p in payments:
        db.table("contractor_payments").insert(p).execute()
    print("Seeded contractor payments ledger.")

    # 7. Seed Visits (Manual & Scheduled Recurring)
    tomorrow_10am = (datetime.now(timezone.utc) + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0)
    visits_to_seed = [
        {
            "unit_id": unit_map["4B"],
            "ticket_id": "TICK-1001",
            "contractor_id": apex_id,
            "kind": "manual",
            "title": "HVAC Compressor Diagnostic & Refrigerant Inspection",
            "visit_at": tomorrow_10am.isoformat(),
            "interval_months": None,
            "status": "confirmed",
            "notes": "Technician will bring gauges and replacement 45/5 dual capacitor."
        },
        {
            "unit_id": unit_map["4B"],
            "ticket_id": None,
            "contractor_id": apex_id,
            "kind": "scheduled",
            "title": "Bi-Monthly Air Filter & Drain Line Flush",
            "visit_at": "2026-09-01T09:00:00Z",
            "interval_months": 2, # every 2 months
            "status": "confirmed",
            "notes": "Routine tenant preventive maintenance inspection visit."
        },
        {
            "unit_id": unit_map["12A"],
            "ticket_id": None,
            "contractor_id": None,
            "kind": "scheduled",
            "title": "Annual Fire Alarm & Smoke Detector Life-Safety Audit",
            "visit_at": "2026-03-01T14:00:00Z",
            "interval_months": 12, # once a year
            "status": "confirmed",
            "notes": "City compliance inspection for battery expiration and detector decibels."
        }
    ]
    for v in visits_to_seed:
        db.table("visits").insert(v).execute()
    print("Seeded visits (manual + scheduled recurring).")

    # 8. Seed Rent Payments
    johnny_lease = lease_map.get(johnny_id)
    if johnny_lease:
        db.table("rent_payments").insert([
            {"lease_id": johnny_lease, "due_date": "2026-10-01", "amount": 1850.00, "paid_on": "2026-10-01", "status": "paid"},
            {"lease_id": johnny_lease, "due_date": "2026-11-01", "amount": 1850.00, "status": "pending"}
        ]).execute()
    print("Seeded rent payments.")

    # 9. Seed Default Prompts in settings
    prompts = {
        "intake_prompt": "Extract physical symptoms, isolate equipment category, and identify diagnostic missing information.",
        "investigator_prompt": "Cross-reference current tenant complaint against past 24-month work orders and flag repeat failures.",
        "email_prompt": "Draft authoritative contractor dispatch work orders with scope of work and access hours.",
        "sms_prompt": "Generate concise urgent SMS alerts for mobile dispatch.",
        "whatsapp_prompt": "Format structured WhatsApp dispatch briefings with bold action steps."
    }
    db.table("settings").upsert({"key": "agent_prompts", "value": prompts}).execute()
    print("Seeded agent settings.")

    print("\n--- SEED COMPLETE ---")
    print(f"Admin login: {admin_email} / {admin_pass}")
    print(f"Tenant login: johnny@cashmusic.com / {tenant_default_pass}")
    print(f"Tenant login: sarah.connor@skyline.org / {tenant_default_pass}")

if __name__ == "__main__":
    run_seed()

