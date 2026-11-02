from typing import Optional
from pydantic import BaseModel

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
