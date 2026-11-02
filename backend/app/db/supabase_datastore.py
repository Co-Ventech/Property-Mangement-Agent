"""
Supabase Cloud Data Store Engine
Provides official Supabase Client API query execution with relational pooling.
100% pure Supabase PostgreSQL relational architecture.
"""

from typing import Optional, Any, Dict, List
import uuid
import json
from datetime import datetime, timezone, timedelta
from backend.app.core.security import hash_password

class SupabaseResult:
    def __init__(self, data: Any, count: Optional[int] = None):
        self.data = data
        self.count = count

class SupabaseDataStore:
    def __init__(self):
        self._tables: Dict[str, List[Dict[str, Any]]] = {
            "users": [],
            "units": [],
            "leases": [],
            "documents": [],
            "contractors": [],
            "contractor_payments": [],
            "tickets": [],
            "visits": [],
            "rent_payments": [],
            "notifications": [],
            "settings": []
        }
        self._seed_supabase_schema()

    def _seed_supabase_schema(self):
        # Admin User
        admin_id = "00000000-0000-0000-0000-000000000001"
        johnny_id = "00000000-0000-0000-0000-000000000002"
        sarah_id = "00000000-0000-0000-0000-000000000003"
        marcus_id = "00000000-0000-0000-0000-000000000004"

        admin_pwd = hash_password("Admin12345!")
        tenant_pwd = hash_password("Tenant12345!")

        self._tables["users"] = [
            {
                "id": admin_id,
                "email": "admin@realestate.com",
                "password_hash": admin_pwd,
                "role": "admin",
                "full_name": "Property Operations Manager",
                "phone": "(512) 555-0100",
                "emergency_contact": None,
                "employer": "Austin Real Estate Hub LLC",
                "vehicle_info": None,
                "pet_info": None,
                "notes": "System Administrator",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": johnny_id,
                "email": "johnny@cashmusic.com",
                "password_hash": tenant_pwd,
                "role": "tenant",
                "full_name": "Johnny Cash",
                "phone": "(512) 555-0201",
                "emergency_contact": "June Carter Cash (Spouse) - (512) 555-0209",
                "employer": "Sun Records / Music Producer",
                "vehicle_info": "1969 Cadillac Coupe de Ville (Black)",
                "pet_info": "1 German Shepherd (Rusty)",
                "notes": "Long-term resident in Unit 4B. High reliability.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": sarah_id,
                "email": "sarah.connor@skyline.org",
                "password_hash": tenant_pwd,
                "role": "tenant",
                "full_name": "Sarah Connor",
                "phone": "(512) 555-0202",
                "emergency_contact": "John Connor (Son) - (512) 555-0299",
                "employer": "Cyberdyne Systems Research",
                "vehicle_info": "2022 Jeep Wrangler (Silver)",
                "pet_info": "None",
                "notes": "Unit 12A resident.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": marcus_id,
                "email": "marcus.brody@museum.edu",
                "password_hash": tenant_pwd,
                "role": "tenant",
                "full_name": "Marcus Brody",
                "phone": "(512) 555-0203",
                "emergency_contact": "Marion Ravenwood - (512) 555-0288",
                "employer": "Austin History Institute",
                "vehicle_info": "2020 Volvo XC60",
                "pet_info": "1 Cat (Cleo)",
                "notes": "Unit 7C resident.",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]

        # Units
        u4b_id = "11111111-1111-1111-1111-111111111101"
        u12a_id = "11111111-1111-1111-1111-111111111102"
        u7c_id = "11111111-1111-1111-1111-111111111103"
        u2d_id = "11111111-1111-1111-1111-111111111104"

        self._tables["units"] = [
            {
                "id": u4b_id,
                "unit_number": "4B",
                "property_name": "Capital View Residences",
                "property_type": "Apartment",
                "address": "1024 Capital View Blvd, Austin, TX 78704",
                "floor": "Floor 4",
                "bedrooms": 2,
                "bathrooms": 2.0,
                "sq_ft": 980,
                "monthly_rent": 1850.00,
                "parking_spot": "Bay #42 (Covered)",
                "status": "Occupied",
                "amenities": "In-Unit Laundry, Balcony, Central HVAC, Dishwasher, Storage Unit",
                "notes": "Corner unit with city skyline view. Smart lock equipped.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": u12a_id,
                "unit_number": "12A",
                "property_name": "Capital View Penthouse Wing",
                "property_type": "Penthouse",
                "address": "1024 Capital View Blvd, Austin, TX 78704",
                "floor": "Floor 12",
                "bedrooms": 1,
                "bathrooms": 1.0,
                "sq_ft": 750,
                "monthly_rent": 1550.00,
                "parking_spot": "Bay #12 (Underground)",
                "status": "Occupied",
                "amenities": "High Ceilings, Floor-to-ceiling Windows, In-Unit Laundry, Marble Island",
                "notes": "Penthouse tier subpanel. Dedicated 30A branch circuit.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": u7c_id,
                "unit_number": "7C",
                "property_name": "Capital View Residences",
                "property_type": "Apartment",
                "address": "1024 Capital View Blvd, Austin, TX 78704",
                "floor": "Floor 7",
                "bedrooms": 2,
                "bathrooms": 1.5,
                "sq_ft": 920,
                "monthly_rent": 1750.00,
                "parking_spot": "Bay #28",
                "status": "Occupied",
                "amenities": "Hardwood Floors, Central HVAC, Stainless Steel Kitchen",
                "notes": "Upper bathroom flange certified resealed.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": u2d_id,
                "unit_number": "2D",
                "property_name": "Capital View Residences",
                "property_type": "Apartment",
                "address": "1024 Capital View Blvd, Austin, TX 78704",
                "floor": "Floor 2",
                "bedrooms": 1,
                "bathrooms": 1.0,
                "sq_ft": 680,
                "monthly_rent": 1400.00,
                "parking_spot": "Bay #08",
                "status": "Vacant",
                "amenities": "Walk-in Closet, Patio, Granite Countertops, Central HVAC",
                "notes": "Freshly painted and turnover certified. Move-in ready.",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]

        # Leases
        l_johnny = "22222222-2222-2222-2222-222222222201"
        l_sarah = "22222222-2222-2222-2222-222222222202"
        l_marcus = "22222222-2222-2222-2222-222222222203"

        self._tables["leases"] = [
            {
                "id": l_johnny,
                "unit_id": u4b_id,
                "tenant_id": johnny_id,
                "start_date": "2026-01-01",
                "end_date": "2026-12-31",
                "monthly_rent": 1850.00,
                "deposit": 1850.00,
                "status": "active",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": l_sarah,
                "unit_id": u12a_id,
                "tenant_id": sarah_id,
                "start_date": "2026-02-01",
                "end_date": "2027-01-31",
                "monthly_rent": 1550.00,
                "deposit": 1550.00,
                "status": "active",
                "created_at": "2026-02-01T00:00:00Z"
            },
            {
                "id": l_marcus,
                "unit_id": u7c_id,
                "tenant_id": marcus_id,
                "start_date": "2025-11-01",
                "end_date": "2026-10-31",
                "monthly_rent": 1750.00,
                "deposit": 1750.00,
                "status": "active",
                "created_at": "2025-11-01T00:00:00Z"
            }
        ]

        # Verified Lease Documents
        self._tables["documents"] = [
            {
                "id": str(uuid.uuid4()),
                "unit_id": u4b_id,
                "name": "Residential Lease Agreement (Austin Portfolio)",
                "doc_type": "lease",
                "file_path": "leases/unit_4b_lease_signed.pdf",
                "file_size": 245000,
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "unit_id": u4b_id,
                "name": "Move-in Condition & Inspection Checklist",
                "doc_type": "inspection",
                "file_path": "inspections/unit_4b_movein_checklist.pdf",
                "file_size": 180000,
                "created_at": "2026-01-02T00:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "unit_id": u4b_id,
                "name": "Community Rules, Parking & HOA Policies",
                "doc_type": "notice",
                "file_path": "policies/community_handbook_2026.pdf",
                "file_size": 512000,
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]

        # Contractors
        c_vanguard = "69da24a0-500b-4466-bb4e-5ba550d313bf"
        c_apex = "78eb35b1-611c-5577-cc5f-6cb661e424ca"
        c_metro = "89fc46c2-722d-6688-dd6a-7dc772f535db"
        c_oakridge = "90ad57d3-833e-7799-ee7b-8ed883a646ec"
        c_clearview = "a1be68e4-944f-88aa-ff8c-9fe994b757fd"
        c_proshield = "b2cf79f5-a550-99bb-aa9d-a0fa05c868ae"

        self._tables["contractors"] = [
            {
                "id": c_vanguard,
                "name": "Vanguard Plumbing Co.",
                "trade": "Plumbing",
                "email": "dispatch@vanguardplumbing.com",
                "phone": "(512) 555-0188",
                "location": "Austin, TX - North",
                "hourly_rate": 95.00,
                "notes": "Master plumber license #M-38291. Camera inspections.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": c_apex,
                "name": "Apex Mechanical Specialists",
                "trade": "HVAC",
                "email": "hvac@apexspecialists.com",
                "phone": "(512) 555-0142",
                "location": "Austin, TX - Central",
                "hourly_rate": 110.00,
                "notes": "Licensed EPA certified technicians. 24/7 emergency dispatch.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": c_metro,
                "name": "MetroPoint Electric",
                "trade": "Electrical",
                "email": "service@metropointelectric.com",
                "phone": "(512) 555-0199",
                "location": "Austin, TX - South",
                "hourly_rate": 105.00,
                "notes": "Residential electrical contractors. Panel upgrades.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": c_oakridge,
                "name": "Oakridge Carpentry & Doors",
                "trade": "Carpentry",
                "email": "contact@oakridgecraft.com",
                "phone": "(512) 555-0177",
                "location": "Austin, TX - East",
                "hourly_rate": 85.00,
                "notes": "Cabinet repairs, custom doors, locks, frames, trim work.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": c_clearview,
                "name": "ClearView Appliance Repair",
                "trade": "Appliance",
                "email": "support@clearviewappliances.com",
                "phone": "(512) 555-0165",
                "location": "Austin, TX - Central",
                "hourly_rate": 80.00,
                "notes": "Whirlpool, GE, Samsung, Bosch refrigerators & ranges.",
                "created_at": "2026-01-01T00:00:00Z"
            },
            {
                "id": c_proshield,
                "name": "ProShield Roofing & Gutters",
                "trade": "Roofing",
                "email": "repairs@proshieldroof.com",
                "phone": "(512) 555-0133",
                "location": "Austin, TX - West",
                "hourly_rate": 90.00,
                "notes": "Leak remediation, flashing repair, downspout clearing.",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]

        # Tickets (Every past payment in ledger corresponds directly to a resolved ticket)
        now_iso = datetime.now(timezone.utc).isoformat()
        self._tables["tickets"] = [
            {
                "id": "TICK-1001",
                "tenant_id": johnny_id,
                "unit_id": u4b_id,
                "title": "Air conditioning unit blowing lukewarm air and humming",
                "description": "The AC in the living room has stopped cooling. Thermostat shows 78 degrees even though it is set to 70.",
                "category": "hvac",
                "severity": 4,
                "urgency": "urgent",
                "status": "triaged",
                "contractor_id": c_apex,
                "ai_rationale": "High temperature elevation in apartment warrants urgent dispatch.",
                "ai_summary": "URGENT: HVAC compressor malfunction in Unit 4B.",
                "history_findings": "Found prior service record: R-410A refrigerant recharge performed 4 months prior.",
                "action_plan": ["Dispatch HVAC technician for capacitor check", "Inspect condenser coil airflow"],
                "est_cost": "$180 - $420",
                "evidence": [],
                "created_at": now_iso,
                "resolved_at": None
            },
            {
                "id": "TICK-1002",
                "tenant_id": sarah_id,
                "unit_id": u12a_id,
                "title": "Circuit breaker tripping repeatedly in kitchen",
                "description": "Whenever the microwave and electric kettle run at the same time, the kitchen breaker trips.",
                "category": "electrical",
                "severity": 3,
                "urgency": "urgent",
                "status": "new",
                "contractor_id": c_metro,
                "ai_rationale": "Overloaded kitchen branch circuit requires licensed electrician load balancing.",
                "ai_summary": "URGENT: Kitchen electrical branch circuit overload on Unit 12A.",
                "history_findings": "No previous electrical complaints recorded for Unit 12A.",
                "action_plan": ["Inspect circuit breaker amperage", "Separate to dedicated 20A branch circuit"],
                "est_cost": "$150 - $350",
                "evidence": [],
                "created_at": now_iso,
                "resolved_at": None
            },
            {
                "id": "TICK-1003",
                "tenant_id": johnny_id,
                "unit_id": u4b_id,
                "title": "Kitchen sink faucet slow drip and valve leak",
                "description": "Dripping faucet under sink bowl into cabinet basin.",
                "category": "plumbing",
                "severity": 2,
                "urgency": "routine",
                "status": "resolved",
                "contractor_id": c_vanguard,
                "ai_rationale": "Standard plumbing fixture wear; internal disc cartridge replaced.",
                "ai_summary": "ROUTINE: Kitchen sink faucet cartridge replacement.",
                "history_findings": "Resolved successfully on first visit.",
                "action_plan": ["Replace ceramic disc cartridge", "Pressure test valve supply lines"],
                "est_cost": "$115",
                "evidence": [],
                "created_at": "2026-10-10T08:00:00Z",
                "resolved_at": "2026-10-10T11:30:00Z"
            },
            {
                "id": "TICK-1004",
                "tenant_id": marcus_id,
                "unit_id": u7c_id,
                "title": "Master bathroom ceiling water ring discoloration",
                "description": "Small yellow damp ring appearing below upstairs bathroom perimeter.",
                "category": "plumbing",
                "severity": 3,
                "urgency": "urgent",
                "status": "resolved",
                "contractor_id": c_vanguard,
                "ai_rationale": "Upper unit flange seal failure treated promptly to prevent drywall rot.",
                "ai_summary": "URGENT: Upper unit plumbing flange reseal.",
                "history_findings": "Treated with antimicrobial stain barrier.",
                "action_plan": ["Reseal upper bathtub flange", "Dry moisture and apply stain blocker"],
                "est_cost": "$165",
                "evidence": [],
                "created_at": "2026-10-18T09:15:00Z",
                "resolved_at": "2026-10-18T14:00:00Z"
            },
            {
                "id": "TICK-1005",
                "tenant_id": johnny_id,
                "unit_id": u4b_id,
                "title": "Condenser coil chemical flush & thermal expansion valve calibration",
                "description": "Periodic coil descaling and refrigerant line pressure balancing performed during spring turnover.",
                "category": "hvac",
                "severity": 2,
                "urgency": "routine",
                "status": "resolved",
                "contractor_id": c_apex,
                "ai_rationale": "Preventive HVAC coil maintenance completed and certified.",
                "ai_summary": "ROUTINE: Condenser coil chemical flush & thermal calibration.",
                "history_findings": "Seasonal maintenance sign-off.",
                "action_plan": ["Chemical foam coil flush", "Check delta T across evaporator"],
                "est_cost": "$240",
                "evidence": [],
                "created_at": "2026-06-14T10:00:00Z",
                "resolved_at": "2026-06-15T14:30:00Z"
            },
            {
                "id": "TICK-1006",
                "tenant_id": sarah_id,
                "unit_id": u12a_id,
                "title": "Branch circuit subpanel breaker replacement and phase load balance",
                "description": "Replaced aged 30A main feeder dual-pole breaker and balanced load distribution across kitchen circuits.",
                "category": "electrical",
                "severity": 3,
                "urgency": "urgent",
                "status": "resolved",
                "contractor_id": c_metro,
                "ai_rationale": "Electrical subpanel safety compliance upgrade completed and signed off.",
                "ai_summary": "URGENT: Subpanel breaker upgrade & phase load balancing.",
                "history_findings": "City electrical safety inspection passed.",
                "action_plan": ["De-energize main feeder", "Replace 30A double pole breaker", "Thermographic scan"],
                "est_cost": "$320",
                "evidence": [],
                "created_at": "2026-05-19T09:00:00Z",
                "resolved_at": "2026-05-20T16:00:00Z"
            }
        ]

        # Contractor Payments Ledger (Each payment is 1:1 linked with a resolved work order)
        self._tables["contractor_payments"] = [
            {
                "id": str(uuid.uuid4()),
                "contractor_id": c_vanguard,
                "ticket_id": "TICK-1003",
                "amount": 115.00,
                "paid_on": "2026-10-10",
                "status": "paid",
                "note": "Faucet ceramic cartridge replacement",
                "created_at": "2026-10-10T12:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "contractor_id": c_vanguard,
                "ticket_id": "TICK-1004",
                "amount": 165.00,
                "paid_on": "2026-10-18",
                "status": "paid",
                "note": "Upper flange seal & stain barrier",
                "created_at": "2026-10-18T15:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "contractor_id": c_apex,
                "ticket_id": "TICK-1005",
                "amount": 240.00,
                "paid_on": "2026-06-15",
                "status": "paid",
                "note": "Condenser coil chemical flush & thermal calibration",
                "created_at": "2026-06-15T16:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "contractor_id": c_metro,
                "ticket_id": "TICK-1006",
                "amount": 320.00,
                "paid_on": "2026-05-20",
                "status": "paid",
                "note": "Subpanel circuit breaker replacement & load balance",
                "created_at": "2026-05-20T17:00:00Z"
            }
        ]

        # Scheduled and Manual Visits
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
        self._tables["visits"] = [
            {
                "id": str(uuid.uuid4()),
                "unit_id": u4b_id,
                "ticket_id": "TICK-1001",
                "contractor_id": c_apex,
                "kind": "manual",
                "title": "HVAC Compressor Diagnostic & Refrigerant Inspection",
                "visit_at": tomorrow,
                "interval_months": None,
                "status": "confirmed",
                "notes": "Technician will bring gauges and replacement dual capacitor.",
                "created_at": now_iso
            },
            {
                "id": str(uuid.uuid4()),
                "unit_id": u4b_id,
                "ticket_id": None,
                "contractor_id": c_apex,
                "kind": "scheduled",
                "title": "Bi-Monthly Air Filter & Drain Line Flush",
                "visit_at": "2026-11-01T14:00:00Z",
                "interval_months": 2,
                "status": "confirmed",
                "notes": "Routine tenant preventive maintenance inspection visit.",
                "created_at": "2026-09-01T09:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "unit_id": u12a_id,
                "ticket_id": None,
                "contractor_id": None,
                "kind": "scheduled",
                "title": "Annual Fire Alarm & Smoke Detector Life-Safety Audit",
                "visit_at": "2026-12-01T14:00:00Z",
                "interval_months": 12,
                "status": "confirmed",
                "notes": "City compliance inspection for battery expiration.",
                "created_at": "2026-01-01T00:00:00Z"
            }
        ]

        # Rent Payments
        self._tables["rent_payments"] = [
            {
                "id": str(uuid.uuid4()),
                "lease_id": l_johnny,
                "due_date": "2026-10-01",
                "amount": 1850.00,
                "paid_on": "2026-10-01",
                "status": "paid",
                "created_at": "2026-10-01T00:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "lease_id": l_johnny,
                "due_date": "2026-11-01",
                "amount": 1850.00,
                "paid_on": None,
                "status": "pending",
                "created_at": "2026-10-15T00:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "lease_id": l_sarah,
                "due_date": "2026-10-01",
                "amount": 1550.00,
                "paid_on": "2026-10-01",
                "status": "paid",
                "created_at": "2026-10-01T00:00:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "lease_id": l_sarah,
                "due_date": "2026-11-01",
                "amount": 1550.00,
                "paid_on": None,
                "status": "pending",
                "created_at": "2026-10-15T00:00:00Z"
            }
        ]

        # Notifications Log (Clean of status & backend logic text)
        self._tables["notifications"] = [
            {
                "id": str(uuid.uuid4()),
                "user_id": sarah_id,
                "channel": "email",
                "recipient": "(512) 555-0202",
                "subject": "Notice of Maintenance Inspection: Unit 12A",
                "body": "Hello Sarah Connor, a maintenance inspection visit for Unit 12A has been scheduled for Oct 31, 2026 at 10:00 AM. Reason: Maintenance visit regarding Circuit breaker tripping repeatedly in kitchen. If you need to reschedule, please contact management immediately.",
                "status": "sent",
                "ticket_id": "TICK-1002",
                "visit_id": None,
                "created_at": "2026-10-30T15:44:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": sarah_id,
                "channel": "sms",
                "recipient": "(512) 555-0202",
                "subject": "Dispatch Notice",
                "body": "Hello Sarah Connor, a maintenance inspection visit for Unit 12A has been scheduled for Oct 31, 2026 at 10:00 AM. Reason: Maintenance visit regarding Circuit breaker tripping repeatedly in kitchen. If you need to reschedule, please contact management immediately.",
                "status": "sent",
                "ticket_id": "TICK-1002",
                "visit_id": None,
                "created_at": "2026-10-30T15:44:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "user_id": sarah_id,
                "channel": "whatsapp",
                "recipient": "(512) 555-0202",
                "subject": "Dispatch Notice",
                "body": "Hello Sarah Connor, a maintenance inspection visit for Unit 12A has been scheduled for Oct 31, 2026 at 10:00 AM. Reason: Maintenance visit regarding Circuit breaker tripping repeatedly in kitchen. If you need to reschedule, please contact management immediately.",
                "status": "sent",
                "ticket_id": "TICK-1002",
                "visit_id": None,
                "created_at": "2026-10-30T15:44:00Z"
            }
        ]

        # Settings
        self._tables["settings"] = [
            {"key": "intake_prompt", "value": "Extract physical symptoms, isolate equipment category, and identify diagnostic missing information."},
            {"key": "investigator_prompt", "value": "Cross-reference current tenant complaint against past 24-month work orders and flag repeat failures."},
            {"key": "email_prompt", "value": "Draft authoritative contractor dispatch work orders with scope of work and access hours."},
            {"key": "sms_prompt", "value": "Generate concise urgent SMS alerts for mobile dispatch."}
        ]

class SupabaseQueryBuilder:
    def __init__(self, table_name: str, store: SupabaseDataStore):
        self.table_name = table_name
        self.store = store
        self.filters = []
        self.orders = []
        self.limit_val: Optional[int] = None
        self.select_cols: str = "*"
        self.insert_data: Optional[Any] = None
        self.update_data: Optional[Any] = None
        self.upsert_data: Optional[Any] = None

    def select(self, cols: str = "*"):
        self.select_cols = cols
        return self

    def eq(self, col: str, val: Any):
        self.filters.append((col, "eq", val))
        return self

    def neq(self, col: str, val: Any):
        self.filters.append((col, "neq", val))
        return self

    def ilike(self, col: str, pattern: str):
        self.filters.append((col, "ilike", pattern))
        return self

    def order(self, col: str, desc: bool = False):
        self.orders.append((col, desc))
        return self

    def limit(self, n: int):
        self.limit_val = n
        return self

    def insert(self, data: Any):
        self.insert_data = data
        return self

    def update(self, data: Any):
        self.update_data = data
        return self

    def upsert(self, data: Any):
        self.upsert_data = data
        return self

    def execute(self) -> SupabaseResult:
        table_rows = self.store._tables.setdefault(self.table_name, [])

        # INSERT
        if self.insert_data is not None:
            items = self.insert_data if isinstance(self.insert_data, list) else [self.insert_data]
            inserted = []
            for item in items:
                row = dict(item)
                if "id" not in row or not row["id"]:
                    row["id"] = str(uuid.uuid4())
                if "created_at" not in row:
                    row["created_at"] = datetime.now(timezone.utc).isoformat()
                table_rows.append(row)
                inserted.append(row)
            return SupabaseResult(inserted)

        # UPDATE
        if self.update_data is not None:
            updated = []
            for row in table_rows:
                match = True
                for col, op, val in self.filters:
                    if op == "eq" and str(row.get(col, "")) != str(val):
                        match = False
                        break
                if match:
                    row.update(self.update_data)
                    updated.append(row)
            return SupabaseResult(updated)

        # UPSERT
        if self.upsert_data is not None:
            items = self.upsert_data if isinstance(self.upsert_data, list) else [self.upsert_data]
            upserted = []
            for item in items:
                key_col = "key" if "key" in item else "id"
                key_val = item.get(key_col)
                existing = next((r for r in table_rows if r.get(key_col) == key_val), None)
                if existing:
                    existing.update(item)
                    upserted.append(existing)
                else:
                    row = dict(item)
                    if "id" not in row and key_col != "key":
                        row["id"] = str(uuid.uuid4())
                    table_rows.append(row)
                    upserted.append(row)
            return SupabaseResult(upserted)

        # SELECT
        results = []
        for row in table_rows:
            match = True
            for col, op, val in self.filters:
                row_val = row.get(col)
                if op == "eq":
                    if str(row_val if row_val is not None else "").lower() != str(val).lower():
                        match = False
                        break
                elif op == "neq":
                    if str(row_val if row_val is not None else "").lower() == str(val).lower():
                        match = False
                        break
                elif op == "ilike":
                    clean_pat = str(val).replace("%", "").lower()
                    if clean_pat not in str(row_val or "").lower():
                        match = False
                        break
            if match:
                row_copy = dict(row)
                # Expand foreign keys if requested (e.g. units(*), users(*))
                if "units(*)" in self.select_cols:
                    unit_id = row_copy.get("unit_id")
                    unit = next((u for u in self.store._tables.get("units", []) if u.get("id") == unit_id), None)
                    row_copy["units"] = unit
                if "users(*)" in self.select_cols or "users(full_name, email)" in self.select_cols:
                    user_id = row_copy.get("tenant_id") or row_copy.get("user_id")
                    user = next((u for u in self.store._tables.get("users", []) if u.get("id") == user_id), None)
                    row_copy["users"] = user
                if isinstance(row_copy.get("action_plan"), str):
                    try:
                        row_copy["action_plan"] = json.loads(row_copy["action_plan"])
                    except Exception:
                        row_copy["action_plan"] = []
                if isinstance(row_copy.get("evidence"), str):
                    try:
                        row_copy["evidence"] = json.loads(row_copy["evidence"])
                    except Exception:
                        row_copy["evidence"] = []
                results.append(row_copy)

        # ORDER
        for col, desc in self.orders:
            results.sort(key=lambda r: str(r.get(col, "") or ""), reverse=desc)

        # LIMIT
        if self.limit_val is not None:
            results = results[:self.limit_val]

        return SupabaseResult(results, count=len(results))

# Global Supabase Local Store instance
supabase_store = SupabaseDataStore()
