# Real Estate AI Maintenance Operations Hub
> **Autonomous Multi-Agent Facilities Triage, History Investigation & Dispatch Operations Platform**

[![Runtime: Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Pattern: MVC Architecture](https://img.shields.io/badge/Architecture-MVC_%2B_Services-blue?logo=fastapi&logoColor=white)](#mvc-architectural-design-pattern)
[![Backend: FastAPI + Uvicorn](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Frontend: React + Tailwind CSS](https://img.shields.io/badge/Frontend-React_+_Tailwind-38B2AC?logo=react&logoColor=white)](https://react.dev/)
[![Database: Supabase Postgres + SQLite Fallback](https://img.shields.io/badge/Database-Supabase_+_SQLite-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Security: Zero Credential Exposure Guaranteed](https://img.shields.io/badge/Security-Zero_Secrets_Committed-brightgreen)](#security--secret-protection)

---

## 📖 Executive Summary

The **Real Estate AI Maintenance Operations Hub** is an enterprise-grade multi-agent platform designed to automate end-to-end property maintenance operations:

1. **Resident Self-Service Portal**: Clean, accessible form where residents submit maintenance issues, upload photographic evidence, and receive tracking references without internal priority or score exposure.
2. **Deterministic Safety Guard**: Scans incoming text instantly for life-safety hazards (`gas leak`, `fire`, `smoke`, `flood`, `burst pipe`, `carbon monoxide`, `sewage`) and enforces deterministic Emergency elevation before model inference.
3. **Multi-Agent Collaborative Triage**:
   - **Agent 1 (Intake Analyst)**: Extracts physical symptoms, determines trade specialty (Plumbing, Electrical, HVAC, Appliance, Structural), and identifies missing diagnostic parameters.
   - **Agent 2 (History Investigator)**: Queries past work order records for the specific property unit, flagging recurring component failures (e.g., chronic HVAC capacitor/compressor burnout).
   - **Agent 3, 4 & 5 (Dispatch Agents)**: Formulates targeted, ready-to-send work orders across **Email**, **SMS**, and **WhatsApp**.
4. **Operations Supervisor Dashboard**: Complete registry with real-time urgency/status filters, rich metric cards, slide-out detailed inspection drawer, and one-click dispatch triggers.

---

## 🏛️ Clean Repository & MVC Structure

The repository maintains a clean separation: the **`frontend/`** folder contains the dedicated HTML, CSS, and React JavaScript modules, the **`backend/`** folder houses the Python API, database services, and AI agents, and the root folder holds only universal project files:

```text
Real Estate CrewAI/
├── .env.example                     # Universal configuration template
├── .gitignore                       # Global git exclusion rules
├── README.md                        # Complete system documentation
├── requirements.txt                 # Python dependencies
├── start.bat                        # Windows 1-click launcher
├── start.sh                         # Linux/macOS 1-click launcher
├── supabase_schema.sql              # Supabase PostgreSQL schema
│
├── frontend/                        # DEDICATED FRONTEND DIRECTORY (VIEW)
│   ├── index.html                   # HTML5 shell & asset links
│   ├── css/
│   │   └── styles.css               # Dedicated CSS styles & badge definitions
│   └── js/
│       └── app.js                   # Dedicated React 18 application component
│
└── backend/                         # DEDICATED BACKEND DIRECTORY (MVC)
    ├── config/                      # CONFIG: Settings & provider policies
    │   └── settings.py              # Environment variables, DB paths, and keys
    │
    ├── models/                      # MODEL (M): Data schemas & domain entities
    │   └── ticket.py                # Pydantic schemas (Ticket, MultiAgentAnalysis, etc.)
    │
    ├── controllers/                 # CONTROLLER (C): Route handlers
    │   ├── ticket_controller.py     # Request validation, triage, and ticket CRUD
    │   └── operations_controller.py # Dynamic prompt adjustments & dispatching
    │
    ├── services/                    # SERVICES: Heavy business logic
    │   ├── database_service.py      # Hybrid Supabase cloud sync + SQLite
    │   ├── multi_agent_service.py   # 3-Tier AI agents & safety shield
    │   └── agent_config_service.py  # System prompt settings & 24-mo repair logs
    │
    ├── uploads/                     # Storage for resident evidence photos (.gitkeep)
    ├── agent_config.json            # Dynamic runtime agent system prompts
    ├── historical_records.json      # Unit historical repair logbook
    ├── seed_data.py                 # Realistic demo data populator
    ├── generate_docs_pdf.py         # Executive PDF report builder
    └── main.py                      # Main Application Router & Entry Point
```

---

## 🛠️ Complete Setup Guide

### Prerequisites
- **Python 3.10+** installed ([python.org](https://www.python.org/downloads/))
- **Git** installed ([git-scm.com](https://git-scm.com/))
- *(Optional)* [Google Gemini API Key](https://aistudio.google.com/) for live LLM reasoning
- *(Optional)* [Supabase Account](https://supabase.com/) for cloud PostgreSQL sync

---

### Step 1: Clone the Repository

```bash
git clone <repository_url>
cd "Real Estate CrewAI"
```

---

### Step 2: Configure Environment Variables

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Open `.env` in any text editor. The default settings run out-of-the-box in **local offline mode** without requiring any paid accounts:

```dotenv
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.0-flash
LLM_API_KEY=your_gemini_api_key_here
ALLOW_PAID_SERVICES=false

# Supabase Storage & Database Integration (Optional)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key

PORT=8000
HOST=127.0.0.1
```

---

### Step 3: Install Dependencies

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

# Linux / macOS
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

### Step 4: Seed Demo Data (Optional but Recommended)

Populate the database with pre-configured, realistic multi-urgency maintenance tickets:

```bash
python backend/seed_data.py
```

---

### Step 5: Launch the Application

#### Option A: One-Click Launchers
- **Windows**: Double-click `start.bat` or run:
  ```cmd
  start.bat
  ```
- **macOS / Linux**:
  ```bash
  chmod +x start.sh
  ./start.sh
  ```

#### Option B: Direct Python Command
```bash
python -m uvicorn backend.main:app --port 8000 --host 127.0.0.1
```

---

### Step 6: Access the Hub

Open your browser to:
👉 **[http://127.0.0.1:8000/dashboard/](http://127.0.0.1:8000/dashboard/)**

- **Resident Portal Tab**: Submit new tickets with photos (internal scores/rationale stay hidden from tenants).
- **Operations Overview Tab**: View live KPI cards, triage recent cases, inspect AI diagnosis rationale, and review historical repair records.
- **Maintenance Queue Tab**: Full-table registry with filter pills and slide-out inspection drawer.
- **Agent Prompts Tab**: Customize and fine-tune live agent system instructions.
- **Integrations Tab**: Update dispatch email, phone, and WhatsApp contractor contacts.

---

## 🔒 Security & Secret Protection

- **No Secrets in Source Control**: Verified `.gitignore` prevents `.env`, local SQLite database files (`*.db`), test files, and uploaded evidence files from being committed.
- **Zero Hardcoded Keys**: The application code accesses credentials exclusively through environment variables.
- **Tenant Data Protection**: Tenant forms never display internal scoring, severity numbers, or internal operational ratings back to the resident.
- **Free Baseline Adherence**: Deterministic fallback prevents unexpected charges or third-party paid API invocations unless explicitly authorized via `ALLOW_PAID_SERVICES=true`.
