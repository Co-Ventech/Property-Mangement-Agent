from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from backend.app.db.client import db

class TicketsRepository:
    def get_all(
        self,
        category: Optional[str] = None,
        severity: Optional[int] = None,
        urgency: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = db.table("tickets").select(
            "*, users(id, full_name, email, phone), units(id, unit_number, address), contractors(id, name, trade)"
        )
        if category and category.lower() != "all":
            query = query.eq("category", category.lower())
        if severity:
            query = query.eq("severity", severity)
        if urgency and urgency.lower() != "all":
            query = query.eq("urgency", urgency.lower())
        if status and status.lower() != "all":
            query = query.eq("status", status.lower())
            
        res = query.order("created_at", desc=True).execute()
        raw_tickets = res.data or []
        
        # Flatten relationships for ergonomic frontend consumption
        results = []
        for t in raw_tickets:
            user = t.get("users") or {}
            unit = t.get("units") or {}
            contractor = t.get("contractors") or {}
            t["tenant_name"] = user.get("full_name")
            t["tenant_email"] = user.get("email")
            t["tenant_phone"] = user.get("phone")
            t["unit_number"] = unit.get("unit_number")
            t["unit_address"] = unit.get("address")
            t["contractor_name"] = contractor.get("name")
            t["contractor_trade"] = contractor.get("trade")
            results.append(t)
        return results

    def get_by_id(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        res = db.table("tickets").select(
            "*, users(id, full_name, email, phone), units(id, unit_number, address), contractors(id, name, trade, phone, email)"
        ).eq("id", ticket_id).execute()
        
        if not res.data:
            return None
            
        t = res.data[0]
        user = t.get("users") or {}
        unit = t.get("units") or {}
        contractor = t.get("contractors") or {}
        t["tenant_name"] = user.get("full_name")
        t["tenant_email"] = user.get("email")
        t["tenant_phone"] = user.get("phone")
        t["unit_number"] = unit.get("unit_number")
        t["unit_address"] = unit.get("address")
        t["contractor_name"] = contractor.get("name")
        t["contractor_trade"] = contractor.get("trade")

        # Fetch past tickets for this unit / tenant for instant historical context
        unit_id = t.get("unit_id")
        if unit_id:
            past_res = db.table("tickets").select(
                "id, title, category, severity, urgency, status, created_at, resolved_at"
            ).eq("unit_id", unit_id).neq("id", ticket_id).order("created_at", desc=True).limit(5).execute()
            t["past_tickets"] = past_res.data or []
        else:
            t["past_tickets"] = []
            
        return t

    def get_by_tenant(self, tenant_id: str) -> List[Dict[str, Any]]:
        res = db.table("tickets").select(
            "*, units(unit_number, address), contractors(name, trade)"
        ).eq("tenant_id", tenant_id).order("created_at", desc=True).execute()
        
        raw_tickets = res.data or []
        for t in raw_tickets:
            unit = t.get("units") or {}
            contractor = t.get("contractors") or {}
            t["unit_number"] = unit.get("unit_number")
            t["contractor_name"] = contractor.get("name")
            t["contractor_trade"] = contractor.get("trade")
        return raw_tickets

    def create(self, data: Dict[str, Any]) -> Dict[str, Any]:
        res = db.table("tickets").insert(data).execute()
        return res.data[0]

    def update(self, ticket_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if updates.get("status") == "resolved" and "resolved_at" not in updates:
            updates["resolved_at"] = datetime.now(timezone.utc).isoformat()
        res = db.table("tickets").update(updates).eq("id", ticket_id).execute()
        return res.data[0] if res.data else None

tickets_repo = TicketsRepository()

