import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.app.routers import (
    auth,
    admin_tickets,
    admin_contractors,
    admin_visits,
    admin_tenants,
    admin_settings,
    tenant_portal
)

def create_app() -> FastAPI:
    app = FastAPI(
        title="Real Estate Operations Hub API",
        version="3.0.0",
        description="Unified Property Management & Tenant Portal API with AI Triage, Contractor Management & Automated Visits"
    )

    # CORS configuration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

    # Middleware: Serve SPA index.html for direct browser navigation to HTML pages
    @app.middleware("http")
    async def spa_middleware(request: Request, call_next):
        path = request.url.path
        if request.method == "GET" and not path.startswith("/api") and not path.startswith("/assets"):
            accept = request.headers.get("accept", "")
            # If browser requesting HTML or path doesn't have a file extension
            if "text/html" in accept or ("." not in path.split("/")[-1] and path != "/"):
                index_path = dist_dir / "index.html"
                if index_path.exists():
                    return FileResponse(index_path)
        return await call_next(request)

    # Mount API routers under /api and root
    routers = [
        auth.router,
        admin_tickets.router,
        admin_contractors.router,
        admin_visits.router,
        admin_tenants.router,
        admin_settings.router,
        tenant_portal.router
    ]
    for r in routers:
        app.include_router(r, prefix="/api")
        app.include_router(r)

    @app.get("/api/health")
    async def health():
        return {"status": "online", "version": "3.0.0", "service": "real-estate-operations-hub"}

    # Serve built frontend assets
    if dist_dir.exists() and (dist_dir / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(dist_dir / "assets")), name="assets")

    # Fallback root route
    @app.get("/")
    async def root_index():
        index_path = dist_dir / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        return {"message": "Real Estate Operations Hub API running. Frontend building."}

    return app

app = create_app()
