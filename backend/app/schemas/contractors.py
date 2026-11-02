from typing import Optional, List, Any
from datetime import date
from pydantic import BaseModel

class ContractorBase(BaseModel):
    name: str
    trade: str
    email: str
    phone: str
    location: str
    hourly_rate: float = 85.00
    notes: Optional[str] = None

class ContractorCreate(ContractorBase):
    pass

class ContractorPaymentCreate(BaseModel):
    contractor_id: str
    ticket_id: Optional[str] = None
    amount: float
    paid_on: date
    status: str = "paid"
    note: Optional[str] = None

class ContractorPaymentResponse(BaseModel):
    id: str
    contractor_id: str
    ticket_id: Optional[str] = None
    amount: float
    paid_on: str
    status: str
    note: Optional[str] = None
    created_at: Optional[str] = None

class ContractorResponse(ContractorBase):
    id: str
    created_at: Optional[str] = None
    past_issues_fixed_count: int = 0
    total_paid: float = 0.0

class ContractorDetailResponse(ContractorResponse):
    past_issues_fixed: List[Any] = []
    payments: List[ContractorPaymentResponse] = []

class BookAppointmentRequest(BaseModel):
    contractor_id: str
    unit_id: str
    ticket_id: Optional[str] = None
    title: str
    visit_at: str
    channels: List[str] = ["sms", "email"]
    notes: Optional[str] = None
