export type UserRole = 'admin' | 'tenant';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  phone?: string;
  emergency_contact?: string;
  employer?: string;
  vehicle_info?: string;
  pet_info?: string;
  notes?: string;
  created_at?: string;
}

export interface Unit {
  id: string;
  unit_number: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  sq_ft?: number;
  monthly_rent: number;
  property_name?: string;
  property_type?: string;
  floor?: string;
  parking_spot?: string;
  amenities?: string;
  status?: string;
  notes?: string;
}

export interface Lease {
  id: string;
  unit_id: string;
  tenant_id: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  deposit: number;
  status: 'active' | 'pending' | 'expired' | 'terminated';
  units?: Unit;
}

export interface Ticket {
  id: string;
  tenant_id?: string;
  unit_id?: string;
  title: string;
  description: string;
  category: string;
  severity: number;
  urgency: 'emergency' | 'urgent' | 'routine';
  status: 'new' | 'triaged' | 'dispatched' | 'in_progress' | 'resolved' | 'closed';
  contractor_id?: string;
  ai_rationale?: string;
  ai_summary?: string;
  history_findings?: string;
  action_plan?: string[];
  est_cost?: string;
  evidence?: any[];
  created_at?: string;
  resolved_at?: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string;
  unit_number?: string;
  unit_address?: string;
  units?: Unit;
  contractor_name?: string;
  contractor_trade?: string;
  past_tickets?: Partial<Ticket>[];
}

export interface Contractor {
  id: string;
  name: string;
  trade: string;
  email: string;
  phone: string;
  location: string;
  hourly_rate: number;
  notes?: string;
  created_at?: string;
  total_paid: number;
  past_issues_fixed_count: number;
  past_issues_fixed?: Ticket[];
  payments?: ContractorPayment[];
}

export interface ContractorPayment {
  id: string;
  contractor_id: string;
  ticket_id?: string;
  amount: number;
  paid_on: string;
  status: 'paid' | 'pending' | 'cancelled';
  note?: string;
  created_at?: string;
}

export interface Visit {
  id: string;
  unit_id: string;
  ticket_id?: string;
  contractor_id?: string;
  kind: 'manual' | 'scheduled';
  title: string;
  visit_at: string;
  interval_months?: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at?: string;
  next_occurrence?: string;
  unit_number?: string;
  contractor_name?: string;
  ticket_title?: string;
}

export interface RentPayment {
  id: string;
  lease_id: string;
  due_date: string;
  amount: number;
  paid_on?: string;
  status: 'paid' | 'pending' | 'overdue' | 'waived';
  created_at?: string;
}

export interface NotificationRecord {
  id: string;
  user_id?: string;
  channel: 'sms' | 'whatsapp' | 'email';
  recipient: string;
  subject?: string;
  body: string;
  status: 'simulated' | 'sent' | 'failed';
  ticket_id?: string;
  visit_id?: string;
  created_at?: string;
}

export interface DocumentRecord {
  id: string;
  tenant_id: string;
  lease_id?: string;
  name: string;
  kind: string;
  storage_path: string;
  download_url?: string;
  uploaded_at: string;
}
