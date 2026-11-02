import uuid
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from backend.app.core.deps import require_tenant
from backend.app.repositories.tickets_repo import tickets_repo
from backend.app.repositories.units_repo import leases_repo, units_repo
from backend.app.repositories.visits_repo import visits_repo
from backend.app.repositories.notifications_repo import notifications_repo, rent_repo, documents_repo
from backend.app.services.triage_service import triage_service
from backend.app.services.recurrence_service import compute_next_occurrence
from backend.app.services.storage_service import storage_service
from backend.app.schemas.tickets import TicketCreateRequest, TicketResponse
from backend.app.schemas.visits import VisitResponse

router = APIRouter(prefix="/tenant", tags=["tenant-portal"], dependencies=[Depends(require_tenant)])

@router.get("/dashboard")
async def get_tenant_dashboard(current_user: dict = Depends(require_tenant)):
    tenant_id = current_user["id"]
    active_lease = leases_repo.get_active_by_tenant(tenant_id)
    unit = active_lease.get("units") if active_lease else None

    # Tickets
    tickets = tickets_repo.get_by_tenant(tenant_id)
    active_tickets = [t for t in tickets if t.get("status") in ["new", "triaged", "dispatched", "in_progress"]]
    
    # Upcoming visits
    upcoming_visits = []
    if unit:
        raw_visits = visits_repo.get_by_unit(unit["id"])
        for v in raw_visits:
            if v.get("kind") == "scheduled" and v.get("interval_months"):
                nxt = compute_next_occurrence(v["visit_at"], v["interval_months"])
                v["next_occurrence"] = nxt.isoformat()
            else:
                v["next_occurrence"] = v["visit_at"]
            upcoming_visits.append(v)
            
    # Rent status
    rent_items = []
    next_rent = None
    if active_lease:
        rent_items = rent_repo.get_by_lease(active_lease["id"])
        pending_rent = [r for r in rent_items if r.get("status") == "pending"]
        if pending_rent:
            next_rent = pending_rent[0]

    return {
        "tenant": {
            "id": tenant_id,
            "full_name": current_user.get("full_name"),
            "email": current_user.get("email")
        },
        "unit": unit,
        "lease": active_lease,
        "active_tickets_count": len(active_tickets),
        "recent_tickets": tickets[:3],
        "upcoming_visits": upcoming_visits[:3],
        "next_rent": next_rent
    }

@router.get("/tickets", response_model=List[TicketResponse])
async def list_tenant_tickets(current_user: dict = Depends(require_tenant)):
    return tickets_repo.get_by_tenant(current_user["id"])

@router.post("/tickets", response_model=TicketResponse)
async def create_tenant_ticket(req: TicketCreateRequest, current_user: dict = Depends(require_tenant)):
    tenant_id = current_user["id"]
    active_lease = leases_repo.get_active_by_tenant(tenant_id)
    unit_id = active_lease.get("unit_id") if active_lease else None

    # Unit past tickets for history synthesis
    unit_history = []
    if unit_id:
        unit_history = tickets_repo.get_by_tenant(tenant_id)

    ticket_id = f"TICK-{uuid.uuid4().hex[:6].upper()}"
    triage_res = triage_service.triage_ticket(req.title, req.description, unit_history)

    payload = {
        "id": ticket_id,
        "tenant_id": tenant_id,
        "unit_id": unit_id,
        "title": req.title,
        "description": req.description,
        "category": triage_res.get("category", "other"),
        "severity": triage_res.get("severity", 2),
        "urgency": triage_res.get("urgency", "routine"),
        "status": "new",
        "ai_rationale": triage_res.get("ai_rationale"),
        "ai_summary": triage_res.get("ai_summary"),
        "history_findings": triage_res.get("history_findings"),
        "action_plan": triage_res.get("action_plan", []),
        "est_cost": triage_res.get("est_cost"),
        "evidence": req.evidence_urls
    }

    tickets_repo.create(payload)
    return tickets_repo.get_by_id(ticket_id)

@router.get("/apartment")
async def get_apartment_details(current_user: dict = Depends(require_tenant)):
    tenant_id = current_user["id"]
    active_lease = leases_repo.get_active_by_tenant(tenant_id)
    unit = active_lease.get("units") if active_lease else None
    documents = documents_repo.get_by_tenant(tenant_id)

    # Attach signed URLs for documents
    for doc in documents:
        if doc.get("storage_path"):
            doc["download_url"] = storage_service.get_signed_url(doc["storage_path"])

    return {
        "unit": unit,
        "lease": active_lease,
        "documents": documents
    }

@router.get("/visits", response_model=List[VisitResponse])
async def get_tenant_visits(current_user: dict = Depends(require_tenant)):
    tenant_id = current_user["id"]
    active_lease = leases_repo.get_active_by_tenant(tenant_id)
    if not active_lease or not active_lease.get("unit_id"):
        return []

    visits = visits_repo.get_by_unit(active_lease["unit_id"])
    for v in visits:
        if v.get("kind") == "scheduled" and v.get("interval_months"):
            nxt = compute_next_occurrence(v["visit_at"], v["interval_months"])
            v["next_occurrence"] = nxt.isoformat()
        else:
            v["next_occurrence"] = v["visit_at"]
    return visits

@router.get("/rent")
async def get_tenant_rent(current_user: dict = Depends(require_tenant)):
    tenant_id = current_user["id"]
    active_lease = leases_repo.get_active_by_tenant(tenant_id)
    if not active_lease:
        return {"lease": None, "payments": []}

    payments = rent_repo.get_by_lease(active_lease["id"])
    return {
        "lease": active_lease,
        "payments": payments
    }

@router.get("/notifications")
async def get_tenant_notifications(current_user: dict = Depends(require_tenant)):
    return notifications_repo.get_by_user(current_user["id"])

