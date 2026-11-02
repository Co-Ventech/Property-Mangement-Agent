from typing import Optional, List, Dict, Any
from datetime import datetime
from backend.app.repositories.notifications_repo import notifications_repo

def _format_friendly_datetime(dt_str: str) -> str:
    """Helper to convert ISO datetimes into human-readable appointment times."""
    if not dt_str:
        return ""
    try:
        clean_str = dt_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_str)
        return dt.strftime("%B %d, %Y at %I:%M %p")
    except Exception:
        return dt_str

class NotifierService:
    def notify(
        self,
        channels: List[str],
        recipient: str,
        subject: str,
        body: str,
        user_id: Optional[str] = None,
        ticket_id: Optional[str] = None,
        visit_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Log notifications across selected communication channels.
        Channels supported: 'sms', 'whatsapp', 'email'.
        """
        results = []
        for ch in channels:
            ch_clean = ch.lower().strip()
            if ch_clean not in ["sms", "whatsapp", "email"]:
                continue
                
            record = notifications_repo.log(
                channel=ch_clean,
                recipient=recipient,
                subject=subject if ch_clean == "email" else None,
                body=body,
                user_id=user_id,
                ticket_id=ticket_id,
                visit_id=visit_id,
                status="sent"
            )
            results.append(record)
        return results

    def format_manual_visit_message(self, tenant_name: str, unit_number: str, visit_datetime_str: str, reason: str) -> str:
        friendly_time = _format_friendly_datetime(visit_datetime_str)
        return (
            f"Hello {tenant_name}, a maintenance inspection visit for Unit {unit_number} has been scheduled for {friendly_time}. "
            f"Reason: {reason}. If you need to reschedule, please contact management immediately."
        )

    def format_contractor_booking_message(self, contractor_name: str, trade: str, unit_number: str, visit_datetime_str: str, issue_title: str) -> str:
        friendly_time = _format_friendly_datetime(visit_datetime_str)
        return (
            f"Work Order Dispatch for {contractor_name} ({trade}): You have an appointment at Unit {unit_number} on {friendly_time}. "
            f"Task: {issue_title}. Please confirm receipt and arrival."
        )

notifier_service = NotifierService()
