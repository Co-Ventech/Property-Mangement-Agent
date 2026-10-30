# Real Estate AI Maintenance Operations Hub
> **Autonomous Multi-Agent Facilities Triage, History Investigation & Dispatch Operations Platform**

[![Runtime: Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Backend: FastAPI + Uvicorn](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Frontend: React + Tailwind CSS](https://img.shields.io/badge/Frontend-React_+_Tailwind-38B2AC?logo=react&logoColor=white)](https://react.dev/)
[![Database: Supabase Postgres + SQLite Fallback](https://img.shields.io/badge/Database-Supabase_+_SQLite-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![AI Models: Google Gemini & Local Ollama Ready](https://img.shields.io/badge/AI-Gemini_+_Ollama-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Security: Zero Credential Exposure Guaranteed](https://img.shields.io/badge/Security-Zero_Secrets_Committed-brightgreen)](#security--secret-protection)

---

## 📖 Executive Summary

The **Real Estate AI Maintenance Operations Hub** is an enterprise-ready, plug-and-play multi-agent platform designed to automate end-to-end property maintenance operations:

1. **Resident Self-Service Portal**: Clean, accessible form where residents submit maintenance issues, upload photographic evidence, and receive tracking references without internal priority or score exposure.
2. **Deterministic Safety Guard**: Scans incoming text instantly for life-safety hazards (`gas leak`, `fire`, `smoke`, `flood`, `burst pipe`, `carbon monoxide`, `sewage`) and enforces deterministic Emergency elevation before model inference.
3. **Multi-Agent Collaborative Triage**:
   - **Agent 1 (Intake Analyst)**: Extracts physical symptoms, determines trade specialty (Plumbing, Electrical, HVAC, Appliance, Structural), and identifies missing diagnostic parameters.
   - **Agent 2 (History Investigator)**: Queries past work order records for the specific property unit, flagging recurring component failures (e.g., chronic HVAC capacitor/compressor burnout).
   - **Agent 3, 4 & 5 (Dispatch Agents)**: Formulates targeted, ready-to-send work orders across **Email**, **SMS**, and **WhatsApp**.
4. **Operations Supervisor Dashboard**: Complete registry with real-time urgency/status filters, rich metric cards, slide-out detailed inspection drawer, and one-click dispatch triggers.

---

## ⚡ Uncompromising Plug-and-Play Design

- **Zero-Config Offline Resilience**: Boots instantly even with blank API keys. If Gemini or Supabase is not configured or network access fails, the platform transparently falls back to local deterministic rules and local SQLite persistence. Presenters are never stranded by conference Wi-Fi failures or missing tokens.
- **Strict Secret Protection**: Real API keys, passwords, and service tokens are kept strictly in `.env` (enforced via `.gitignore`). The template `.env.example` contains only safe placeholder values.
- **Single-Command Startup**: Launch the entire hub using `start.bat` (Windows) or `bash start.sh` (Linux / macOS).

---

## 🛠️ Complete Setup Guide

Follow this step-by-step guide to run the system locally in under 2 minutes.

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

Copy the provided safe environment template:

```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux / macOS:
cp .env.example .env
```

Open `.env` in any text editor. The default settings run out-of-the-box in **local offline mode** without requiring any paid accounts:

```dotenv
# Provider selection: 'gemini', 'ollama', or 'openai'
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.0-flash
LLM_API_KEY=your_gemini_api_key_here
ALLOW_PAID_SERVICES=false

# Supabase Storage & Database Integration (Optional)
# Leave placeholders to use local SQLite (crm.db) automatically
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-role-key

PORT=8000
HOST=127.0.0.1
```

> **Note on Free-First Design**: If you do not enter a `LLM_API_KEY` or `SUPABASE_URL`, the application automatically boots into local heuristic mode and creates a local SQLite database (`crm.db`). Zero external dependencies or paid credits are required.

---

### Step 3: Install Dependencies

Create a virtual environment (recommended) and install the packages:

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

Populate the database with pre-configured, realistic multi-urgency maintenance tickets (HVAC, plumbing, electrical, structural, emergency gas leak):

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

## 🏗️ Project Architecture & File Structure

```text
Real Estate CrewAI/
├── .env.example              # Sanitized environment template (no secrets)
├── .gitignore                # Filters out .env, *.db, uploads, test files & cache
├── README.md                 # Complete system documentation & setup guide
├── requirements.txt          # Python dependencies
├── start.bat                 # Windows one-click launcher
├── start.sh                  # Linux/macOS one-click launcher
├── supabase_schema.sql       # Optional cloud schema for Supabase PostgreSQL
├── triage.py                 # Core deterministic safety & triage logic
├── generate_docs_pdf.py      # Executable script to build client presentation PDF
└── backend/
    ├── main.py               # FastAPI backend with multi-agent orchestration
    ├── seed_data.py          # Script to populate rich multi-urgency demo tickets
    ├── agent_config.json     # Dynamic system prompts & settings
    ├── historical_records.json # Unit repair histories for Agent 2 investigation
    ├── uploads/              # Local disk storage for tenant photos (.gitkeep)
    └── static/
        └── index.html        # Single-page React enterprise operations interface
```

---

## 🤖 Multi-Agent Operations Workflow

```text
[Tenant Request]
       │
       ▼
[Deterministic Safety Filter] ─── (Matches 'gas leak', 'fire', 'burst pipe') ──► Immediate EMERGENCY
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│             Collaborative Multi-Agent Engine                │
│                                                             │
│  Agent 1: Maintenance Intake Analyst                        │
│  • Extracts symptoms, category, unit reference              │
│  • Identifies missing parameters                            │
│                                                             │
│  Agent 2: Maintenance History Investigator                  │
│  • Queries Unit history for repeat equipment failures       │
│  • Discovers chronic capacitor/compressor wear ($450 sunk)  │
│                                                             │
│  Agent 3, 4, 5: Contractor Dispatch Agents                  │
│  • Generates tailored Email, SMS & WhatsApp work orders     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                Consolidated Case Report                     │
│  • Urgency & Severity Score (1-5)                           │
│  • AI Priority Rating Rationale                             │
│  • Action Plan & Estimated Budget Scope                     │
│  • One-Click Email / SMS / WhatsApp Dispatch Triggers       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security & Secret Protection

- **No Secrets in Source Control**: Verified `.gitignore` prevents `.env`, local SQLite database files (`*.db`), test files, and uploaded evidence files from being committed.
- **Zero Hardcoded Keys**: The application code accesses credentials exclusively through environment variables.
- **Tenant Data Protection**: Tenant forms never display internal scoring, severity numbers, or internal operational ratings back to the resident.
- **Free Baseline Adherence**: Deterministic fallback prevents unexpected charges or third-party paid API invocations unless explicitly authorized via `ALLOW_PAID_SERVICES=true`.
