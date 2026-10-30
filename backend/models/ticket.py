"""
Models Module (M in MVC): Defines the core entities, schemas, and database mappings.
Equivalent to Mongoose/Prisma schemas in MERN.
"""
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class Ticket(BaseModel):
    id: str
    tenant_name: str
    tenant_email: str
    tenant_phone: str
    flat_number: str
    issue_title: str
    description: str
    evidence_files: List[str] = Field(default_factory=list)
    urgency: Literal["emergency", "urgent", "routine"]
    severity: int = Field(ge=1, le=5)
    category: str
    safety_alert: Optional[str] = None
    ai_summary: Optional[str] = ""
    action_plan: List[str] = Field(default_factory=list)
    estimated_cost: Optional[str] = ""
    contractor_dispatch_draft: Optional[Any] = None
    history_findings: Optional[str] = ""
    missing_info: List[str] = Field(default_factory=list)
    ai_rating_rationale: Optional[str] = ""
    status: Literal["triaged", "dispatched", "resolved", "new"] = "triaged"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class MultiAgentAnalysis(BaseModel):
    urgency: str = Field(description="emergency | urgent | routine")
    severity: int = Field(description="Integer 1 to 5")
    category: str = Field(description="plumbing | electrical | hvac | appliance | structural | pest | security | other")
    extracted_symptoms: List[str] = Field(default_factory=list)
    missing_info: List[str] = Field(default_factory=list)
    history_matches: List[Dict[str, Any]] = Field(default_factory=list)
    history_synthesis: str = Field(description="Historical failure synthesis")
    combined_report: str = Field(description="Consolidated findings report for operations supervisor")
    ai_rating_rationale: str = Field(default="", description="Plain-English explanation of why this priority and severity were assigned")
    action_plan: List[str] = Field(description="Recommended step by step actions")
    estimated_cost: str = Field(description="Cost estimation")
    contractor_dispatch_email: str = Field(description="Formatted email ready to send")
    contractor_dispatch_sms: str = Field(default="", description="Concise SMS dispatch alert")
    contractor_dispatch_whatsapp: str = Field(default="", description="Structured WhatsApp dispatch message")


class DispatchRequest(BaseModel):
    channel: Literal["email", "sms", "whatsapp"]
    recipient: str
    message: str
    ticket_id: str


class Triage(BaseModel):
    urgency: Literal["emergency", "urgent", "routine"]
    category: Literal["plumbing", "electrical", "hvac", "appliance", "structural", "pest", "other"]
    suggested_action: str
    reasoning: str

