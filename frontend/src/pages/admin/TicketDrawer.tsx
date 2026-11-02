import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Send, 
  ChevronRight,
  ShieldAlert,
  CalendarClock,
  Sparkles,
  ExternalLink,
  History
} from 'lucide-react';
import { api } from '../../api/client';
import { Ticket, Contractor } from '../../types';
import { UrgencyBadge, StatusBadge, SeverityIndicator } from '../../components/Badge';
import { Modal } from '../../components/Modal';

interface TicketDrawerProps {
  ticketId: string | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const TicketDrawer: React.FC<TicketDrawerProps> = ({ ticketId, onClose, onUpdated }) => {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Manual Visit Modal State
  const [isManualVisitOpen, setIsManualVisitOpen] = useState(false);
  const [manualDate, setManualDate] = useState('');
  const [manualChannels, setManualChannels] = useState<string[]>(['sms', 'whatsapp', 'email']);
  const [manualNotes, setManualNotes] = useState('');
  const [isSubmittingVisit, setIsSubmittingVisit] = useState(false);

  // Scheduled Visit Modal State
  const [isScheduledVisitOpen, setIsScheduledVisitOpen] = useState(false);
  const [scheduledTitle, setScheduledTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledInterval, setScheduledInterval] = useState(2);
  const [scheduledNotes, setScheduledNotes] = useState('');

  // Contractor Book Modal State
  const [isContractorBookOpen, setIsContractorBookOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState('');
  const [contractorBookDate, setContractorBookDate] = useState('');
  const [contractorChannels, setContractorChannels] = useState<string[]>(['sms', 'email']);

  useEffect(() => {
    if (!ticketId) return;

    // Default tomorrow at 10:00 for manual visit
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    setManualDate(tomorrow.toISOString().slice(0, 16));
    setContractorBookDate(tomorrow.toISOString().slice(0, 16));

    const todayStr = new Date().toISOString().slice(0, 16);
    setScheduledDate(todayStr);

    async function fetchDetail() {
      setIsLoading(true);
      try {
        const [t, cList] = await Promise.all([
          api.getTicketDetail(ticketId!),
          api.getContractors()
        ]);
        setTicket(t);
        setContractors(cList);
        setSelectedContractorId(t.contractor_id || (cList[0]?.id || ''));
        setScheduledTitle(`Periodic inspection related to ${t.category.toUpperCase()}`);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ticketId, onClose]);

  if (!ticketId) return null;

  const handleStatusChange = async (newStatus: string) => {
    try {
      await api.updateTicket(ticketId, { status: newStatus as any });
      const refreshed = await api.getTicketDetail(ticketId);
      setTicket(refreshed);
      setActionSuccess(`Status updated to ${newStatus}`);
      onUpdated();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleAssignContractor = async (cId: string) => {
    try {
      await api.updateTicket(ticketId, { contractor_id: cId, status: 'dispatched' });
      const refreshed = await api.getTicketDetail(ticketId);
      setTicket(refreshed);
      setActionSuccess('Contractor assigned and ticket marked dispatched');
      onUpdated();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleCreateManualVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.unit_id) return;
    setIsSubmittingVisit(true);
    try {
      await api.createManualVisit({
        unit_id: ticket.unit_id,
        ticket_id: ticket.id,
        contractor_id: ticket.contractor_id,
        title: `Maintenance visit regarding ${ticket.title}`,
        visit_at: manualDate ? new Date(manualDate).toISOString() : undefined,
        channels: manualChannels,
        notes: manualNotes
      });
      setIsManualVisitOpen(false);
      setActionSuccess('Manual visit scheduled! SMS/WhatsApp/Email notifications dispatched to tenant.');
      onUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const handleCreateScheduledVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.unit_id) return;
    setIsSubmittingVisit(true);
    try {
      await api.createScheduledVisit({
        unit_id: ticket.unit_id,
        ticket_id: ticket.id,
        title: scheduledTitle,
        visit_at: new Date(scheduledDate).toISOString(),
        interval_months: scheduledInterval,
        notes: scheduledNotes
      });
      setIsScheduledVisitOpen(false);
      setActionSuccess(`Recurring visit programmed every ${scheduledInterval} month(s). Visible on resident portal.`);
      onUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const handleBookContractorAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket?.unit_id || !selectedContractorId) return;
    setIsSubmittingVisit(true);
    try {
      await api.bookContractorAppointment({
        contractor_id: selectedContractorId,
        unit_id: ticket.unit_id,
        ticket_id: ticket.id,
        title: ticket.title,
        visit_at: new Date(contractorBookDate).toISOString(),
        channels: contractorChannels,
        notes: `Work order for Unit ${ticket.unit_number}`
      });
      setIsContractorBookOpen(false);
      const refreshed = await api.getTicketDetail(ticketId);
      setTicket(refreshed);
      setActionSuccess('Appointment booked with contractor! SMS/WhatsApp alerts sent to contractor and tenant.');
      onUpdated();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmittingVisit(false);
    }
  };

  const toggleChannel = (ch: string, list: string[], setter: (v: string[]) => void) => {
    if (list.includes(ch)) {
      if (list.length > 1) setter(list.filter(x => x !== ch));
    } else {
      setter([...list, ch]);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
      />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white border-l border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-drawer-entry text-slate-900">
        {/* Drawer Header - Light Theme */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs">
                {ticket?.id || ticketId}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-600 font-mono">
                Unit {ticket?.unit_number || 'N/A'}
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 mt-1 truncate max-w-md">
              {ticket?.title || 'Loading issue details...'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Notifications */}
        {actionSuccess && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {errorMsg && (
          <div className="px-6 py-2.5 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drawer Body */}
        {isLoading || !ticket ? (
          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs font-mono">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-2" />
            Loading ticket specifications...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {/* Top Quick Status Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <div className="flex items-center gap-2.5 flex-wrap">
                <UrgencyBadge urgency={ticket.urgency} />
                <SeverityIndicator severity={ticket.severity} />
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 capitalize">
                  {ticket.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500 font-medium">Status:</label>
                <select
                  value={ticket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs font-semibold py-1.5 px-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="new">New</option>
                  <option value="triaged">Reviewed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Visit & Contractor Dispatch Actions */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Operations Visit & Dispatch Actions</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsManualVisitOpen(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Manual Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsScheduledVisitOpen(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <CalendarClock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Recurring Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsContractorBookOpen(true)}
                  className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-all active:scale-95"
                >
                  <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Book Contractor</span>
                </button>
              </div>
            </div>

            {/* Tenant & Apartment Information Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wider">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Resident & Apartment Coordinates</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  Unit {ticket.unit_number}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Resident Name</span>
                  <span className="font-semibold text-slate-900 text-xs">{ticket.tenant_name || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Phone</span>
                  <span className="font-mono text-slate-900 text-xs">{ticket.tenant_phone || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Email</span>
                  <span className="text-slate-900 text-xs truncate block">{ticket.tenant_email || 'N/A'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Property Address</span>
                  <span className="text-slate-900 text-xs truncate block">{ticket.unit_address || '1024 Capital View Blvd'}</span>
                </div>
              </div>

              {/* Link to Past Tickets for this unit / tenant */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                    Historical Tickets for Unit {ticket.unit_number} ({ticket.past_tickets?.length || 0})
                  </span>
                </div>
                {ticket.past_tickets && ticket.past_tickets.length > 0 ? (
                  <div className="space-y-2">
                    {ticket.past_tickets.map((pt) => (
                      <div
                        key={pt.id}
                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono font-bold text-slate-800 text-[11px]">{pt.id}</span>
                          <span className="text-slate-800 font-medium truncate max-w-xs">{pt.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="capitalize text-[10px] text-slate-500">{pt.category}</span>
                          <StatusBadge status={pt.status || 'resolved'} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No previous tickets on record for this unit.</p>
                )}
              </div>
            </div>

            {/* AI Maintenance Triage Specification Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Automated Assessment & Action Protocol</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-900">
                  Est. {ticket.est_cost || '$150 - $350'}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1.5">Issue Description</span>
                <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {ticket.description}
                </p>
              </div>

              {ticket.ai_rationale && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1.5">Classification Rationale</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {ticket.ai_rationale}
                  </p>
                </div>
              )}

              {ticket.history_findings && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1.5">Historical Cross-Reference</span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                    {ticket.history_findings}
                  </p>
                </div>
              )}

              {ticket.action_plan && ticket.action_plan.length > 0 && (
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1.5">Action Plan Checklist</span>
                  <ul className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {ticket.action_plan.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Assigned Contractor Card */}
            <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs uppercase tracking-wider">
                  <Wrench className="w-4 h-4 text-emerald-600" />
                  <span>Assigned Trade Contractor</span>
                </div>
                {ticket.contractor_name && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {ticket.contractor_trade}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={ticket.contractor_id || ''}
                  onChange={(e) => handleAssignContractor(e.target.value)}
                  className="flex-1 text-xs py-2.5 px-3 border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Select Contractor to Assign --</option>
                  {contractors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.trade}) • ${c.hourly_rate}/hr
                    </option>
                  ))}
                </select>
              </div>

              {ticket.contractor_name && (
                <div className="text-xs text-slate-800 grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Contact / Company</span>
                    <span className="font-semibold text-slate-900">{ticket.contractor_name}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Trade Specialty</span>
                    <span className="font-semibold text-slate-900">{ticket.contractor_trade}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 1. Modal: Schedule Manual Visit */}
      <Modal
        isOpen={isManualVisitOpen}
        onClose={() => setIsManualVisitOpen(false)}
        title="Schedule Manual Maintenance Visit"
      >
        <form onSubmit={handleCreateManualVisit} className="space-y-4 text-xs">
          <p className="text-slate-600 text-xs">
            Schedule an on-site inspection for Unit {ticket?.unit_number}. Defaults to tomorrow morning. 
            Notifications will be sent to the resident across selected channels.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Visit Date & Time</label>
            <input
              type="datetime-local"
              required
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Notify Tenant Via Channels
            </label>
            <div className="flex gap-4">
              {['sms', 'whatsapp', 'email'].map((ch) => (
                <label key={ch} className="inline-flex items-center gap-2 cursor-pointer uppercase font-mono text-slate-700">
                  <input
                    type="checkbox"
                    checked={manualChannels.includes(ch)}
                    onChange={() => toggleChannel(ch, manualChannels, setManualChannels)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Inspection Notes / Instructions</label>
            <textarea
              rows={3}
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="e.g. Master key access authorized. Check under sink and main drain."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsManualVisitOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingVisit}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmittingVisit ? 'Scheduling...' : 'Confirm Manual Visit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 2. Modal: Schedule Recurring Visit */}
      <Modal
        isOpen={isScheduledVisitOpen}
        onClose={() => setIsScheduledVisitOpen(false)}
        title="Schedule Recurring Routine Visit"
      >
        <form onSubmit={handleCreateScheduledVisit} className="space-y-4 text-xs">
          <p className="text-slate-600 text-xs">
            Set up an ongoing inspection cycle (e.g. once every 2 months) for Unit {ticket?.unit_number}. 
            This will be permanently visible to the tenant in their resident portal.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Program Title</label>
            <input
              type="text"
              required
              value={scheduledTitle}
              onChange={(e) => setScheduledTitle(e.target.value)}
              placeholder="e.g. Bi-Monthly HVAC Filter & Coil Inspection"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">First Visit Date</label>
              <input
                type="datetime-local"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Recurrence Interval</label>
              <select
                value={scheduledInterval}
                onChange={(e) => setScheduledInterval(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value={1}>Every 1 Month (Monthly)</option>
                <option value={2}>Every 2 Months (Bi-Monthly)</option>
                <option value={3}>Every 3 Months (Quarterly)</option>
                <option value={6}>Every 6 Months (Semi-Annual)</option>
                <option value={12}>Every 12 Months (Annual)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Notes</label>
            <textarea
              rows={2}
              value={scheduledNotes}
              onChange={(e) => setScheduledNotes(e.target.value)}
              placeholder="Routine maintenance cycle."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduledVisitOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingVisit}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmittingVisit ? 'Scheduling...' : 'Set Recurring Schedule'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. Modal: Book Contractor Appointment */}
      <Modal
        isOpen={isContractorBookOpen}
        onClose={() => setIsContractorBookOpen(false)}
        title="Book Appointment with Contractor"
      >
        <form onSubmit={handleBookContractorAppointment} className="space-y-4 text-xs">
          <p className="text-slate-600 text-xs">
            Dispatch work order for Unit {ticket?.unit_number}. Both the contractor and tenant will receive booking notifications.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Select Contractor</label>
            <select
              value={selectedContractorId}
              onChange={(e) => setSelectedContractorId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.trade}) • ${c.hourly_rate}/hr • {c.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Appointment Date & Time</label>
            <input
              type="datetime-local"
              required
              value={contractorBookDate}
              onChange={(e) => setContractorBookDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Notification Channels
            </label>
            <div className="flex gap-4">
              {['sms', 'whatsapp', 'email'].map((ch) => (
                <label key={ch} className="inline-flex items-center gap-2 cursor-pointer uppercase font-mono text-slate-700">
                  <input
                    type="checkbox"
                    checked={contractorChannels.includes(ch)}
                    onChange={() => toggleChannel(ch, contractorChannels, setContractorChannels)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsContractorBookOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingVisit}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmittingVisit ? 'Dispatching...' : 'Dispatch & Book Appointment'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
