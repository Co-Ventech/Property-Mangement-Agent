import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from backend.app.core.deps import require_admin
from backend.app.repositories.tickets_repo import tickets_repo
from backend.app.repositories.units_repo import units_repo
from backend.app.services.triage_service import triage_service
from backend.app.schemas.tickets import TicketUpdateRequest, TicketResponse, TicketCreateRequest

router = APIRouter(prefix="/admin/tickets", tags=["admin-tickets"], dependencies=[Depends(require_admin)])

@router.get("", response_model=List[TicketResponse])
async def list_tickets(
    category: Optional[str] = Query(None),
    severity: Optional[int] = Query(None),
    urgency: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    tickets = tickets_repo.get_all(
        category=category,
        severity=severity,
        urgency=urgency,
        status=status
    )
    return tickets

@router.get("/{ticket_id}", response_model=TicketResponse)
async def get_ticket_detail(ticket_id: str):
    ticket = tickets_repo.get_by_id(ticket_id)
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket

@router.patch("/{ticket_id}", response_model=TicketResponse)
async def update_ticket(ticket_id: str, req: TicketUpdateRequest):
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No updates provided")
        
    updated = tickets_repo.update(ticket_id, updates)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
        
    return tickets_repo.get_by_id(ticket_id)

@router.post("", response_model=TicketResponse)
async def create_ticket(req: TicketCreateRequest):
    ticket_id = f"TICK-{uuid.uuid4().hex[:6].upper()}"
    unit_history = []
    if req.unit_id:
        # fetch prior tickets for history synthesis
        history_tickets = tickets_repo.get_all()
        unit_history = [t for t in history_tickets if str(t.get("unit_id")) == str(req.unit_id)]

    triage_res = triage_service.triage_ticket(req.title, req.description, unit_history)

    payload = {
        "id": ticket_id,
        "unit_id": req.unit_id,
        "title": req.title,
        "description": req.description,
        "category": triage_res.get("category", "other"),
        "severity": triage_res.get("severity", 2),
        "urgency": triage_res.get("urgency", "routine"),
        "status": "triaged",
        "ai_rationale": triage_res.get("ai_rationale"),
        "ai_summary": triage_res.get("ai_summary"),
        "history_findings": triage_res.get("history_findings"),
        "action_plan": triage_res.get("action_plan", []),
        "est_cost": triage_res.get("est_cost"),
        "evidence": req.evidence_urls
    }
    
    created = tickets_repo.create(payload)
    return tickets_repo.get_by_id(ticket_id)

