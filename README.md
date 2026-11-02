# Real Estate Operations Hub (v3.0.0)

An enterprise-grade, dual-role Property Management & Resident Portal built with **FastAPI**, **React + Vite + TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**.

---

## 1. System Architecture & Design Pattern

The application implements a clean, layered **MVC / Router-Service-Repository** pattern:

```text
[ React 18 + Vite + TypeScript SPA ]
               │  (JWT Bearer Auth)
               ▼
   [ FastAPI Router Layer ] (HTTP & Role Gating: /auth, /admin, /tenant)
               │
               ▼
   [ Service Layer ] (Triage Engine, Notifier, Recurrence Math, Storage)
               │
               ▼
   [ Repository Layer ] (Data Access & Query Logic)
               │
               ▼
   [ Supabase PostgreSQL & Storage ]
```

### Key Architectural Pillars:
- **Pure Supabase PostgreSQL**: Architected on clean Supabase relational tables and native authentication.
- **Strict Role Isolation**: Admin (`admin`) and Tenant (`tenant`) accounts authenticate via cryptographically secure JWTs (`PyJWT`) with passwords hashed using Python's standard library `hashlib.scrypt`.
- **Tenant Data Boundary**: Every tenant endpoint automatically filters records by the authenticated `user_id` from the JWT claim—preventing unauthorized horizontal privilege escalation.
- **Deterministic Life-Safety Shield**: Deterministic keyword regex overrides AI scoring for immediate life hazards (gas leaks, sparks, smoke, flooding) forcing Priority Emergency / Severity 5, paired with single-pass Gemini structured triage and resilient offline fallback.
- **Simulated Multi-Channel Notifications**: SMS, WhatsApp, and Email notices are logged with status `simulated` into a relational audit table with zero third-party telecom costs.

---

## 2. Directory Structure & File Map

```text
Real Estate CrewAI/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py         # Typed environment settings (.env)
│   │   │   ├── security.py       # hashlib.scrypt hashing + PyJWT encode/decode
│   │   │   └── deps.py           # FastAPI dependencies (get_current_user, require_admin, require_tenant)
│   │   ├── db/
│   │   │   └── client.py         # Singleton Supabase PostgreSQL client
│   │   ├── schemas/              # Pydantic request & response models
│   │   │   ├── auth.py           # LoginRequest, TokenResponse, ChangePasswordRequest
│   │   │   ├── tickets.py        # TicketCreateRequest, TicketUpdateRequest, TicketResponse
│   │   │   ├── contractors.py    # ContractorCreate, PaymentCreate, BookAppointmentRequest
│   │   │   ├── visits.py         # ManualVisitCreate, ScheduledVisitCreate, VisitResponse
│   │   │   ├── units.py          # UnitCreate, UnitResponse
│   │   │   ├── tenants.py        # TenantCreate, TenantResponse, LeaseResponse
│   │   │   └── notifications.py  # NotificationResponse, PromptSettingUpdate
│   │   ├── repositories/         # Direct Supabase table access operations
│   │   │   ├── users_repo.py     # User lookups, creation, password updates
│   │   │   ├── units_repo.py     # Units and leases queries
│   │   │   ├── tickets_repo.py   # Ticket filtering, joins with units/contractors/tenants
│   │   │   ├── contractors_repo.py # Directory, payments ledger, resolved work orders
│   │   │   ├── visits_repo.py    # Manual and recurring visit records
│   │   │   └── notifications_repo.py # Audit logger for SMS, WhatsApp & Email
│   │   ├── services/             # Pure business logic
│   │   │   ├── triage_service.py # Deterministic safety shield + Gemini AI classification
│   │   │   ├── recurrence_service.py # dateutil.relativedelta recurrence calculations
│   │   │   ├── notifier_service.py   # Multi-channel simulated alert formatting
│   │   │   └── storage_service.py    # Supabase private bucket storage & signed URLs
│   │   ├── routers/              # Thin HTTP endpoint controllers
│   │   │   ├── auth.py           # /auth/login, /auth/me, /auth/change-password
│   │   │   ├── admin_tickets.py  # Ticket queue, filtering, slide-out drawer details
│   │   │   ├── admin_contractors.py # Directory, payments ledger, appointment booking
│   │   │   ├── admin_visits.py   # Manual and scheduled recurring visits management
│   │   │   ├── admin_tenants.py  # Units and resident lease management
│   │   │   ├── admin_settings.py # Notification logs and multi-agent prompt editor
│   │   │   └── tenant_portal.py  # Resident dashboard, ticket timeline, apartment & rent
│   │   └── main.py               # FastAPI application factory, CORS, SPA static serving
│   ├── scripts/
│   │   └── seed.py               # Seeds admin, units, contractors, tenants, leases, tickets
│   ├── tests/
│   │   ├── test_security.py      # Unit tests for scrypt hashing and JWT validity
│   │   ├── test_recurrence.py    # Unit tests for bi-monthly and annual visit math
│   │   └── test_triage.py        # Unit tests for safety hazard emergency overrides
│   └── main.py                   # CLI entrypoint (python backend/main.py)
├── frontend/                     # Modern React + Vite + TypeScript Single Page App
│   ├── src/
│   │   ├── api/client.ts         # Typed fetch client with JWT Bearer auto-injection
│   │   ├── context/AuthContext.tsx # Centralized auth state, login/logout, session persistence
│   │   ├── components/
│   │   │   ├── ProtectedRoute.tsx # Role-gated route enforcement (Admin vs Tenant)
│   │   │   ├── Badge.tsx         # Urgency, Status, and Severity dot indicators
│   │   │   └── Modal.tsx         # Reusable modal container
│   │   ├── layouts/
│   │   │   ├── AdminLayout.tsx   # Sidebar nav (Overview, Tickets, Contractors, Visits, etc.)
│   │   │   └── TenantLayout.tsx  # Resident topbar and tabbed navigation
│   │   ├── pages/
│   │   │   ├── Login.tsx         # Dual-login page with quick-fill credential helpers
│   │   │   ├── admin/
│   │   │   │   ├── AdminOverview.tsx     # Operations KPI center & priority issues
│   │   │   │   ├── TicketsQueue.tsx      # Dense enterprise table with multi-filter bar
│   │   │   │   ├── TicketDrawer.tsx      # Slide-out drawer with past unit tickets & actions
│   │   │   │   ├── ContractorsList.tsx   # Trades directory (Carpentry, Plumbing, HVAC...)
│   │   │   │   ├── ContractorDetail.tsx  # Profile, past issues, payments ledger & booking
│   │   │   │   ├── VisitsManager.tsx     # Calendar of manual visits & recurring schedules
│   │   │   │   ├── TenantsManager.tsx    # Unit & resident lease onboarding
│   │   │   │   ├── NotificationsLog.tsx  # Audit trail of simulated dispatches
│   │   │   │   └── AgentSettings.tsx     # Configurable multi-agent prompt editor
│   │   │   └── tenant/
│   │   │       ├── TenantDashboard.tsx   # Resident overview, active requests, rent due
│   │   │       ├── TenantTickets.tsx     # Request tracking with visual lifecycle timeline
│   │   │       ├── ApartmentDetails.tsx  # Unit specs & verified lease PDF downloads
│   │   │       ├── TenantVisits.tsx      # Both manual and recurring visits visibility
│   │   │       ├── TenantRent.tsx        # Rent statement, due date, auto-debit status
│   │   │       └── TenantSettings.tsx    # Password reset & notification preferences
│   │   ├── App.tsx               # Master route configuration
│   │   └── types.ts              # TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── supabase/
│   └── schema.sql                # Complete 11-table PostgreSQL relational schema & RLS
├── docs/
│   └── generate_docs_pdf.py      # Automated executive PDF documentation generator
├── .env.example                  # Environment configuration template
├── requirements.txt              # Production Python package manifest
├── start.bat                     # Windows 1-click startup launcher
└── start.sh                      # Unix/macOS 1-click startup launcher
```

---

## 3. Database Setup (Supabase PostgreSQL)

1. Open your Supabase Dashboard -> **SQL Editor**.
2. Open [supabase/schema.sql](file:///c:/Users/dell/Desktop/Real%20Estate%20CrewAI/supabase/schema.sql) and paste its entire contents into the SQL Editor, then click **Run**.
   - This creates 11 relational tables: `users`, `units`, `leases`, `documents`, `contractors`, `contractor_payments`, `tickets`, `visits`, `rent_payments`, `notifications`, `settings`.
   - All performance indexes, foreign keys, and Row Level Security policies are automatically configured.
3. Seed sample demo data:
   ```bash
   python backend/scripts/seed.py
   ```

---

## 4. Quick Start & Credentials

### One-Click Launch (Windows)
Double-click `start.bat` or run:
```powershell
.\start.bat
```

### Manual Command
```bash
python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1
```
Open **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)** in your browser.

### Pre-Configured Test Accounts

| Role | Email | Password | Scope & Access |
|---|---|---|---|
| **Property Manager (Admin)** | `admin@realestate.com` | `Admin12345!` | Full portfolio oversight, tickets queue, contractor directory & ledger, manual & recurring visit scheduling, tenant onboarding, agent prompts |
| **Resident Tenant (Unit 4B)** | `johnny@cashmusic.com` | `Tenant12345!` | Personal dashboard, request tracking timeline, Unit 4B details & lease PDFs, recurring inspections, rent payment ledger, password reset |
| **Resident Tenant (Unit 12A)** | `sarah.connor@skyline.org` | `Tenant12345!` | Personal dashboard for Unit 12A, request tracking timeline, annual inspection visibility, rent ledger |

*(On the login screen, convenient one-click pills allow instant credential autofill for smooth Loom video demonstrations.)*

---

## 5. Feature Highlights

### A. Dedicated Contractor Directory & Ledger
- Dedicated navigation item in the admin sidebar.
- Filter contractors by trade: **Carpentry**, **Plumbing**, **Electrical**, **HVAC**, **Appliance**, **Roofing**.
- Detailed Contractor Profile:
  - Hourly billing rate ($/hr) and contact coordinates.
  - **Past Issues Fixed**: Complete list of resolved work orders associated with the contractor.
  - **Payments Ledger**: History of payments, check/memo references, and total paid to date.
  - **Book Appointment Action**: Book appointment with simulated SMS, WhatsApp, and Email dispatch notifications sent to both the contractor and the unit's resident.

### B. Two-Option Visit Scheduling
When reviewing an issue or unit, Property Managers have two visit actions:
1. **Manual Visit**: Scheduled for a specific date/time (defaulting to tomorrow morning). Automatically logs simulated SMS, WhatsApp, and Email alerts to the resident.
2. **Scheduled Recurring Visit**: Configured with a recurring interval (e.g. *once every 2 months* for filter changes or *every 12 months* for annual fire safety audits). Computed dynamically via `dateutil.relativedelta` and displayed in the tenant's portal.

### C. Tenant Portal Experience
- **Interactive Lifecycle Timeline**: Tracks each request across 5 stages: *Logged* -> *AI Triaged* -> *Technician Dispatched* -> *In Progress* -> *Resolved*.
- **Apartment & Verified Lease Documents**: View unit layout, monthly rent, and download lease documents.
- **Rent Statements & Due Reminders**: Transparent ledger of paid and upcoming monthly rent payments.
- **Resident Settings**: In-portal password update and notification preference controls.

### D. Multi-Agent AI Triage & Safety Shield
- Deterministic regex scans incoming text for immediate life-safety hazards (`gas leak`, `fire`, `smoke`, `sparking`, `flood`, `burst pipe`, `carbon monoxide`, `sewage`).
- Immediate life hazards bypass normal heuristics and force **Emergency Priority (Severity 5)** with emergency protocol action items.
- Routine requests are triaged into equipment categories with estimated cost brackets and synthesized historical work order context.

---

## 6. Verification & Automated Tests

Run the backend unit test suite:
```bash
python -m unittest discover -s backend/tests -p "test_*.py"
```
Tests cover:
- Cryptographic `hashlib.scrypt` password hashing and constant-time verification.
- `PyJWT` bearer token issuance and expiration validation.
- `dateutil.relativedelta` recurring visit calculation.
- Safety Shield hazard regex override and deterministic fallback categorization.
