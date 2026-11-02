from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from backend.app.core.deps import require_admin
from backend.app.repositories.notifications_repo import notifications_repo
from backend.app.repositories.notifications_repo import settings_repo
from backend.app.schemas.notifications import NotificationResponse
from backend.app.schemas.notifications import PromptSettingUpdate

router = APIRouter(prefix="/admin/settings", tags=["admin-settings"], dependencies=[Depends(require_admin)])

@router.get("/notifications", response_model=List[NotificationResponse])
async def list_notifications():
    return notifications_repo.get_all(limit=100)

@router.get("/prompts")
async def get_agent_prompts():
    config = settings_repo.get("agent_prompts")
    if not config:
        # Default agent configuration
        config = {
            "intake_prompt": "Analyze incoming tenant tickets, extract core symptoms, identify required trade and diagnostic gaps.",
            "investigator_prompt": "Examine past work orders for this unit, identify chronic issues and component fatigue.",
            "email_prompt": "Draft authoritative contractor dispatch emails with symptom descriptions and access instructions.",
            "sms_prompt": "Format concise emergency/urgent SMS dispatches with date/time and unit coordinates.",
            "whatsapp_prompt": "Format clear WhatsApp mobile dispatch briefings with bold action steps."
        }
    return config

@router.post("/prompts")
async def update_agent_prompts(req: PromptSettingUpdate):
    updated = settings_repo.set(req.key, req.value)
    return {"status": "success", "settings": updated}

