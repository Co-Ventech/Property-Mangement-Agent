"""
Controller Layer (C in MVC): Ticket Controller.
Handles request validation, orchestrates multi-agent processing, and calls data services.
Equivalent to Express route controllers in MERN.
"""
import os, uuid, shutil
from typing import Optional, List
from datetime import datetime
from fastapi import UploadFile

from backend.config.settings import UPLOADS_DIR
from backend.services.database_service import DatabaseService
from backend.services.multi_agent_service import MultiAgentService


class TicketController:
    @staticmethod
    async def create_ticket(
        tenant_name: str,
        tenant_email: str,
        tenant_phone: str,
        flat_number: str,
        issue_title: str,
        description: str,
        evidence: Optional[List[UploadFile]] = None
    ) -> dict:
        ticket_id = f"TICK-{uuid.uuid4().hex[:6].upper()}"
        saved_files = []
        saved_disk_paths = []

        if evidence:
            for file in evidence:
                if file.filename:
                    ext = os.path.splitext(file.filename)[1]
                    fname = f"{ticket_id}_{uuid.uuid4().hex[:4]}{ext}"
                    dest = os.path.join(UPLOADS_DIR, fname)
                    with open(dest, "wb") as buffer:
                        shutil.copyfileobj(file.file, buffer)
                    saved_files.append(f"/uploads/{fname}")
                    saved_disk_paths.append(dest)

        # 1. Deterministic Safety Check
        safety_alert = MultiAgentService.check_safety_hazards(f"{issue_title} {description}")

        # 2. Collaborative Multi-Agent Pipeline
        analysis = MultiAgentService.run_collaboration_pipeline(
            title=issue_title,
            description=description,
            flat_number=flat_number,
            image_paths=saved_disk_paths
        )

        # Force emergency override if critical safety keyword triggered
        if safety_alert:
            analysis.urgency = "emergency"
            analysis.severity = max(analysis.severity, 4)

        created_at = datetime.utcnow().isoformat()
        status = "triaged"

        channel_payloads = {
            "email": analysis.contractor_dispatch_email,
            "sms": analysis.contractor_dispatch_sms,
            "whatsapp": analysis.contractor_dispatch_whatsapp
        }

        record = {
            "id": ticket_id,
            "tenant_name": tenant_name,
            "tenant_email": tenant_email,
            "tenant_phone": tenant_phone,
            "flat_number": flat_number,
            "issue_title": issue_title,
            "description": description,
            "evidence_files": saved_files,
            "urgency": analysis.urgency,
            "severity": analysis.severity,
            "category": analysis.category,
            "safety_alert": safety_alert,
            "ai_summary": analysis.combined_report,
            "action_plan": analysis.action_plan,
            "estimated_cost": analysis.estimated_cost,
            "contractor_dispatch_draft": channel_payloads,
            "history_findings": analysis.history_synthesis,
            "missing_info": analysis.missing_info,
            "ai_rating_rationale": analysis.ai_rating_rationale,
            "status": status,
            "created_at": created_at
        }

        # 3. Persistence
        DatabaseService.save_ticket(record)

        return {
            "id": ticket_id,
            "status": status,
            "urgency": analysis.urgency,
            "severity": analysis.severity,
            "safety_alert": safety_alert,
            "message": "Ticket logged and collaborative multi-agent triage completed."
        }

    @staticmethod
    def get_all_tickets(status: Optional[str] = None, urgency: Optional[str] = None):
        return DatabaseService.get_tickets(status=status, urgency=urgency)

    @staticmethod
    def update_ticket(ticket_id: str, updates: dict):
        DatabaseService.update_ticket(ticket_id, updates)
        return {"message": "Ticket updated successfully."}

    @staticmethod
    def get_stats():
        return DatabaseService.get_stats()

