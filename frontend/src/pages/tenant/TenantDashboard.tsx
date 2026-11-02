import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Wrench, 
  CalendarClock, 
  CreditCard, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Sparkles,
  Repeat,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api/client';
import { UrgencyBadge, StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export const TenantDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getTenantDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createTenantTicket({
        title: newTitle,
        description: newDescription
      });
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchDashboard();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
        Connecting to resident portal...
      </div>
    );
  }

  const { tenant, unit, lease, active_tickets_count, recent_tickets, upcoming_visits, next_rent } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-canva flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Resident Services Hub
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Capital View</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
            Welcome home, {tenant.full_name}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-2">
            <span className="font-mono font-bold text-slate-900">Unit {unit?.unit_number || '4B'}</span>
            <span>•</span>
            <span>1024 Capital View Blvd, Austin, TX 78704</span>
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="relative z-10 inline-flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex-shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* KPI Cards Grid - Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Apartment Unit */}
        <div 
          onClick={() => navigate('/tenant/apartment')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">My Apartment</span>
            <Building className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">Unit {unit?.unit_number || '4B'}</div>
            <p className="text-xs text-slate-500 mt-1">
              {unit?.bedrooms || 2} Bed • {unit?.bathrooms || 2} Bath ({unit?.sq_ft || 950} sqft)
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-mono text-[10px] uppercase font-semibold">Lease: Active</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Active Requests */}
        <div 
          onClick={() => navigate('/tenant/tickets')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Active Requests</span>
            <Wrench className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{active_tickets_count}</div>
            <p className="text-xs text-slate-500 mt-1">in progress or dispatched</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>View all requests</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Scheduled Visits */}
        <div 
          onClick={() => navigate('/tenant/visits')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Upcoming Visits</span>
            <CalendarClock className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">{upcoming_visits?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">inspections & visits</p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Inspection calendar</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* Rent Status */}
        <div 
          onClick={() => navigate('/tenant/rent')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Monthly Rent</span>
            <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono">
              ${Number(lease?.monthly_rent || 1850).toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Due: {next_rent?.due_date || '1st of month'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-mono text-[10px] font-semibold">Autopay Active</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>

      {/* Two Columns: Recent Tickets & Upcoming Visits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Recent Maintenance Requests
              </h3>
            </div>
            <button
              onClick={() => navigate('/tenant/tickets')}
              className="text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="p-5 flex-1">
            {!recent_tickets || recent_tickets.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                You have not logged any maintenance requests yet.
              </p>
            ) : (
              <div className="space-y-3">
                {recent_tickets.map((t: any) => (
                  <div
                    key={t.id}
                    onClick={() => navigate('/tenant/tickets')}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-slate-900 text-xs">{t.id}</span>
                      <StatusBadge status={t.status} />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{t.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">{t.ai_summary || t.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scheduled Visits */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Scheduled Apartment Visits
              </h3>
            </div>
            <button
              onClick={() => navigate('/tenant/visits')}
              className="text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
            >
              Full Calendar
            </button>
          </div>

          <div className="p-5 flex-1">
            {!upcoming_visits || upcoming_visits.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No upcoming visits or routine inspections scheduled for your apartment.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming_visits.map((v: any) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/40 flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 text-xs">{v.title}</span>
                        {v.interval_months && (
                          <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-mono flex items-center gap-1 font-semibold">
                            <Repeat className="w-2.5 h-2.5" />
                            <span>Every {v.interval_months} mo.</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {v.notes || 'Routine property assessment and maintenance check.'}
                      </p>
                      <div className="text-[10px] font-mono text-slate-600 mt-2 font-medium">
                        {v.next_occurrence 
                          ? new Date(v.next_occurrence).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                          : new Date(v.visit_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Report Maintenance Issue Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report New Maintenance Issue"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <p className="text-slate-600 text-xs">
            Submit a repair request. Our system will immediately review and assess the issue, evaluate safety severity, cross-reference unit equipment history, and schedule approved trade contractors.
          </p>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Issue Headline / Summary</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Garbage disposal jammed and humming, sink backing up"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Detailed Symptom Description</label>
            <textarea
              required
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Describe what happened, any unusual noises, smells, active leaks, or when the issue began..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? 'Submitting & Triaging...' : 'Submit Maintenance Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
