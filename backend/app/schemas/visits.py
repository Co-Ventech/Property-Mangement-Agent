from typing import Optional, List
from pydantic import BaseModel

class ManualVisitCreate(BaseModel):
    unit_id: str
    ticket_id: Optional[str] = None
    contractor_id: Optional[str] = None
    title: str = "Issue Inspection & Repair Visit"
    visit_at: Optional[str] = None # Defaults to tomorrow if None
    channels: List[str] = ["sms", "whatsapp", "email"]
    notes: Optional[str] = None

class ScheduledVisitCreate(BaseModel):
    unit_id: str
    ticket_id: Optional[str] = None
    contractor_id: Optional[str] = None
    title: str
    visit_at: str
    interval_months: int = 2 # e.g. once every 2 months
    notes: Optional[str] = None

class VisitResponse(BaseModel):
    id: str
    unit_id: str
    ticket_id: Optional[str] = None
    contractor_id: Optional[str] = None
    kind: str # 'manual' | 'scheduled'
    title: str
    visit_at: str
    interval_months: Optional[int] = None
    status: str
    notes: Optional[str] = None
    created_at: Optional[str] = None
    next_occurrence: Optional[str] = None
    unit_number: Optional[str] = None
    contractor_name: Optional[str] = None
    ticket_title: Optional[str] = None

