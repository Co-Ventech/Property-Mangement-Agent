from typing import Optional, Dict, Any, List
from backend.app.db.client import db

class UnitsRepository:
    def get_all(self) -> List[Dict[str, Any]]:
        res = db.table("units").select("*").order("unit_number").execute()
        return res.data or []

    def get_by_id(self, unit_id: str) -> Optional[Dict[str, Any]]:
        res = db.table("units").select("*").eq("id", unit_id).execute()
        return res.data[0] if res.data else None

    def get_by_number(self, unit_number: str) -> Optional[Dict[str, Any]]:
        res = db.table("units").select("*").eq("unit_number", unit_number.strip().upper()).execute()
        return res.data[0] if res.data else None

    def create(
        self, 
        unit_number: str, 
        address: str, 
        bedrooms: int = 1, 
        bathrooms: float = 1.0, 
        sq_ft: Optional[int] = None, 
        monthly_rent: float = 1500.0,
        property_name: Optional[str] = "Capital View Residences",
        property_type: Optional[str] = "Apartment",
        floor: Optional[str] = None,
        parking_spot: Optional[str] = None,
        amenities: Optional[str] = None,
        status: Optional[str] = "Vacant",
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        payload = {
            "unit_number": unit_number.strip().upper(),
            "address": address,
            "bedrooms": bedrooms,
            "bathrooms": bathrooms,
            "sq_ft": sq_ft,
            "monthly_rent": monthly_rent,
            "property_name": property_name or "Capital View Residences",
            "property_type": property_type or "Apartment",
            "floor": floor,
            "parking_spot": parking_spot,
            "amenities": amenities,
            "status": status or "Vacant",
            "notes": notes
        }
        res = db.table("units").insert(payload).execute()
        return res.data[0]

class LeasesRepository:
    def get_active_by_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        res = db.table("leases").select("*, units(*)").eq("tenant_id", tenant_id).eq("status", "active").limit(1).execute()
        return res.data[0] if res.data else None

    def get_all_by_tenant(self, tenant_id: str) -> List[Dict[str, Any]]:
        res = db.table("leases").select("*, units(*)").eq("tenant_id", tenant_id).order("start_date", desc=True).execute()
        return res.data or []

    def get_active_by_unit(self, unit_id: str) -> Optional[Dict[str, Any]]:
        res = db.table("leases").select("*, users(*)").eq("unit_id", unit_id).eq("status", "active").limit(1).execute()
        return res.data[0] if res.data else None

    def create(self, unit_id: str, tenant_id: str, start_date: str, end_date: str, monthly_rent: float, deposit: float = 0.0, status: str = "active") -> Dict[str, Any]:
        payload = {
            "unit_id": unit_id,
            "tenant_id": tenant_id,
            "start_date": str(start_date),
            "end_date": str(end_date),
            "monthly_rent": monthly_rent,
            "deposit": deposit,
            "status": status
        }
        res = db.table("leases").insert(payload).execute()
        # Also update the unit's status to 'Occupied'
        try:
            db.table("units").update({"status": "Occupied"}).eq("id", unit_id).execute()
        except Exception:
            pass
        return res.data[0]

units_repo = UnitsRepository()
leases_repo = LeasesRepository()
