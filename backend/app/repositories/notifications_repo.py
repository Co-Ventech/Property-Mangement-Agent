from typing import Optional, Dict, Any, List
from backend.app.db.client import db

class NotificationsRepository:
    def get_all(self, limit: int = 50) -> List[Dict[str, Any]]:
        res = db.table("notifications").select("*, users(full_name, email)").order("created_at", desc=True).limit(limit).execute()
        return res.data or []

    def get_by_user(self, user_id: str) -> List[Dict[str, Any]]:
        res = db.table("notifications").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return res.data or []

    def log(
        self,
        channel: str,
        recipient: str,
        body: str,
        subject: Optional[str] = None,
        user_id: Optional[str] = None,
        ticket_id: Optional[str] = None,
        visit_id: Optional[str] = None,
        status: str = "simulated"
    ) -> Dict[str, Any]:
        payload = {
            "channel": channel.lower(),
            "recipient": recipient,
            "subject": subject,
            "body": body,
            "status": status,
            "user_id": user_id,
            "ticket_id": ticket_id,
            "visit_id": visit_id
        }
        res = db.table("notifications").insert(payload).execute()
        return res.data[0]

class RentRepository:
    def get_by_lease(self, lease_id: str) -> List[Dict[str, Any]]:
        res = db.table("rent_payments").select("*").eq("lease_id", lease_id).order("due_date", desc=True).execute()
        return res.data or []

    def create(self, lease_id: str, due_date: str, amount: float, status: str = "pending", paid_on: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "lease_id": lease_id,
            "due_date": due_date,
            "amount": amount,
            "status": status,
            "paid_on": paid_on
        }
        res = db.table("rent_payments").insert(payload).execute()
        return res.data[0]

class DocumentsRepository:
    def get_by_tenant(self, tenant_id: str) -> List[Dict[str, Any]]:
        res = db.table("documents").select("*").eq("tenant_id", tenant_id).order("uploaded_at", desc=True).execute()
        return res.data or []

    def create(self, tenant_id: str, name: str, kind: str, storage_path: str, lease_id: Optional[str] = None) -> Dict[str, Any]:
        payload = {
            "tenant_id": tenant_id,
            "name": name,
            "kind": kind,
            "storage_path": storage_path,
            "lease_id": lease_id
        }
        res = db.table("documents").insert(payload).execute()
        return res.data[0]

class SettingsRepository:
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        res = db.table("settings").select("*").eq("key", key).execute()
        return res.data[0]["value"] if res.data else None

    def set(self, key: str, value: Dict[str, Any]) -> Dict[str, Any]:
        payload = {"key": key, "value": value}
        res = db.table("settings").upsert(payload).execute()
        return res.data[0]

notifications_repo = NotificationsRepository()
rent_repo = RentRepository()
documents_repo = DocumentsRepository()
settings_repo = SettingsRepository()

