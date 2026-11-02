from typing import Optional, Dict, Any, List
from backend.app.db.client import db

class ContractorsRepository:
    def get_all(self, trade: Optional[str] = None) -> List[Dict[str, Any]]:
        query = db.table("contractors").select("*")
        if trade and trade.strip() and trade.lower() != "all":
            query = query.ilike("trade", f"%{trade.strip()}%")
        res = query.order("name").execute()
        contractors = res.data or []
        
        # Enrich with payment total and past resolved count
        for c in contractors:
            c_id = c["id"]
            payments_res = db.table("contractor_payments").select("amount").eq("contractor_id", c_id).execute()
            c["total_paid"] = sum(float(p.get("amount", 0)) for p in (payments_res.data or []))
            
            resolved_res = db.table("tickets").select("id").eq("contractor_id", c_id).eq("status", "resolved").execute()
            c["past_issues_fixed_count"] = len(resolved_res.data or [])
        
        return contractors

    def get_by_id(self, contractor_id: str) -> Optional[Dict[str, Any]]:
        res = db.table("contractors").select("*").eq("id", contractor_id).execute()
        if not res.data:
            return None
        c = res.data[0]
        
        # Get past resolved issues
        resolved_res = db.table("tickets").select("id, title, category, severity, urgency, status, created_at, resolved_at, unit_id, units(unit_number, address)").eq("contractor_id", contractor_id).eq("status", "resolved").order("created_at", desc=True).execute()
        c["past_issues_fixed"] = resolved_res.data or []
        c["past_issues_fixed_count"] = len(c["past_issues_fixed"])
        
        # Get payments ledger
        payments_res = db.table("contractor_payments").select("*").eq("contractor_id", contractor_id).order("paid_on", desc=True).execute()
        c["payments"] = payments_res.data or []
        c["total_paid"] = sum(float(p.get("amount", 0)) for p in c["payments"])
        
        return c

    def create(self, name: str, trade: str, email: str, phone: str, location: str, hourly_rate: float, notes: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "name": name,
            "trade": trade,
            "email": email.strip().lower(),
            "phone": phone,
            "location": location,
            "hourly_rate": hourly_rate,
            "notes": notes
        }
        res = db.table("contractors").insert(payload).execute()
        return res.data[0]

    def add_payment(self, contractor_id: str, amount: float, paid_on: str, status: str = "paid", note: Optional[str] = None, ticket_id: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "contractor_id": contractor_id,
            "ticket_id": ticket_id,
            "amount": amount,
            "paid_on": paid_on,
            "status": status,
            "note": note
        }
        res = db.table("contractor_payments").insert(payload).execute()
        return res.data[0]

contractors_repo = ContractorsRepository()

