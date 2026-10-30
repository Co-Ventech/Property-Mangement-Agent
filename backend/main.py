"""
Application Entry Point & Router (MVC Architecture).
Mounts routes, sets up CORS and static file serving, and dispatches to controllers.
"""
import os
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse

from backend.config.settings import UPLOADS_DIR, FRONTEND_DIR
from backend.services.database_service import DatabaseService
from backend.controllers.ticket_controller import TicketController
from backend.controllers.operations_controller import OperationsController
from backend.models.ticket import DispatchRequest

app = FastAPI(
    title="Real Estate Multi-Agent Operations Hub",
    description="Autonomous facilities triage, history cross-referencing, and trade dispatch (MVC Architecture)",
    version="2.5.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(FRONTEND_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
app.mount("/dashboard", StaticFiles(directory=FRONTEND_DIR, html=True), name="static")

# Bootstrap database schema on startup
DatabaseService.init_database()


@app.get("/")
def root_redirect():
    """Redirects base traffic directly to the Operations Dashboard (View)."""
    return RedirectResponse(url="/dashboard/")


# ------------------ OPERATIONS & CONFIGURATION ROUTES ------------------

@app.get("/api/config")
def get_config():
    return OperationsController.get_agent_config()


@app.post("/api/config")
def update_config(data: dict):
    return OperationsController.update_agent_config(data)


@app.post("/api/dispatch")
def send_dispatch(req: DispatchRequest):
    return OperationsController.send_dispatch(req)


# ------------------ TICKET & TRIAGE ROUTES ------------------

@app.post("/api/tickets")
async def create_ticket(
    tenant_name: str = Form(...),
    tenant_email: str = Form(...),
    tenant_phone: str = Form(...),
    flat_number: str = Form(...),
    issue_title: str = Form(...),
    description: str = Form(...),
    evidence: Optional[List[UploadFile]] = File(None)
):
    return await TicketController.create_ticket(
        tenant_name=tenant_name,
        tenant_email=tenant_email,
        tenant_phone=tenant_phone,
        flat_number=flat_number,
        issue_title=issue_title,
        description=description,
        evidence=evidence
    )


@app.get("/api/tickets")
def list_tickets(status: Optional[str] = None, urgency: Optional[str] = None):
    return TicketController.get_all_tickets(status=status, urgency=urgency)


@app.patch("/api/tickets/{ticket_id}")
def update_ticket(ticket_id: str, req: dict):
    return TicketController.update_ticket(ticket_id, req)


@app.get("/api/stats")
def get_stats():
    return TicketController.get_stats()
