import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  AlertTriangle, 
  Wrench, 
  CalendarClock, 
  TrendingUp, 
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  Building2,
  DollarSign,
  UserPlus,
  Plus
} from 'lucide-react';
import { api } from '../../api/client';
import { Ticket, Contractor, Visit } from '../../types';
import { UrgencyBadge, StatusBadge, SeverityIndicator } from '../../components/Badge';

export const AdminOverview: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [tData, cData, vData] = await Promise.all([
          api.getTickets(),
          api.getContractors(),
          api.getVisits()
        ]);
        setTickets(tData);
        setContractors(cData);
        setVisits(vData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-500">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3"></div>
        Synthesizing portfolio metrics...
      </div>
    );
  }

  const emergencyCount = tickets.filter(t => t.urgency === 'emergency' && t.status !== 'resolved').length;
  const urgentCount = tickets.filter(t => t.urgency === 'urgent' && t.status !== 'resolved').length;
  const activeCount = tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length;
  const upcomingVisitsCount = visits.filter(v => v.status === 'confirmed').length;
  const totalPaid = contractors.reduce((acc, c) => acc + (c.total_paid || 0), 0);

  return (
    <div className="space-y-8">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Operations Center
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Austin Portfolio</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Command Center Overview
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => navigate('/admin/tickets')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs active:scale-[0.97]"
          >
            <Inbox className="w-4 h-4 text-emerald-400" />
            <span>Ticket Queue</span>
          </button>
          <button
            onClick={() => navigate('/admin/contractors')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs active:scale-[0.97]"
          >
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span>Trades</span>
          </button>
          <button
            onClick={() => navigate('/admin/tenants')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs active:scale-[0.97]"
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>+ Add Property</span>
          </button>
          <button
            onClick={() => navigate('/admin/tenants')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-xs active:scale-[0.97]"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>+ Onboard Resident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Light Theme */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Active Tickets */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-canva flex flex-col justify-between hover-card-elevate group">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
                Active Work Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Inbox className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {activeCount}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Pending contractor action
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="text-emerald-700 font-semibold flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolved: {tickets.filter(t => t.status === 'resolved').length}
            </span>
            <span className="font-mono text-slate-400">98.4% uptime</span>
          </div>
        </div>

        {/* Emergency & Urgent */}
        <div className="bg-white p-6 rounded-2xl border border-rose-200 shadow-canva flex flex-col justify-between hover-card-elevate group">
          <div>
            <div className="flex items-center justify-between text-rose-500 mb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-rose-600">
                Emergency & Urgent
              </span>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-rose-600 font-mono tracking-tight">
              {emergencyCount + urgentCount}
            </div>
            <p className="text-xs text-rose-700 mt-1 font-medium">
              {emergencyCount} Emergency • {urgentCount} Urgent
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-between text-[11px] text-rose-600 font-mono">
            <span>Safety Shield Alert Triggered</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
        </div>

        {/* Licensed Contractors */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-canva flex flex-col justify-between hover-card-elevate group">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
                Licensed Trades
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {contractors.length}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Plumbing, HVAC, Electrical, Carpentry
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-mono text-emerald-700 font-bold">
              Disbursed: ${totalPaid.toLocaleString()}
            </span>
            <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Upcoming Routine Visits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-canva flex flex-col justify-between hover-card-elevate group">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500">
                Scheduled Visits
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-purple-700 font-mono tracking-tight">
              {visits.length}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Manual visits & recurring cycles
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Every 2 months & annual checks</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Priority Work Order Queue & Recent Triage Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Priority Work Order Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated review categorization, severity scoring & past unit history
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/tickets')}
            className="text-xs font-bold text-slate-800 hover:text-emerald-700 transition-colors"
          >
            View Complete Queue ({tickets.length})
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {tickets.slice(0, 5).map((t) => (
            <div
              key={t.id}
              onClick={() => navigate('/admin/tickets')}
              className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                    {t.id}
                  </span>
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Unit {t.unit_number || '4B'}
                  </span>
                  <span className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {t.title}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-1 max-w-3xl">
                  {t.ai_summary || t.description}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <UrgencyBadge urgency={t.urgency} />
                <SeverityIndicator severity={t.severity} />
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
