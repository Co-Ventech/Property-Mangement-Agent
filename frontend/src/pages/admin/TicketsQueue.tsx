import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Eye, 
  CheckCircle,
  Building,
  Wrench,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { Ticket } from '../../types';
import { UrgencyBadge, StatusBadge, SeverityIndicator } from '../../components/Badge';
import { TicketDrawer } from './TicketDrawer';
import { Modal } from '../../components/Modal';

export const TicketsQueue: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // New Ticket Modal State
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newUnitNumber, setNewUnitNumber] = useState('4B');
  const [units, setUnits] = useState<any[]>([]);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const [tList, uList] = await Promise.all([
        api.getTickets(),
        api.getUnits()
      ]);
      setTickets(tList);
      setUnits(uList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    let result = [...tickets];

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (urgencyFilter !== 'all') {
      result = result.filter(t => t.urgency.toLowerCase() === urgencyFilter.toLowerCase());
    }
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.unit_number && t.unit_number.toLowerCase().includes(q)) ||
        (t.tenant_name && t.tenant_name.toLowerCase().includes(q))
      );
    }

    setFilteredTickets(result);
  }, [tickets, categoryFilter, urgencyFilter, statusFilter, searchQuery]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingNew(true);
    try {
      const selectedUnit = units.find(u => u.unit_number === newUnitNumber);
      await api.createTicket({
        title: newTitle,
        description: newDescription,
        unit_id: selectedUnit?.id
      });
      setIsNewTicketOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchTickets();
    } catch (err: any) {
      alert(`Error creating ticket: ${err.message}`);
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Maintenance Review
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Live Work Orders</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Ticket Operations Queue
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTickets}
            title="Refresh Queue"
            className="p-2.5 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Log Maintenance Ticket</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar - Light Theme */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-canva flex flex-wrap items-center gap-3 text-xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, units, residents, keywords..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-sans"
          />
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-slate-700">Filters:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Categories</option>
          <option value="plumbing">Plumbing</option>
          <option value="hvac">HVAC</option>
          <option value="electrical">Electrical</option>
          <option value="carpentry">Carpentry</option>
          <option value="appliance">Appliance</option>
          <option value="roofing">Roofing</option>
          <option value="other">Other</option>
        </select>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Urgencies</option>
          <option value="emergency">Emergency</option>
          <option value="urgent">Urgent</option>
          <option value="routine">Routine</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="triaged">Reviewed</option>
          <option value="dispatched">Dispatched</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        {(categoryFilter !== 'all' || urgencyFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
          <button
            onClick={() => {
              setCategoryFilter('all');
              setUrgencyFilter('all');
              setStatusFilter('all');
              setSearchQuery('');
            }}
            className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Dense High-Contrast Data Table - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-5">Ticket ID</th>
                <th className="py-3.5 px-3">Unit</th>
                <th className="py-3.5 px-3">Resident</th>
                <th className="py-3.5 px-5">Issue Specification</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Urgency</th>
                <th className="py-3.5 px-3">Severity</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Contractor</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-700">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 font-mono">
                    No tickets match current filtering criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200">
                        Unit {t.unit_number || '4B'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-medium text-slate-900 whitespace-nowrap">
                      {t.tenant_name || 'Resident'}
                    </td>
                    <td className="py-3.5 px-5 max-w-sm">
                      <p className="font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {t.ai_summary || t.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 capitalize font-semibold text-slate-700 whitespace-nowrap">
                      {t.category}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <UrgencyBadge urgency={t.urgency} />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <SeverityIndicator severity={t.severity} />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap text-slate-600">
                      {t.contractor_name ? (
                        <span className="font-medium text-slate-900">{t.contractor_name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicketId(t.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-500" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Detail & Triage Drawer */}
      <TicketDrawer
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onUpdated={fetchTickets}
      />

      {/* Modal: Log New Ticket */}
      <Modal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        title="Log New Maintenance Ticket"
      >
        <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Apartment Unit</label>
            <select
              value={newUnitNumber}
              onChange={(e) => setNewUnitNumber(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {units.map((u) => (
                <option key={u.id} value={u.unit_number}>
                  Unit {u.unit_number} - {u.address}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Issue Headline</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Major ceiling leak in bathroom with bubbling drywall"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Detailed Symptom Description</label>
            <textarea
              required
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Provide exact symptoms, whether water is actively running, any electrical exposure, and resident statements..."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsNewTicketOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingNew}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all"
            >
              {isSubmittingNew ? 'Reviewing with CrewAI...' : 'Submit & Trigger Automated Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
