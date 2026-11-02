import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle, 
  RefreshCw,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../api/client';
import { Ticket } from '../../types';
import { UrgencyBadge, StatusBadge, SeverityIndicator } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export const TenantTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getTenantTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
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
      fetchTickets();
    } catch (err: any) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { key: 'new', label: 'Logged' },
    { key: 'triaged', label: 'Reviewed' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'resolved', label: 'Resolved' }
  ];

  const getStepIndex = (status: string) => {
    switch (status) {
      case 'new': return 0;
      case 'triaged': return 1;
      case 'dispatched': return 2;
      case 'in_progress': return 3;
      case 'resolved':
      case 'closed': return 4;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Resident Services
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Maintenance Tracker</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Maintenance & Service Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Track real-time status progression, safety assessment, technician assignments, and repair updates for your apartment.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-3 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex-shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Report New Issue</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
          Loading your maintenance requests...
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 shadow-canva">
          You currently have no active or historical maintenance requests.
        </div>
      ) : (
        <div className="space-y-5">
          {tickets.map((t) => {
            const currentStep = getStepIndex(t.status);

            return (
              <div
                key={t.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-5 hover-card-elevate transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {t.id}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{t.title}</h3>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <UrgencyBadge urgency={t.urgency} />
                    <StatusBadge status={t.status} />
                  </div>
                </div>

                {/* Progress Step Timeline */}
                <div className="py-3 px-2">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-0" />
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 rounded-full transition-all duration-300 -z-0"
                      style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />

                    {steps.map((st, idx) => {
                      const isPassed = idx <= currentStep;
                      const isCurrent = idx === currentStep;

                      return (
                        <div key={st.key} className="flex flex-col items-center relative z-10">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                              isPassed
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-white text-slate-400 border border-slate-300'
                            }`}
                          >
                            {isPassed ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] mt-1.5 font-mono uppercase tracking-wider ${
                              isCurrent ? 'text-slate-900 font-bold' : isPassed ? 'text-slate-700 font-semibold' : 'text-slate-400'
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Description & AI Triage Summary */}
                <div className="text-xs space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <p className="text-slate-800 leading-relaxed">{t.description}</p>
                  {t.ai_summary && (
                    <div className="pt-2.5 border-t border-slate-200 flex items-start gap-2 text-slate-700">
                      <span className="font-mono text-emerald-700 text-[11px] font-bold uppercase">Review Summary:</span>
                      <span className="text-slate-700">{t.ai_summary}</span>
                    </div>
                  )}
                </div>

                {/* Assigned Contractor & Dates Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 pt-1 gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Technician:{' '}
                      <strong className="text-slate-800 font-medium">
                        {t.contractor_name ? `${t.contractor_name} (${t.contractor_trade})` : 'Dispatch Coordination in Progress'}
                      </strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500">
                    <span>Submitted: {t.created_at ? new Date(t.created_at).toLocaleDateString() : 'Recent'}</span>
                    {t.resolved_at && (
                      <span className="text-emerald-700 font-semibold">
                        Resolved: {new Date(t.resolved_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: New Request */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report New Maintenance Issue"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Issue Headline</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Broken water line leaking under sink"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Detailed Description</label>
            <textarea
              rows={4}
              required
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Please explain the problem and the exact location in the apartment."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
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
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
