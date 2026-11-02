from typing import Optional, List
from datetime import date
from pydantic import BaseModel

# Units
class UnitBase(BaseModel):
    unit_number: str
    address: str
    bedrooms: int = 1
    bathrooms: float = 1.0
    sq_ft: Optional[int] = None
    monthly_rent: float = 1500.00
    property_name: Optional[str] = "Capital View Residences"
    property_type: Optional[str] = "Apartment"
    floor: Optional[str] = None
    parking_spot: Optional[str] = None
    amenities: Optional[str] = None
    status: Optional[str] = "Vacant"
    notes: Optional[str] = None

class UnitCreate(UnitBase):
    pass

class UnitResponse(UnitBase):
    id: str
    created_at: Optional[str] = None

# Tenants
class TenantCreate(BaseModel):
    email: str
    password: str
    full_name: str
    phone: Optional[str] = None
    unit_id: Optional[str] = None
    lease_start: Optional[date] = None
    lease_end: Optional[date] = None
    monthly_rent: Optional[float] = None
    deposit: Optional[float] = None
    emergency_contact: Optional[str] = None
    employer: Optional[str] = None
    vehicle_info: Optional[str] = None
    pet_info: Optional[str] = None
    notes: Optional[str] = None

class TenantResponse(BaseModel):
    id: str
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str = "tenant"
    emergency_contact: Optional[str] = None
    employer: Optional[str] = None
    vehicle_info: Optional[str] = None
    pet_info: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[str] = None

# Leases
class LeaseCreate(BaseModel):
    unit_id: str
    tenant_id: str
    start_date: date
    end_date: date
    monthly_rent: float
    deposit: float = 0.00
    status: str = "active"

class LeaseResponse(BaseModel):
    id: str
    unit_id: str
    tenant_id: str
    start_date: str
    end_date: str
    monthly_rent: float
    deposit: float
    status: str
    created_at: Optional[str] = None
