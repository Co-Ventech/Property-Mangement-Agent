from typing import Optional, List, Any, Dict
from pydantic import BaseModel

class TicketCreateRequest(BaseModel):
    title: str
    description: str
    unit_id: Optional[str] = None
    category: Optional[str] = "other"
    evidence_urls: List[str] = []

class TicketUpdateRequest(BaseModel):
    category: Optional[str] = None
    severity: Optional[int] = None
    urgency: Optional[str] = None
    status: Optional[str] = None
    contractor_id: Optional[str] = None
    action_plan: Optional[List[str]] = None
    est_cost: Optional[str] = None

class TicketResponse(BaseModel):
    id: str
    tenant_id: Optional[str] = None
    unit_id: Optional[str] = None
    title: str
    description: str
    category: str
    severity: int
    urgency: str
    status: str
    contractor_id: Optional[str] = None
    ai_rationale: Optional[str] = None
    ai_summary: Optional[str] = None
    history_findings: Optional[str] = None
    action_plan: List[str] = []
    est_cost: Optional[str] = None
    evidence: List[Any] = []
    created_at: Optional[str] = None
    resolved_at: Optional[str] = None
    # Joined metadata for presentation
    tenant_name: Optional[str] = None
    tenant_email: Optional[str] = None
    tenant_phone: Optional[str] = None
    unit_number: Optional[str] = None
    unit_address: Optional[str] = None
    contractor_name: Optional[str] = None
    contractor_trade: Optional[str] = None
    past_tickets: Optional[List[Dict[str, Any]]] = None

