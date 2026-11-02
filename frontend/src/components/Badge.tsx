import React from 'react';

export const UrgencyBadge: React.FC<{ urgency: string }> = ({ urgency }) => {
  const norm = urgency.toLowerCase();
  if (norm === 'emergency') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-xs animate-pulse">
        ● EMERGENCY
      </span>
    );
  }
  if (norm === 'urgent') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 shadow-xs">
        ● URGENT
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
      ROUTINE
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const norm = status.toLowerCase();
  const styles: Record<string, string> = {
    new: 'bg-blue-50 text-blue-700 border-blue-200',
    triaged: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dispatched: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed: 'bg-slate-100 text-slate-600 border-slate-200',
    paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-teal-50 text-teal-700 border-teal-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const current = styles[norm] || 'bg-slate-100 text-slate-700 border-slate-200';
  const label = norm === 'triaged' ? 'Reviewed' : norm.replace('_', ' ');
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize tracking-wide ${current}`}>
      {label}
    </span>
  );
};

export const SeverityIndicator: React.FC<{ severity: number }> = ({ severity }) => {
  return (
    <div className="flex items-center gap-1.5" title={`Severity Level ${severity}/5`}>
      {[1, 2, 3, 4, 5].map((lvl) => (
        <span
          key={lvl}
          className={`h-2 w-2 rounded-full transition-all ${
            lvl <= severity
              ? severity >= 4
                ? 'bg-rose-500'
                : severity === 3
                ? 'bg-amber-500'
                : 'bg-emerald-600'
              : 'bg-slate-200'
          }`}
        />
      ))}
      <span className="text-[11px] text-slate-600 ml-1 font-mono font-bold">{severity}/5</span>
    </div>
  );
};
