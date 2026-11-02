-- ==============================================================================
-- REAL ESTATE OPERATIONS HUB - COMPLETE RELATIONAL SCHEMA
-- Version: 3.0.0
-- Compatible with PostgreSQL 14+ / Supabase
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing old-format tables if any to ensure clean schema
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS rent_payments CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS contractor_payments CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS leases CASCADE;
DROP TABLE IF EXISTS units CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS agent_settings CASCADE;
DROP TABLE IF EXISTS historical_work_orders CASCADE;

-- 1. USERS TABLE (Authentication & Profiles for Admin & Tenants)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'tenant')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. UNITS TABLE (Apartments / Properties)
CREATE TABLE units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_number TEXT UNIQUE NOT NULL,
    address TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 1,
    bathrooms NUMERIC(3,1) NOT NULL DEFAULT 1.0,
    sq_ft INTEGER,
    monthly_rent NUMERIC(10,2) NOT NULL DEFAULT 1500.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. LEASES TABLE (Connects Tenant to Unit)
CREATE TABLE leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent NUMERIC(10,2) NOT NULL,
    deposit NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'expired', 'terminated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. DOCUMENTS TABLE (Lease PDFs, Inspection Reports, Signed URLs)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lease_id UUID REFERENCES leases(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    kind TEXT NOT NULL DEFAULT 'lease' CHECK (kind IN ('lease', 'inspection', 'notice', 'photo', 'other')),
    storage_path TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CONTRACTORS TABLE (Trades Directory: Carpenter, Plumber, Electrician, HVAC, etc.)
CREATE TABLE contractors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    trade TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 85.00,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CONTRACTOR PAYMENTS TABLE (Ledger for Trades)
CREATE TABLE contractor_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    ticket_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending', 'cancelled')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. TICKETS TABLE (Maintenance Requests with AI Triage & History)
CREATE TABLE tickets (
    id TEXT PRIMARY KEY,
    tenant_id UUID REFERENCES users(id) ON DELETE SET NULL,
    unit_id UUID REFERENCES units(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'other',
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    urgency TEXT NOT NULL CHECK (urgency IN ('emergency', 'urgent', 'routine')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'triaged', 'dispatched', 'in_progress', 'resolved', 'closed')),
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    ai_rationale TEXT,
    ai_summary TEXT,
    history_findings TEXT,
    action_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
    est_cost TEXT,
    evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Add foreign key constraint from contractor_payments to tickets if ticket exists
ALTER TABLE contractor_payments 
    ADD CONSTRAINT fk_contractor_payments_ticket 
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE SET NULL;

-- 8. VISITS TABLE (Manual Visits + Scheduled Recurring Visits)
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    ticket_id TEXT REFERENCES tickets(id) ON DELETE SET NULL,
    contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
    kind TEXT NOT NULL CHECK (kind IN ('manual', 'scheduled')),
    title TEXT NOT NULL,
    visit_at TIMESTAMPTZ NOT NULL,
    interval_months INTEGER,
    status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. RENT PAYMENTS TABLE (Tenant Ledger & Due Reminders)
CREATE TABLE rent_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lease_id UUID NOT NULL REFERENCES leases(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    paid_on DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue', 'waived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE (Simulated SMS / WhatsApp / Email Dispatch Log)
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email')),
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'simulated' CHECK (status IN ('simulated', 'sent', 'failed')),
    ticket_id TEXT REFERENCES tickets(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. SETTINGS TABLE (Configurable Agent Prompts & System Settings)
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_units_number ON units(unit_number);
CREATE INDEX idx_leases_tenant ON leases(tenant_id);
CREATE INDEX idx_leases_unit ON leases(unit_id);
CREATE INDEX idx_leases_status ON leases(status);
CREATE INDEX idx_documents_tenant ON documents(tenant_id);
CREATE INDEX idx_contractors_trade ON contractors(trade);
CREATE INDEX idx_contractor_payments_contractor ON contractor_payments(contractor_id);
CREATE INDEX idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX idx_tickets_unit ON tickets(unit_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_urgency ON tickets(urgency);
CREATE INDEX idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX idx_visits_unit ON visits(unit_id);
CREATE INDEX idx_visits_ticket ON visits(ticket_id);
CREATE INDEX idx_visits_contractor ON visits(contractor_id);
CREATE INDEX idx_visits_visit_at ON visits(visit_at);
CREATE INDEX idx_rent_payments_lease ON rent_payments(lease_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_ticket ON notifications(ticket_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractor_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Allow full access for server-side operations (both anon and authenticated / service role)
-- All tenant data boundaries and role permissions are strictly enforced at the FastAPI service layer
CREATE POLICY "full_access_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_units" ON units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_leases" ON leases FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_documents" ON documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_contractors" ON contractors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_contractor_payments" ON contractor_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_visits" ON visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_rent_payments" ON rent_payments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "full_access_settings" ON settings FOR ALL USING (true) WITH CHECK (true);

-- Create documents storage bucket if storage schema exists
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('documents', 'documents', false)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Ignore if storage extension is configured differently
END
$$;

