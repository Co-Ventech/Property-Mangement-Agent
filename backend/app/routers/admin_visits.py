from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from backend.app.core.deps import require_admin
from backend.app.repositories.visits_repo import visits_repo
from backend.app.repositories.units_repo import units_repo, leases_repo
from backend.app.services.notifier_service import notifier_service
from backend.app.services.recurrence_service import compute_next_occurrence
from backend.app.schemas.visits import ManualVisitCreate, ScheduledVisitCreate, VisitResponse

router = APIRouter(prefix="/admin/visits", tags=["admin-visits"], dependencies=[Depends(require_admin)])

class StatusUpdate(BaseModel):
    status: str

@router.get("", response_model=List[VisitResponse])
async def list_visits():
    visits = visits_repo.get_all()
    for v in visits:
        if v.get("kind") == "scheduled" and v.get("interval_months"):
            nxt = compute_next_occurrence(v["visit_at"], v["interval_months"])
            v["next_occurrence"] = nxt.isoformat()
        else:
            v["next_occurrence"] = v["visit_at"]
    return visits

@router.post("/manual", response_model=VisitResponse)
async def create_manual_visit(req: ManualVisitCreate):
    unit = units_repo.get_by_id(req.unit_id)
    if not unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

    # If visit_at is not provided, default to tomorrow at 10:00 AM
    if not req.visit_at:
        tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
        visit_time = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0)
        visit_at_str = visit_time.isoformat()
    else:
        visit_at_str = req.visit_at

    visit_payload = {
        "unit_id": req.unit_id,
        "ticket_id": req.ticket_id,
        "contractor_id": req.contractor_id,
        "kind": "manual",
        "title": req.title,
        "visit_at": visit_at_str,
        "interval_months": None,
        "status": "confirmed",
        "notes": req.notes
    }
    created = visits_repo.create(visit_payload)

    # Dispatch simulated notifications to tenant across chosen channels (SMS / WhatsApp / Email)
    active_lease = leases_repo.get_active_by_unit(req.unit_id)
    if active_lease and active_lease.get("users"):
        tenant = active_lease["users"]
        msg = notifier_service.format_manual_visit_message(
            tenant_name=tenant.get("full_name", "Resident"),
            unit_number=unit["unit_number"],
            visit_datetime_str=visit_at_str,
            reason=req.title
        )
        notifier_service.notify(
            channels=req.channels,
            recipient=tenant.get("phone") or tenant.get("email"),
            subject=f"Notice of Maintenance Inspection: Unit {unit['unit_number']}",
            body=msg,
            user_id=tenant.get("id"),
            ticket_id=req.ticket_id,
            visit_id=created["id"]
        )

    created["unit_number"] = unit["unit_number"]
    created["next_occurrence"] = visit_at_str
    return created

@router.post("/scheduled", response_model=VisitResponse)
async def create_scheduled_visit(req: ScheduledVisitCreate):
    unit = units_repo.get_by_id(req.unit_id)
    if not unit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

    visit_payload = {
        "unit_id": req.unit_id,
        "ticket_id": req.ticket_id,
        "contractor_id": req.contractor_id,
        "kind": "scheduled",
        "title": req.title,
        "visit_at": req.visit_at,
        "interval_months": req.interval_months,
        "status": "confirmed",
        "notes": req.notes
    }
    created = visits_repo.create(visit_payload)
    
    # Notify tenant of scheduled recurring maintenance program
    active_lease = leases_repo.get_active_by_unit(req.unit_id)
    if active_lease and active_lease.get("users"):
        tenant = active_lease["users"]
        msg = (
            f"Notice for Unit {unit['unit_number']}: Scheduled periodic inspection '{req.title}' "
            f"is set to recur every {req.interval_months} month(s), beginning {req.visit_at}."
        )
        notifier_service.notify(
            channels=["email", "sms"],
            recipient=tenant.get("phone") or tenant.get("email"),
            subject=f"Periodic Maintenance Program: Unit {unit['unit_number']}",
            body=msg,
            user_id=tenant.get("id"),
            ticket_id=req.ticket_id,
            visit_id=created["id"]
        )

    nxt = compute_next_occurrence(req.visit_at, req.interval_months)
    created["unit_number"] = unit["unit_number"]
    created["next_occurrence"] = nxt.isoformat()
    return created

@router.patch("/{visit_id}/status", response_model=VisitResponse)
async def update_visit_status(visit_id: str, req: StatusUpdate):
    updated = visits_repo.update_status(visit_id, req.status)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Visit not found")
    return updated

