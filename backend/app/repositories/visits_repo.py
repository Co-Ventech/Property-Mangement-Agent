from typing import Optional, Dict, Any, List
from backend.app.db.client import db

class VisitsRepository:
    def get_all(self) -> List[Dict[str, Any]]:
        res = db.table("visits").select(
            "*, units(unit_number, address), contractors(name, trade), tickets(title, urgency)"
        ).order("visit_at", desc=False).execute()
        
        visits = res.data or []
        for v in visits:
            unit = v.get("units") or {}
            contractor = v.get("contractors") or {}
            ticket = v.get("tickets") or {}
            v["unit_number"] = unit.get("unit_number")
            v["contractor_name"] = contractor.get("name")
            v["ticket_title"] = ticket.get("title")
        return visits

    def get_by_unit(self, unit_id: str) -> List[Dict[str, Any]]:
        res = db.table("visits").select(
            "*, units(unit_number, address), contractors(name, trade), tickets(title, urgency)"
        ).eq("unit_id", unit_id).order("visit_at", desc=False).execute()
        
        visits = res.data or []
        for v in visits:
            unit = v.get("units") or {}
            contractor = v.get("contractors") or {}
            ticket = v.get("tickets") or {}
            v["unit_number"] = unit.get("unit_number")
            v["contractor_name"] = contractor.get("name")
            v["ticket_title"] = ticket.get("title")
        return visits

    def create(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = db.table("visits").insert(payload).execute()
        return res.data[0]

    def update_status(self, visit_id: str, status: str) -> Optional[Dict[str, Any]]:
        res = db.table("visits").update({"status": status}).eq("id", visit_id).execute()
        return res.data[0] if res.data else None

visits_repo = VisitsRepository()

