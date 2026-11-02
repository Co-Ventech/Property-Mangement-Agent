import React, { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  Calendar, 
  Repeat, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { Visit } from '../../types';
import { StatusBadge } from '../../components/Badge';

export const TenantVisits: React.FC = () => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadVisits() {
      try {
        const data = await api.getTenantVisits();
        setVisits(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadVisits();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
        Loading visit schedules...
      </div>
    );
  }

  const manualVisits = visits.filter(v => v.kind === 'manual');
  const recurringVisits = visits.filter(v => v.kind === 'scheduled');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Apartment Access
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Resident Calendar</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Apartment Visits & Routine Inspections
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Confirmed property management visits, contractor appointments, and periodic recurring inspections (e.g. every 2 months).
          </p>
        </div>
      </div>

      {/* Notice info banner - Light Theme */}
      <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-950 text-xs">Advance Notice & Access Protocols</h4>
          <p className="mt-1 text-blue-800 leading-relaxed text-xs">
            Property management and verified contractors provide at least 24 hours advance notice for routine visits via SMS, WhatsApp, or email. You do not need to be home if key access is pre-authorized.
          </p>
        </div>
      </div>

      {/* 1. Scheduled Recurring Preventive Maintenance Visits - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                Periodic Routine Inspection Cycles
              </h3>
              <p className="text-[11px] text-slate-500">Regularly scheduled property maintenance (e.g. once every 2 months)</p>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            {recurringVisits.length} recurring program(s)
          </span>
        </div>

        {recurringVisits.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8">
            No active recurring inspections scheduled for your apartment.
          </p>
        ) : (
          <div className="space-y-3">
            {recurringVisits.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-bold text-slate-900 text-sm">{v.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-mono font-semibold text-[10px]">
                      Repeats every {v.interval_months} month(s)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>
                      Next Occurrence:{' '}
                      <strong className="text-slate-900">
                        {new Date(v.next_occurrence || v.visit_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Assigned: {v.contractor_name || 'Operations Team'}</span>
                  </div>
                  {v.notes && <p className="text-slate-600 mt-2 text-xs">{v.notes}</p>}
                </div>

                <div className="flex-shrink-0">
                  <StatusBadge status={v.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Manual & Issue Repair Visits - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
                One-Time & Maintenance Repair Visits
              </h3>
              <p className="text-[11px] text-slate-500">Scheduled technician visits for logged issues</p>
            </div>
          </div>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {manualVisits.length} visit(s)
          </span>
        </div>

        {manualVisits.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-8">
            No one-time repair visits scheduled at this time.
          </p>
        ) : (
          <div className="space-y-3">
            {manualVisits.map((v) => (
              <div
                key={v.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-bold text-slate-900 text-sm">{v.title}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-mono font-semibold text-[10px]">
                      Manual Visit
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px]">
                    <span>
                      Visit Date:{' '}
                      <strong className="text-slate-900">
                        {new Date(v.visit_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>Assigned: {v.contractor_name || 'Operations Staff'}</span>
                  </div>
                  {v.notes && <p className="text-slate-600 mt-2 text-xs">{v.notes}</p>}
                </div>

                <div className="flex-shrink-0">
                  <StatusBadge status={v.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
