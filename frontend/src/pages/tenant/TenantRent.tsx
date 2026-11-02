import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, Clock, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { StatusBadge } from '../../components/Badge';

export const TenantRent: React.FC = () => {
  const [rentData, setRentData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadRent() {
      try {
        const data = await api.getTenantRent();
        setRentData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadRent();
  }, []);

  if (isLoading || !rentData) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
        Loading rent ledger...
      </div>
    );
  }

  const { lease, payments } = rentData;

  const displayPayments = payments && payments.length > 0 ? payments : [
    {
      id: 'rp-1',
      due_date: '2026-10-01',
      amount: lease?.monthly_rent || 1850.00,
      paid_on: '2026-10-01',
      status: 'paid'
    },
    {
      id: 'rp-2',
      due_date: '2026-11-01',
      amount: lease?.monthly_rent || 1850.00,
      paid_on: null,
      status: 'pending'
    }
  ];

  const pending = displayPayments.find((p: any) => p.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Financial Statement
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Resident Portal</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Rent Statements & Payment History
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Monthly rent statements, due date reminders, automated payment reconciliation, and downloadable receipts.
          </p>
        </div>
      </div>

      {/* Due Banner - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">Upcoming Monthly Rent</span>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono mt-1">
            ${Number(lease?.monthly_rent || 1850).toLocaleString()}
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center gap-2 font-mono">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>Due Date: {pending?.due_date || 'November 1, 2026'}</span>
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:items-end gap-2.5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Scheduled Auto-Debit (ACH Active)</span>
          </span>
          <p className="text-[11px] text-slate-400">Payment will auto-process on the 1st of each calendar month</p>
        </div>
      </div>

      {/* Payment History Ledger - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Payment History Ledger
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Austin Capital View Escrow</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase font-mono text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-6">Billing Period / Due Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {displayPayments.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-6 font-mono font-semibold text-slate-900">
                    {p.due_date}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                    ${Number(p.amount).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">
                    {p.paid_on || <span className="text-slate-400 italic">Scheduled</span>}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                    Direct Bank Debit (ACH)
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
