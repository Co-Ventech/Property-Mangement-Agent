from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.core.deps import require_admin
from backend.app.core.security import hash_password
from backend.app.repositories.users_repo import users_repo
from backend.app.repositories.units_repo import units_repo, leases_repo
from backend.app.schemas.tenants import TenantCreate, TenantResponse
from backend.app.schemas.units import UnitCreate, UnitResponse

router = APIRouter(prefix="/admin", tags=["admin-tenants-units"], dependencies=[Depends(require_admin)])

@router.get("/tenants", response_model=List[dict])
async def list_tenants():
    tenants = users_repo.list_tenants()
    results = []
    for t in tenants:
        active_lease = leases_repo.get_active_by_tenant(t["id"])
        unit_info = active_lease.get("units") if active_lease else None
        results.append({
            "id": t["id"],
            "email": t["email"],
            "full_name": t["full_name"],
            "phone": t.get("phone"),
            "role": t["role"],
            "created_at": t.get("created_at"),
            "unit_number": unit_info.get("unit_number") if unit_info else None,
            "unit_id": unit_info.get("id") if unit_info else None,
            "property_name": unit_info.get("property_name") if unit_info else None,
            "lease_status": active_lease.get("status") if active_lease else "no_lease",
            "monthly_rent": active_lease.get("monthly_rent") if active_lease else None,
            "emergency_contact": t.get("emergency_contact"),
            "employer": t.get("employer"),
            "vehicle_info": t.get("vehicle_info"),
            "pet_info": t.get("pet_info"),
            "notes": t.get("notes")
        })
    return results

@router.post("/tenants", response_model=TenantResponse)
async def create_tenant(req: TenantCreate):
    existing = users_repo.get_by_email(req.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        
    pwd_hash = hash_password(req.password)
    user = users_repo.create(
        email=req.email,
        password_hash=pwd_hash,
        role="tenant",
        full_name=req.full_name,
        phone=req.phone,
        emergency_contact=req.emergency_contact,
        employer=req.employer,
        vehicle_info=req.vehicle_info,
        pet_info=req.pet_info,
        notes=req.notes
    )
    
    # If unit and lease dates provided, create lease
    if req.unit_id and req.lease_start and req.lease_end:
        leases_repo.create(
            unit_id=req.unit_id,
            tenant_id=user["id"],
            start_date=str(req.lease_start),
            end_date=str(req.lease_end),
            monthly_rent=req.monthly_rent or 1500.0,
            deposit=req.deposit or 0.0,
            status="active"
        )
        
    return TenantResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        role=user["role"],
        emergency_contact=user.get("emergency_contact"),
        employer=user.get("employer"),
        vehicle_info=user.get("vehicle_info"),
        pet_info=user.get("pet_info"),
        notes=user.get("notes"),
        created_at=user.get("created_at")
    )

@router.get("/units", response_model=List[UnitResponse])
async def list_units():
    return units_repo.get_all()

@router.post("/units", response_model=UnitResponse)
async def create_unit(req: UnitCreate):
    existing = units_repo.get_by_number(req.unit_number)
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unit number already exists")
    created = units_repo.create(
        unit_number=req.unit_number,
        address=req.address,
        bedrooms=req.bedrooms,
        bathrooms=req.bathrooms,
        sq_ft=req.sq_ft,
        monthly_rent=req.monthly_rent,
        property_name=req.property_name,
        property_type=req.property_type,
        floor=req.floor,
        parking_spot=req.parking_spot,
        amenities=req.amenities,
        status=req.status,
        notes=req.notes
    )
    return created
