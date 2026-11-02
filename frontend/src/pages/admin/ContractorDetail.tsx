import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Wrench, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  CheckCircle, 
  Calendar, 
  Send, 
  Plus, 
  AlertCircle,
  MessageSquare,
  Building,
  Sparkles,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { api } from '../../api/client';
import { Contractor, Unit } from '../../types';
import { StatusBadge, SeverityIndicator } from '../../components/Badge';
import { Modal } from '../../components/Modal';

export const ContractorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Book Appointment State
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookChannels, setBookChannels] = useState<string[]>(['sms', 'whatsapp', 'email']);
  const [bookNotes, setBookNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Add Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(150);
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payNote, setPayNote] = useState('');
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);

  const fetchDetail = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [cData, uData] = await Promise.all([
        api.getContractorDetail(id),
        api.getUnits()
      ]);
      setContractor(cData);
      setUnits(uData);
      if (uData.length > 0) setSelectedUnitId(uData[0].id);
      setBookTitle(`${cData.trade} Service & Inspection Call`);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      setBookDate(tomorrow.toISOString().slice(0, 16));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const toggleChannel = (ch: string) => {
    if (bookChannels.includes(ch)) {
      if (bookChannels.length > 1) setBookChannels(bookChannels.filter(x => x !== ch));
    } else {
      setBookChannels([...bookChannels, ch]);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedUnitId) return;
    setIsBooking(true);
    try {
      await api.bookContractorAppointment({
        contractor_id: id,
        unit_id: selectedUnitId,
        title: bookTitle,
        visit_at: new Date(bookDate).toISOString(),
        channels: bookChannels,
        notes: bookNotes
      });
      setFeedback('Appointment confirmed! SMS, WhatsApp, and Email dispatch notifications sent to both contractor and resident.');
      fetchDetail();
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      alert(`Booking failed: ${err.message}`);
    } finally {
      setIsBooking(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsRecordingPayment(true);
    try {
      await api.addContractorPayment(id, {
        amount: Number(payAmount),
        paid_on: payDate,
        status: 'paid',
        note: payNote
      });
      setIsPaymentModalOpen(false);
      setPayNote('');
      setFeedback('Payment recorded in ledger.');
      fetchDetail();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Failed to record payment: ${err.message}`);
    } finally {
      setIsRecordingPayment(false);
    }
  };

  if (isLoading || !contractor) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-500">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
        Loading contractor profile & ledger...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button & Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/contractors')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">{contractor.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                {contractor.trade}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{contractor.location} • Approved Network Vendor</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs active:scale-95"
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Profile Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1">
            Standard Rate
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">${contractor.hourly_rate}</span>
            <span className="text-xs text-slate-500 font-mono">/ hour</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1">Pre-negotiated portfolio rate</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1">
            Resolved Issues
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">{contractor.past_issues_fixed_count || 0}</span>
            <span className="text-xs text-slate-500">work orders</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono block mt-1 font-semibold">100% sign-off completion</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1">
            Total Paid to Date
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">${(contractor.total_paid || 0).toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-mono">USD</span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 font-mono">{contractor.payments?.length || 0} disbursements</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-canva hover-card-elevate">
          <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider block mb-1">
            Primary Dispatch Info
          </span>
          <div className="text-xs font-mono text-slate-900 font-medium">{contractor.phone}</div>
          <div className="text-xs text-slate-500 truncate">{contractor.email}</div>
          <span className="text-[10px] text-slate-400 block mt-1">{contractor.location}</span>
        </div>
      </div>

      {/* Appointment Booking & SMS/WhatsApp/Email Dispatch Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-sans">
              Book Appointment & Multi-Channel Dispatch Notice
            </h3>
            <p className="text-xs text-slate-500">
              Dispatches work order to {contractor.name} and automatically coordinates access with the resident
            </p>
          </div>
        </div>

        <form onSubmit={handleBookAppointment} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Select Unit / Property</label>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    Unit {u.unit_number} - {u.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Appointment Date & Time</label>
              <input
                type="datetime-local"
                required
                value={bookDate}
                onChange={(e) => setBookDate(e.target.value)}
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Appointment Purpose / Title</label>
              <input
                type="text"
                required
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. Annual HVAC tune-up and filter check"
                className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-2">
              Dispatch Channels (Sends to Contractor & Resident)
            </label>
            <div className="flex items-center gap-6">
              {['sms', 'whatsapp', 'email'].map((ch) => (
                <label key={ch} className="inline-flex items-center gap-2 cursor-pointer font-mono font-medium uppercase text-slate-700">
                  <input
                    type="checkbox"
                    checked={bookChannels.includes(ch)}
                    onChange={() => toggleChannel(ch)}
                    className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>{ch}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Access Notes / Scope Details</label>
            <input
              type="text"
              value={bookNotes}
              onChange={(e) => setBookNotes(e.target.value)}
              placeholder="e.g. Lockbox code #4192. Resident working from home."
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isBooking}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xs disabled:opacity-50 active:scale-95"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>{isBooking ? 'Dispatching...' : 'Dispatch Work Order & Book'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Two Columns: Past Issues Fixed & Payments Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past Issues Fixed */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Past Issues Resolved ({contractor.past_issues_fixed?.length || 0})
              </h3>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {!contractor.past_issues_fixed || contractor.past_issues_fixed.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No past resolved tickets associated with this contractor yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {contractor.past_issues_fixed.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs hover:bg-slate-100/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900">{t.id}</span>
                        <span className="px-2 py-0.5 rounded-md bg-white font-mono text-[10px] font-semibold text-slate-700 border border-slate-200">
                          Unit {t.unit_number || t.units?.unit_number || '4B'}
                        </span>
                        <span className="capitalize text-[11px] text-slate-500 font-medium">
                          {t.category}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 truncate max-w-sm">{t.title}</p>
                    </div>

                    <div className="text-right flex-shrink-0 ml-3">
                      <SeverityIndicator severity={t.severity} />
                      <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                        {t.resolved_at ? new Date(t.resolved_at).toLocaleDateString() : 'Resolved'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payments Ledger */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-slate-700" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
                Disbursements Ledger ({contractor.payments?.length || 0})
              </h3>
            </div>
            <span className="font-mono font-bold text-xs text-slate-900">
              Total: ${(contractor.total_paid || 0).toLocaleString()}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            {!contractor.payments || contractor.payments.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-8">
                No payments recorded yet. Click "Record Payment" to log.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 text-[10px] text-slate-500 uppercase font-mono">
                  <tr>
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Amount</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5">Memo / Work Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contractor.payments.map((p) => (
                    <tr key={p.id}>
                      <td className="py-2.5 font-mono text-slate-600">{p.paid_on}</td>
                      <td className="py-2.5 font-mono font-bold text-slate-900">${Number(p.amount).toFixed(2)}</td>
                      <td className="py-2.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-2.5 text-slate-700 truncate max-w-xs">{p.note || 'Service payment'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Record Payment to ${contractor.name}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Amount Paid ($ USD)</label>
            <input
              type="number"
              required
              step="0.01"
              min={1}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Payment Date</label>
            <input
              type="date"
              required
              value={payDate}
              onChange={(e) => setPayDate(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-mono bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Description / Invoice / Check #</label>
            <input
              type="text"
              required
              value={payNote}
              onChange={(e) => setPayNote(e.target.value)}
              placeholder="e.g. Check #1042 for capacitor replacement in Unit 4B"
              className="w-full border border-slate-300 rounded-xl p-2.5 text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRecordingPayment}
              className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              {isRecordingPayment ? 'Recording...' : 'Save to Payment Ledger'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
