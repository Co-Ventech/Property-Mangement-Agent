import { User, Ticket, Contractor, ContractorPayment, Visit, NotificationRecord } from '../types';

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('re_ops_token');
}

export function setSession(token: string, user: User) {
  localStorage.setItem('re_ops_token', token);
  localStorage.setItem('re_ops_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('re_ops_token');
  localStorage.removeItem('re_ops_user');
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem('re_ops_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (res.status === 401) {
    clearSession();
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please log in again.');
  }

  if (!res.ok) {
    let errMsg = `Request failed (${res.status})`;
    try {
      const errData = await res.json();
      errMsg = errData.detail || errData.message || errMsg;
    } catch {
      // ignore
    }
    throw new Error(errMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getMe: () => request<User>('/auth/me'),
  changePassword: (data: { old_password: string; new_password: string }) =>
    request<{ status: string; message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Tickets
  getTickets: (params?: { category?: string; severity?: number; urgency?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.append('category', params.category);
    if (params?.severity) q.append('severity', String(params.severity));
    if (params?.urgency) q.append('urgency', params.urgency);
    if (params?.status) q.append('status', params.status);
    return request<Ticket[]>(`/admin/tickets?${q.toString()}`);
  },
  getTicketDetail: (id: string) => request<Ticket>(`/admin/tickets/${id}`),
  updateTicket: (id: string, updates: Partial<Ticket>) =>
    request<Ticket>(`/admin/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    }),
  createTicket: (data: { title: string; description: string; unit_id?: string; evidence_urls?: string[] }) =>
    request<Ticket>('/admin/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Contractors
  getContractors: (trade?: string) => {
    const q = trade && trade !== 'all' ? `?trade=${encodeURIComponent(trade)}` : '';
    return request<Contractor[]>(`/admin/contractors${q}`);
  },
  getContractorDetail: (id: string) => request<Contractor>(`/admin/contractors/${id}`),
  createContractor: (data: Partial<Contractor>) =>
    request<Contractor>('/admin/contractors', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  addContractorPayment: (contractorId: string, data: Partial<ContractorPayment>) =>
    request<ContractorPayment>(`/admin/contractors/${contractorId}/payments`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  bookContractorAppointment: (data: {
    contractor_id: string;
    unit_id: string;
    ticket_id?: string;
    title: string;
    visit_at: string;
    channels: string[];
    notes?: string;
  }) =>
    request<any>('/admin/contractors/book', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Visits
  getVisits: () => request<Visit[]>('/admin/visits'),
  createManualVisit: (data: {
    unit_id: string;
    ticket_id?: string;
    contractor_id?: string;
    title: string;
    visit_at?: string;
    channels: string[];
    notes?: string;
  }) =>
    request<Visit>('/admin/visits/manual', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  createScheduledVisit: (data: {
    unit_id: string;
    ticket_id?: string;
    contractor_id?: string;
    title: string;
    visit_at: string;
    interval_months: number;
    notes?: string;
  }) =>
    request<Visit>('/admin/visits/scheduled', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateVisitStatus: (visitId: string, status: string) =>
    request<Visit>(`/admin/visits/${visitId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  // Admin Tenants & Units
  getTenants: () => request<any[]>('/admin/tenants'),
  createTenant: (data: any) =>
    request<any>('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getUnits: () => request<any[]>('/admin/units'),
  createUnit: (data: any) =>
    request<any>('/admin/units', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Admin Settings & Notifications
  getNotifications: () => request<NotificationRecord[]>('/admin/settings/notifications'),
  getPrompts: () => request<Record<string, string>>('/admin/settings/prompts'),
  updatePrompts: (prompts: Record<string, string>) =>
    request<any>('/admin/settings/prompts', {
      method: 'POST',
      body: JSON.stringify({ key: 'agent_prompts', value: prompts })
    }),

  // Tenant Portal
  getTenantDashboard: () => request<any>('/tenant/dashboard'),
  getTenantTickets: () => request<Ticket[]>('/tenant/tickets'),
  createTenantTicket: (data: { title: string; description: string; evidence_urls?: string[] }) =>
    request<Ticket>('/tenant/tickets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getApartmentDetails: () => request<any>('/tenant/apartment'),
  getTenantVisits: () => request<Visit[]>('/tenant/visits'),
  getTenantRent: () => request<any>('/tenant/rent'),
  getTenantNotifications: () => request<NotificationRecord[]>('/tenant/notifications')
};

