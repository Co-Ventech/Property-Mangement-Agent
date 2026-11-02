from typing import Optional, Any, Dict
from pydantic import BaseModel

# Notifications
class NotificationResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    channel: str # 'sms' | 'whatsapp' | 'email'
    recipient: str
    subject: Optional[str] = None
    body: str
    status: str = "simulated"
    ticket_id: Optional[str] = None
    visit_id: Optional[str] = None
    created_at: Optional[str] = None

# Rent Payments
class RentPaymentResponse(BaseModel):
    id: str
    lease_id: str
    due_date: str
    amount: float
    paid_on: Optional[str] = None
    status: str
    created_at: Optional[str] = None

# Settings & Prompts
class PromptSettingUpdate(BaseModel):
    key: str
    value: Dict[str, Any]

class PromptSettingResponse(BaseModel):
    key: str
    value: Dict[str, Any]
    updated_at: Optional[str] = None

