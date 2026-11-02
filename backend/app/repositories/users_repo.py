from typing import Optional, Dict, Any, List
from backend.app.db.client import db

class UsersRepository:
    def get_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        res = db.table("users").select("*").eq("email", email.strip().lower()).execute()
        return res.data[0] if res.data else None

    def get_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        res = db.table("users").select("*").eq("id", user_id).execute()
        return res.data[0] if res.data else None

    def list_tenants(self) -> List[Dict[str, Any]]:
        res = db.table("users").select("*").eq("role", "tenant").order("created_at", desc=True).execute()
        return res.data or []

    def create(
        self, 
        email: str, 
        password_hash: str, 
        role: str, 
        full_name: str, 
        phone: Optional[str] = None,
        emergency_contact: Optional[str] = None,
        employer: Optional[str] = None,
        vehicle_info: Optional[str] = None,
        pet_info: Optional[str] = None,
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        payload = {
            "email": email.strip().lower(),
            "password_hash": password_hash,
            "role": role,
            "full_name": full_name,
            "phone": phone,
            "emergency_contact": emergency_contact,
            "employer": employer,
            "vehicle_info": vehicle_info,
            "pet_info": pet_info,
            "notes": notes
        }
        res = db.table("users").insert(payload).execute()
        return res.data[0]

    def update_password(self, user_id: str, new_hash: str) -> bool:
        res = db.table("users").update({"password_hash": new_hash}).eq("id", user_id).execute()
        return bool(res.data)

users_repo = UsersRepository()
