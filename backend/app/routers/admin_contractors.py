from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.core.deps import require_admin
from backend.app.repositories.contractors_repo import contractors_repo
from backend.app.repositories.visits_repo import visits_repo
from backend.app.repositories.units_repo import leases_repo, units_repo
from backend.app.repositories.tickets_repo import tickets_repo
from backend.app.services.notifier_service import notifier_service
from backend.app.schemas.contractors import (
    ContractorResponse, ContractorDetailResponse, ContractorCreate,
    ContractorPaymentCreate, ContractorPaymentResponse, BookAppointmentRequest
)

router = APIRouter(prefix="/admin/contractors", tags=["admin-contractors"], dependencies=[Depends(require_admin)])

@router.get("", response_model=List[ContractorResponse])
async def list_contractors(trade: Optional[str] = Query(None)):
    return contractors_repo.get_all(trade=trade)

@router.get("/{contractor_id}", response_model=ContractorDetailResponse)
async def get_contractor(contractor_id: str):
    data = contractors_repo.get_by_id(contractor_id)
    if not data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contractor not found")
    return data

@router.post("", response_model=ContractorResponse)
async def create_contractor(req: ContractorCreate):
    created = contractors_repo.create(
        name=req.name,
        trade=req.trade,
        email=req.email,
        phone=req.phone,
        location=req.location,
        hourly_rate=req.hourly_rate,
        notes=req.notes
    )
    return contractors_repo.get_by_id(created["id"])

@router.post("/{contractor_id}/payments", response_model=ContractorPaymentResponse)
async def add_contractor_payment(contractor_id: str, req: ContractorPaymentCreate):
    c = contractors_repo.get_by_id(contractor_id)
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contractor not found")
        
    payment = contractors_repo.add_payment(
        contractor_id=contractor_id,
        amount=req.amount,
        paid_on=str(req.paid_on),
        status=req.status,
        note=req.note,
        ticket_id=req.ticket_id
    )
    return payment

@router.post("/book")
async def book_contractor_appointment(req: BookAppointmentRequest):
    contractor = contractors_repo.get_by_id(req.contractor_id)
    if not contractor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contractor not found")
        
    unit = units_repo.get_by_id(req.unit_id)
    if not unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

    # 1. Create visit record
    visit_payload = {
        "unit_id": req.unit_id,
        "ticket_id": req.ticket_id,
        "contractor_id": req.contractor_id,
        "kind": "manual",
        "title": req.title,
        "visit_at": req.visit_at,
        "status": "confirmed",
        "notes": req.notes
    }
    visit = visits_repo.create(visit_payload)

    # 2. If linked to ticket, update ticket contractor and status to dispatched
    if req.ticket_id:
        tickets_repo.update(req.ticket_id, {
            "contractor_id": req.contractor_id,
            "status": "dispatched"
        })

    # 3. Notify Contractor via selected channels
    contractor_msg = notifier_service.format_contractor_booking_message(
        contractor_name=contractor["name"],
        trade=contractor["trade"],
        unit_number=unit["unit_number"],
        visit_datetime_str=req.visit_at,
        issue_title=req.title
    )
    c_notifications = notifier_service.notify(
        channels=req.channels,
        recipient=contractor["phone"] if "sms" in req.channels or "whatsapp" in req.channels else contractor["email"],
        subject=f"Work Order Dispatch: Unit {unit['unit_number']} - {req.title}",
        body=contractor_msg,
        ticket_id=req.ticket_id,
        visit_id=visit["id"]
    )

    # 4. Notify Tenant of that unit
    active_lease = leases_repo.get_active_by_unit(req.unit_id)
    t_notifications = []
    if active_lease and active_lease.get("users"):
        tenant = active_lease["users"]
        tenant_msg = notifier_service.format_manual_visit_message(
            tenant_name=tenant.get("full_name", "Resident"),
            unit_number=unit["unit_number"],
            visit_datetime_str=req.visit_at,
            reason=f"{contractor['trade']} service appointment with {contractor['name']} for '{req.title}'"
        )
        t_notifications = notifier_service.notify(
            channels=req.channels,
            recipient=tenant.get("phone") or tenant.get("email"),
            subject=f"Maintenance Visit Scheduled: Unit {unit['unit_number']}",
            body=tenant_msg,
            user_id=tenant.get("id"),
            ticket_id=req.ticket_id,
            visit_id=visit["id"]
        )

    return {
        "status": "success",
        "visit": visit,
        "notifications_sent_count": len(c_notifications) + len(t_notifications),
        "message": f"Appointment booked with {contractor['name']} and confirmed with tenant."
    }

