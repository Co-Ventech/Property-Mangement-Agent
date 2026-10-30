"""
Controller Layer (C in MVC): Operations & Dispatch Controller.
Manages prompt configuration updates and outbound contractor work order dispatches.
"""
from datetime import datetime
from backend.models.ticket import DispatchRequest
from backend.services.agent_config_service import AgentConfigService


class OperationsController:
    @staticmethod
    def get_agent_config():
        return AgentConfigService.load_config()

    @staticmethod
    def update_agent_config(data: dict):
        AgentConfigService.save_config(data)
        return {"message": "Agent system prompts and settings updated successfully."}

    @staticmethod
    def send_dispatch(req: DispatchRequest):
        print(f"[Dispatch] Outbound {req.channel.upper()} dispatched for ticket {req.ticket_id} to {req.recipient}")
        return {
            "success": True,
            "channel": req.channel,
            "recipient": req.recipient,
            "timestamp": datetime.utcnow().isoformat(),
            "message": f"Successfully triggered {req.channel.upper()} dispatch to {req.recipient}."
        }

