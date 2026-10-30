"""
Service Layer: Handles Database CRUD and Synchronization.
Provides a clean interface over Supabase and SQLite.
"""
import json, sqlite3
from typing import Optional, List, Dict, Any
from backend.config.settings import DB_PATH, SUPABASE_URL, SUPABASE_KEY
from backend.models.ticket import Ticket

supabase_client = None
if SUPABASE_URL and SUPABASE_KEY and "your-project" not in SUPABASE_URL:
    try:
        from supabase import create_client
        supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        print(f"[DatabaseService] Supabase connection warning: {e}")


class DatabaseService:
    @staticmethod
    def init_database():
        """Initializes tables and ensures all necessary columns exist."""
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
            ai_rating_rationale TEXT,
            status TEXT,
            created_at TEXT
        )
        """)
        conn.commit()

        cols = [c[1] for c in conn.execute("PRAGMA table_info(tickets)").fetchall()]
        for col in ["ai_rating_rationale", "history_findings", "missing_info"]:
            if col not in cols:
                conn.execute(f"ALTER TABLE tickets ADD COLUMN {col} TEXT")
                conn.commit()

        conn.close()

    @staticmethod
    def save_ticket(record: Dict[str, Any]):
        """Persists ticket to Supabase and SQLite."""
        if supabase_client:
            try:
                supabase_client.table("tickets").upsert(record).execute()
            except Exception as e:
                print(f"[DatabaseService] Supabase sync note: {e}")

        conn = sqlite3.connect(DB_PATH)
        evidence_str = json.dumps(record.get("evidence_files", []))
        action_plan_str = json.dumps(record.get("action_plan", []))
        missing_info_str = json.dumps(record.get("missing_info", []))
        dispatch_str = record.get("contractor_dispatch_draft", "")
        if isinstance(dispatch_str, dict):
            dispatch_str = json.dumps(dispatch_str)

        conn.execute("""
        INSERT OR REPLACE INTO tickets (
            id, tenant_name, tenant_email, tenant_phone, flat_number,
            issue_title, description, evidence_files, urgency, severity,
            category, safety_alert, ai_summary, action_plan, estimated_cost,
            contractor_dispatch_draft, history_findings, missing_info, ai_rating_rationale, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            record["id"], record["tenant_name"], record["tenant_email"], record["tenant_phone"],
            record["flat_number"], record["issue_title"], record["description"], evidence_str,
            record["urgency"], record["severity"], record["category"], record.get("safety_alert"),
            record.get("ai_summary", ""), action_plan_str, record.get("estimated_cost", ""),
            dispatch_str, record.get("history_findings", ""), missing_info_str,
            record.get("ai_rating_rationale", ""), record.get("status", "triaged"), record["created_at"]
        ))
        conn.commit()
        conn.close()

    @staticmethod
    def get_tickets(status: Optional[str] = None, urgency: Optional[str] = None) -> List[Dict[str, Any]]:
        """Queries tickets from Supabase or local SQLite."""
        if supabase_client:
            try:
                query = supabase_client.table("tickets").select("*")
                if status and status != "all":
                    query = query.eq("status", status)
                if urgency and urgency != "all":
                    query = query.eq("urgency", urgency)
                res = query.order("created_at", desc=True).execute()
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
            d["evidence_files"] = json.loads(d.get("evidence_files") or "[]")
            d["action_plan"] = json.loads(d.get("action_plan") or "[]")
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

    @staticmethod
    def update_ticket(ticket_id: str, updates: Dict[str, Any]):
        """Updates ticket fields in SQLite and Supabase."""
        conn = sqlite3.connect(DB_PATH)
        fields = []
        params = []
        for k in ["status", "urgency", "severity"]:
            if k in updates:
                fields.append(f"{k} = ?")
                params.append(updates[k])
        if fields:
            params.append(ticket_id)
            conn.execute(f"UPDATE tickets SET {', '.join(fields)} WHERE id = ?", params)
            conn.commit()
        conn.close()

        if supabase_client:
            try:
                clean_updates = {k: updates[k] for k in ["status", "urgency", "severity"] if k in updates}
                supabase_client.table("tickets").update(clean_updates).eq("id", ticket_id).execute()
            except Exception:
                pass

    @staticmethod
    def get_stats() -> Dict[str, int]:
        """Calculates dashboard KPI metrics."""
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

