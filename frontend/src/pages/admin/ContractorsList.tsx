import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  Search,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { Contractor } from '../../types';
import { Modal } from '../../components/Modal';

export const ContractorsList: React.FC = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Contractor Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTrade, setNewTrade] = useState('Plumbing');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('Austin, TX');
  const [newHourlyRate, setNewHourlyRate] = useState(95);
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const loadContractors = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContractors(selectedTrade);
      setContractors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadContractors();
  }, [selectedTrade]);

  const handleAddContractor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createContractor({
        name: newName,
        trade: newTrade,
        email: newEmail,
        phone: newPhone,
        location: newLocation,
        hourly_rate: Number(newHourlyRate),
        notes: newNotes
      });
      setIsAddOpen(false);
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewNotes('');
      loadContractors();
    } catch (err: any) {
      alert(`Error adding contractor: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const tradesList = ['all', 'Plumbing', 'HVAC', 'Electrical', 'Carpentry', 'Appliance', 'Roofing'];

  const filtered = contractors.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.trade.toLowerCase().includes(q) || c.location.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Operations Network
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Austin Service Roster</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Verified Trades Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Contractors with direct dispatch capabilities: Plumbers, Electricians, HVAC, Carpenters, Appliances & Roofers.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs flex-shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Add Approved Contractor</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Trade Filter Pills */}
        <div className="flex flex-wrap gap-2 text-xs">
          {tradesList.map((trade) => {
            const isActive = selectedTrade.toLowerCase() === trade.toLowerCase();
            return (
              <button
                key={trade}
                onClick={() => setSelectedTrade(trade)}
                className={`px-3.5 py-1.5 rounded-xl font-semibold capitalize transition-all text-xs ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {trade}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trades or names..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Contractors Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
          Querying contractor network...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500 shadow-canva">
          No contractors found matching current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 hover-card-elevate flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {c.name}
                    </h3>
                    <span className="inline-block px-2.5 py-0.5 mt-1.5 text-[10px] font-mono font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                      {c.trade}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-slate-900 font-mono">${c.hourly_rate}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">/ hour</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-700 my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-mono">{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{c.location}</span>
                  </div>
                </div>

                {c.notes && (
                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 line-clamp-2">
                    {c.notes}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-2">
                <div className="text-[11px] text-slate-500">
                  <span className="font-bold text-slate-900">{c.past_issues_fixed_count || 0}</span> issues fixed
                  <span className="mx-1.5 text-slate-300">•</span>
                  <span className="font-bold text-slate-900 font-mono">${(c.total_paid || 0).toLocaleString()}</span> paid
                </div>
                <button
                  onClick={() => navigate(`/admin/contractors/${c.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 hover:text-emerald-700 transition-colors group-hover:translate-x-0.5 active:scale-95"
                >
                  <span>Detail & Book</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Contractor Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Approved Trade Contractor"
      >
        <form onSubmit={handleAddContractor} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Company / Contractor Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Austin Elite Plumbing Services"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Trade Specialization</label>
              <select
                value={newTrade}
                onChange={(e) => setNewTrade(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Electrical">Electrical</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Appliance">Appliance</option>
                <option value="Roofing">Roofing</option>
                <option value="General">General Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Standard Hourly Rate ($/hr)</label>
              <input
                type="number"
                required
                min={20}
                value={newHourlyRate}
                onChange={(e) => setNewHourlyRate(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Dispatch Email</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="dispatch@trades.com"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Dispatch Phone (SMS)</label>
              <input
                type="text"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="(512) 555-0199"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Operating Location</label>
            <input
              type="text"
              required
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              placeholder="e.g. Austin, TX - Central & South"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Qualifications / Notes</label>
            <textarea
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="License number, EPA certification, insurance details."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? 'Saving...' : 'Register Contractor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
