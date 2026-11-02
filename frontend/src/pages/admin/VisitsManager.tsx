import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Plus, 
  Calendar, 
  Building, 
  Wrench, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  Repeat,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { Visit, Unit, Contractor } from '../../types';
import { StatusBadge } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export const VisitsManager: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Manual Visit Modal
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [manualUnitId, setManualUnitId] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDate, setManualDate] = useState('');
  const [manualChannels, setManualChannels] = useState<string[]>(['sms', 'whatsapp', 'email']);
  const [manualNotes, setManualNotes] = useState('');

  // Scheduled Recurring Visit Modal
  const [isScheduledOpen, setIsScheduledOpen] = useState(false);
  const [schedUnitId, setSchedUnitId] = useState('');
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedInterval, setSchedInterval] = useState(2);
  const [schedNotes, setSchedNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vList, uList, cList] = await Promise.all([
        api.getVisits(),
        api.getUnits(),
        api.getContractors()
      ]);
      setVisits(vList);
      setUnits(uList);
      setContractors(cList);
      if (uList.length > 0) {
        setManualUnitId(uList[0].id);
        setSchedUnitId(uList[0].id);
      }
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setManualDate(tomorrow.toISOString().slice(0, 16));
      setSchedDate(new Date().toISOString().slice(0, 16));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createManualVisit({
        unit_id: manualUnitId,
        title: manualTitle,
        visit_at: new Date(manualDate).toISOString(),
        channels: manualChannels,
        notes: manualNotes
      });
      setIsManualOpen(false);
      setManualTitle('');
      setManualNotes('');
      loadData();
    } catch (err: any) {
      alert(`Failed to create manual visit: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateScheduled = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createScheduledVisit({
        unit_id: schedUnitId,
        title: schedTitle,
        visit_at: new Date(schedDate).toISOString(),
        interval_months: schedInterval,
        notes: schedNotes
      });
      setIsScheduledOpen(false);
      setSchedTitle('');
      setSchedNotes('');
      loadData();
    } catch (err: any) {
      alert(`Failed to create scheduled visit: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (visitId: string, status: string) => {
    try {
      await api.updateVisitStatus(visitId, status);
      loadData();
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  };

  const toggleChannel = (ch: string) => {
    if (manualChannels.includes(ch)) {
      if (manualChannels.length > 1) setManualChannels(manualChannels.filter(x => x !== ch));
    } else {
      setManualChannels([...manualChannels, ch]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Operations Logistics
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Austin Portfolio</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Visits & Property Inspections
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Coordinate manual issue visits and automated recurring routine inspections (e.g. every 2 months) with resident portal sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManualOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs active:scale-95"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Manual Visit</span>
          </button>
          <button
            onClick={() => setIsScheduledOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs active:scale-95"
          >
            <Repeat className="w-4 h-4 text-purple-600" />
            <span>Recurring Visit</span>
          </button>
        </div>
      </div>

      {/* Visits Table - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-mono text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-4">Visit Purpose</th>
                <th className="py-3.5 px-3">Unit</th>
                <th className="py-3.5 px-3">Type</th>
                <th className="py-3.5 px-3">Assigned Staff / Trade</th>
                <th className="py-3.5 px-3">Scheduled / Next Visit</th>
                <th className="py-3.5 px-3">Cadence</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 font-mono">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-2" />
                    Querying visit calendar...
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No scheduled visits recorded.
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 text-xs">{v.title}</p>
                      {v.notes && <p className="text-[11px] text-slate-500 truncate mt-0.5">{v.notes}</p>}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-mono font-bold text-xs text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                        Unit {v.unit_number || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      {v.kind === 'scheduled' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <Repeat className="w-3 h-3 text-purple-600" />
                          <span>Recurring</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          <span>Manual</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">
                      {v.contractor_name ? (
                        <span className="font-medium text-slate-900">{v.contractor_name}</span>
                      ) : (
                        <span className="text-slate-400 italic">Operations Staff</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-900 whitespace-nowrap font-medium">
                      {v.next_occurrence 
                        ? new Date(v.next_occurrence).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) 
                        : new Date(v.visit_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                      {v.interval_months ? `Every ${v.interval_months} mo.` : 'One-time'}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {v.status === 'confirmed' ? (
                        <button
                          onClick={() => handleStatusChange(v.id, 'completed')}
                          className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 border border-emerald-200 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors active:scale-95"
                        >
                          Mark Completed
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">Archived</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: New Manual Visit */}
      <Modal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        title="Schedule Manual Visit"
      >
        <form onSubmit={handleCreateManual} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Target Apartment Unit</label>
            <select
              value={manualUnitId}
              onChange={(e) => setManualUnitId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>Unit {u.unit_number} - {u.address}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Visit Title</label>
            <input
              type="text"
              required
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g. Master bathroom plumbing inspection"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={manualDate}
              onChange={(e) => setManualDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Notify Resident</label>
            <div className="flex gap-4">
              {['sms', 'whatsapp', 'email'].map((ch) => (
                <label key={ch} className="inline-flex items-center gap-2 uppercase cursor-pointer font-mono text-slate-700">
                  <input
                    type="checkbox"
                    checked={manualChannels.includes(ch)}
                    onChange={() => toggleChannel(ch)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Staff Notes</label>
            <textarea
              rows={2}
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              placeholder="Access instructions or key location."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsManualOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? 'Scheduling...' : 'Confirm Manual Visit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: New Recurring Visit */}
      <Modal
        isOpen={isScheduledOpen}
        onClose={() => setIsScheduledOpen(false)}
        title="Program Routine Recurring Visit"
      >
        <form onSubmit={handleCreateScheduled} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Target Apartment Unit</label>
            <select
              value={schedUnitId}
              onChange={(e) => setSchedUnitId(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>Unit {u.unit_number} - {u.address}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Program Inspection Title</label>
            <input
              type="text"
              required
              value={schedTitle}
              onChange={(e) => setSchedTitle(e.target.value)}
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
                value={schedDate}
                onChange={(e) => setSchedDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Recurrence Interval</label>
              <select
                value={schedInterval}
                onChange={(e) => setSchedInterval(Number(e.target.value))}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value={1}>Every 1 Month</option>
                <option value={2}>Every 2 Months (Bi-Monthly)</option>
                <option value={3}>Every 3 Months (Quarterly)</option>
                <option value={6}>Every 6 Months</option>
                <option value={12}>Every 12 Months (Annual)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Cycle Notes</label>
            <textarea
              rows={2}
              value={schedNotes}
              onChange={(e) => setSchedNotes(e.target.value)}
              placeholder="Check HVAC, smoke detectors, water lines."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduledOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isSubmitting ? 'Programming...' : 'Save Routine Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
