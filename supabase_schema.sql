-- SUPABASE POSTGRESQL SCHEMA & SEED DATA
-- Real Estate AI Maintenance Operations Hub
-- Version: 2.5.0 (Updated with realistic modern costs and Austin, TX area codes)

-- 1. TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    tenant_name TEXT NOT NULL,
    tenant_email TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    flat_number TEXT NOT NULL,
    issue_title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_files JSONB DEFAULT '[]'::jsonb,
    urgency TEXT NOT NULL CHECK (urgency IN ('emergency', 'urgent', 'routine')),
    severity INTEGER NOT NULL CHECK (severity BETWEEN 1 AND 5),
    category TEXT NOT NULL,
    safety_alert TEXT,
    ai_summary TEXT,
    action_plan JSONB DEFAULT '[]'::jsonb,
    estimated_cost TEXT,
    contractor_dispatch_draft JSONB,
    history_findings TEXT,
    missing_info JSONB DEFAULT '[]'::jsonb,
    ai_rating_rationale TEXT,
    status TEXT NOT NULL DEFAULT 'triaged' CHECK (status IN ('triaged', 'dispatched', 'resolved', 'new')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HISTORICAL WORK ORDERS TABLE
CREATE TABLE IF NOT EXISTS historical_work_orders (
    id TEXT PRIMARY KEY,
    flat_number TEXT NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL,
    issue TEXT NOT NULL,
    contractor TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    cost TEXT NOT NULL,
    outcome TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGENT CONFIGURATION & SETTINGS TABLE
CREATE TABLE IF NOT EXISTS agent_settings (
    key TEXT PRIMARY KEY,
    prompt_text TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_tickets_flat ON tickets(flat_number);
CREATE INDEX IF NOT EXISTS idx_tickets_urgency ON tickets(urgency);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_historical_flat ON historical_work_orders(flat_number);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'tickets' AND policyname = 'Allow all access to tickets'
    ) THEN
        CREATE POLICY "Allow all access to tickets" ON tickets FOR ALL USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'historical_work_orders' AND policyname = 'Allow all access to historical_work_orders'
    ) THEN
        CREATE POLICY "Allow all access to historical_work_orders" ON historical_work_orders FOR ALL USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- 6. SEED HISTORICAL WORK ORDERS (Used by Agent 2: History Investigator)
INSERT INTO historical_work_orders (id, flat_number, date, category, issue, contractor, action_taken, cost, outcome)
VALUES
    ('WO-HIST-101', '4B', '2026-06-12', 'hvac', 'Air conditioning unit blowing lukewarm air', 'Apex Mechanical Specialists', 'Recharged refrigerant R-410A and tightened loose compressor service valve', '$240', 'Resolved temporarily. Technician noted unit is over 7 years old.'),
    ('WO-HIST-102', '4B', '2026-08-20', 'hvac', 'Air conditioning AC stopped cooling again and humming loudly', 'Apex Mechanical Specialists', 'Replaced 45/5 MFD dual run capacitor and flushed condensate line', '$210', 'Unit functioning, but compressor motor shows persistent intermittent electrical strain.'),
    ('WO-HIST-103', '4B', '2026-03-05', 'plumbing', 'Kitchen sink faucet slow drip', 'Vanguard Plumbing Co.', 'Replaced internal ceramic disc cartridge and aerator mesh', '$115', 'Fully resolved, zero leak detected on pressure test.'),
    ('WO-HIST-104', '12A', '2026-05-14', 'electrical', 'Circuit breaker tripping when kitchen appliances run simultaneously', 'MetroPoint Electric', 'Installed 20A dedicated kitchen branch circuit breaker and load-balanced panel', '$320', 'Circuit balanced and tested. Operating under standard amp draw.'),
    ('WO-HIST-105', '7C', '2026-07-22', 'plumbing', 'Bathroom ceiling damp stain', 'Vanguard Plumbing Co.', 'Resealed upper unit 8C bathtub perimeter flange and applied antimicrobial stain barrier', '$165', 'Moisture dried out, painted with stain blocker. Recommended monitoring upper waste line.')
ON CONFLICT (id) DO UPDATE SET
    issue = EXCLUDED.issue,
    action_taken = EXCLUDED.action_taken,
    outcome = EXCLUDED.outcome;

-- 7. SEED MULTI-URGENCY TICKETS WITH AI RATIONALES
INSERT INTO tickets (
    id, tenant_name, tenant_email, tenant_phone, flat_number,
    issue_title, description, evidence_files, urgency, severity,
    category, safety_alert, ai_summary, action_plan, estimated_cost,
    contractor_dispatch_draft, history_findings, missing_info, ai_rating_rationale, status, created_at
) VALUES
(
    'TICK-EMRG01',
    'Sarah Jenkins',
    'sarah.j@residence.com',
    '+1 (512) 492-1084',
    '12A',
    'Severe gas leak smell near oven and water heater',
    'Strong natural gas smell filling corridor and kitchen. Stove was off, suspect line leak. Occupants feeling dizzy.',
    '[]'::jsonb,
    'emergency',
    5,
    'hvac',
    'gas leak',
    'CRITICAL LIFE SAFETY INCIDENT. Immediate risk of gas explosion and asphyxiation. Deterministic safety rule triggered with priority override.',
    '["Evacuate occupants and open windows if safe", "Shut off main building gas valve at junction B", "Dispatch emergency utility line technician immediately"]'::jsonb,
    '$450 - $850 (Emergency Utility Dispatch & Certification)',
    '{"email": "Subject: EMERGENCY WORK ORDER: Gas Leak - Unit 12A\n\nAttn: Emergency Dispatch Team,\nImmediate response required for Unit 12A. Combustible natural gas odor confirmed. Target arrival SLA: < 30 minutes.", "sms": "[CRITICAL EMERGENCY] Gas leak at Unit 12A. Evacuation active. Respond immediately with utility shut-off gear.", "whatsapp": "*EMERGENCY DISPATCH*\n*Unit:* 12A\n*Issue:* Natural gas odor detected.\n*Action:* Immediate emergency trade response required (SLA: < 30 min)."}'::jsonb,
    'Unit 12A had electrical breaker upgrades in May 2026 ($320). No prior gas line issues reported on record.',
    '["Building gas meter reading"]'::jsonb,
    'Classified as EMERGENCY (Severity 5/5) because combustible gas exposure presents immediate danger to life, safety, and property integrity. Mandates immediate priority escalation over standard ticketing.',
    'triaged',
    '2026-10-29T10:15:00Z'
),
(
    'TICK-URG002',
    'Marcus Vance',
    'm.vance@urbanliving.com',
    '+1 (512) 782-9910',
    '4B',
    'AC stopped cooling again and compressor making loud grinding noise',
    'Living room HVAC unit is blowing warm humid air. Third time this season. Grinding sound coming from outside condenser.',
    '[]'::jsonb,
    'urgent',
    3,
    'hvac',
    NULL,
    'Chronic equipment failure. Unit 4B HVAC has suffered 2 previous failures this summer (refrigerant leak in June, capacitor replacement in August). Compressor motor is seizing.',
    '["Perform electrical load test on run capacitor and winding resistance", "Verify condenser fan bearings and R-410A system pressure", "Initiate OEM compressor warranty replacement instead of repeat patch"]'::jsonb,
    '$350 - $650 (Labor & diagnostic; compressor under OEM warranty)',
    '{"email": "Subject: Work Order: HVAC Chronic Recurrence - Unit 4B\n\nDear Apex Mechanical,\nUnit 4B AC has failed again. Please review technician logs from June ($240) and August ($210). Unit is experiencing recurrent compressor seizure.", "sms": "[URGENT] Unit 4B AC down again (compressor grinding). Please review prior summer logs and confirm technician ETA.", "whatsapp": "*WORK ORDER DISPATCH*\n*Unit:* 4B\n*Equipment:* HVAC\n*Note:* Repeat breakdown. Prior repairs failed to resolve compressor strain. Target SLA: < 24 hrs."}'::jsonb,
    'History Investigator: Unit 4B had repairs on 2026-06-12 ($240) and 2026-08-20 ($210). Recurring compressor electrical strain noted by technician. Potential $450 in redundant patch spend avoided by requesting OEM warranty replacement.',
    '["Thermostat error code"]'::jsonb,
    'Assigned URGENT priority (Severity 3/5) due to repeated failure history and loss of essential climate control. Not an immediate safety hazard, but technician notes indicate chronic compressor wear requiring prompt intervention before total burnout.',
    'triaged',
    '2026-10-29T11:45:00Z'
),
(
    'TICK-URG003',
    'Elena Rostova',
    'elena.rostova@techcorp.io',
    '+1 (512) 301-4477',
    '7C',
    'Water leaking through bathroom ceiling drywall from upstairs',
    'Active dripping from ceiling seam above bathtub. Drywall is soft and blistering. Bucket catching 1 cup per hour.',
    '[]'::jsonb,
    'urgent',
    4,
    'plumbing',
    NULL,
    'Active plumbing ingress from upper unit 8C. Risk of drywall collapse and mold progression if not contained within 24 hours.',
    '["Inspect Unit 8C bathroom floor seal, tub flange, and waste line", "Relieve drywall hydrostatic pressure to prevent ceiling collapse", "Deploy commercial dehumidifier and monitor moisture levels"]'::jsonb,
    '$380 - $720 (Trap repair & commercial drying)',
    '{"email": "Subject: Urgent Work Order: Ceiling Water Leak - Unit 7C\n\nDear Vanguard Plumbing,\nActive water dripping from ceiling in Unit 7C originating from Unit 8C bathroom floor. Immediate inspection required.", "sms": "[URGENT PLUMBING] Unit 7C active ceiling drip from 8C. Required dispatch within 2 hours.", "whatsapp": "*URGENT DISPATCH*\n*Unit:* 7C / 8C\n*Issue:* Water penetration through drywall.\n*Action:* Trace supply/drain leak in upper unit immediately."}'::jsonb,
    'Unit 7C had bathroom damp stain treated on 2026-07-22 ($165). Prior silicone caulking in 8C appears to have degraded or a secondary waste pipe joint has failed.',
    '["Unit 8C resident availability window"]'::jsonb,
    'Rated URGENT with high Severity 4/5 because active water penetration causes progressive structural damage to drywall and electrical fixtures beneath, escalating repair costs rapidly if not mitigated within hours.',
    'triaged',
    '2026-10-29T13:20:00Z'
),
(
    'TICK-ROUT04',
    'David Kim',
    'dkim88@consulting.org',
    '+1 (512) 912-3341',
    '3A',
    'Kitchen cabinet hinge loose and dishwasher rack wheel stuck',
    'Upper cupboard door sags when opening. Bottom rack of dishwasher misses one roller wheel causing it to slide unevenly.',
    '[]'::jsonb,
    'routine',
    1,
    'appliance',
    NULL,
    'Cosmetic carpentry adjustment and standard dishwasher accessory replacement. Zero functional safety hazard.',
    '["Re-align cabinet Euro hinge screws with wood dowel reinforcement", "Order OEM replacement roller wheel kit for dishwasher rack", "Batch visit during weekly routine maintenance route"]'::jsonb,
    '$75 - $130 (Standard batch route visit)',
    '{"email": "Subject: Routine Maintenance: Cabinet & Dishwasher - Unit 3A\n\nPlease schedule during next available standard maintenance route window.", "sms": "[ROUTINE] Unit 3A cabinet hinge & rack roller. Schedule next open window.", "whatsapp": "*ROUTINE WORK ORDER*\n*Unit:* 3A\n*Items:* Cupboard hinge + dishwasher wheel\n*Schedule:* Non-urgent batch route visit."}'::jsonb,
    'No prior work orders logged for Unit 3A.',
    '["Dishwasher model number plate"]'::jsonb,
    'Assigned ROUTINE priority and Severity 1/5 because the reported defects are cosmetic and minor hardware wear. There is no risk to habitability, safety, or structural durability, permitting batched scheduling.',
    'triaged',
    '2026-10-29T14:05:00Z'
),
(
    'TICK-ROUT05',
    'Chloe Bennett',
    'chloe.b@designstudio.co',
    '+1 (512) 223-9081',
    '9F',
    'Window draft seal whistling during high winds',
    'Bedroom double-glazed window weather-stripping is worn out on lower sash edge, whistling when windy outside.',
    '[]'::jsonb,
    'routine',
    2,
    'structural',
    NULL,
    'Acoustic comfort concern caused by degraded rubber weather-stripping on window perimeter. Window lock and latching mechanism intact.',
    '["Inspect sash alignment and silicone rubber perimeter seals", "Replace EPDM weather-seal strip on bottom track", "Calibrate window lock latch tension"]'::jsonb,
    '$90 - $160 (Perimeter EPDM weatherstrip replacement)',
    '{"email": "Subject: Routine Maintenance: Window Seal - Unit 9F\n\nNon-urgent weather-stripping replacement requested for Unit 9F. Please attend during scheduled route.", "sms": "[ROUTINE] Unit 9F window seal replacement. Please schedule during weekly route.", "whatsapp": "*ROUTINE DISPATCH*\n*Unit:* 9F\n*Task:* Window weather-seal replacement."}'::jsonb,
    'No prior window or structural tickets recorded for Unit 9F.',
    '[]'::jsonb,
    'Classified as ROUTINE with Severity 2/5. The issue impacts acoustic comfort but glass and locking hardware are secure, meaning habitability standards are satisfied while scheduling at routine convenience.',
    'triaged',
    '2026-10-29T14:40:00Z'
)
ON CONFLICT (id) DO UPDATE SET
    issue_title = EXCLUDED.issue_title,
    description = EXCLUDED.description,
    urgency = EXCLUDED.urgency,
    severity = EXCLUDED.severity,
    ai_summary = EXCLUDED.ai_summary,
    ai_rating_rationale = EXCLUDED.ai_rating_rationale,
    history_findings = EXCLUDED.history_findings,
    contractor_dispatch_draft = EXCLUDED.contractor_dispatch_draft;
