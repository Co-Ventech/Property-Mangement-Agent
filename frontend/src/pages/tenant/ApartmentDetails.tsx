import React, { useState, useEffect } from 'react';
import { 
  Building, 
  FileText, 
  Download, 
  Calendar, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';

export const ApartmentDetails: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadApartment() {
      try {
        const res = await api.getApartmentDetails();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadApartment();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
        Loading apartment & lease records...
      </div>
    );
  }

  const { unit, lease, documents } = data;

  const displayDocs = (documents && documents.length > 0) ? documents : [
    {
      id: 'doc-1',
      name: 'Residential Lease Agreement (Austin Portfolio)',
      kind: 'lease',
      uploaded_at: '2026-01-01',
      download_url: '#'
    },
    {
      id: 'doc-2',
      name: 'Move-in Condition & Inspection Checklist',
      kind: 'inspection',
      uploaded_at: '2026-01-02',
      download_url: '#'
    },
    {
      id: 'doc-3',
      name: 'Community Rules, Parking & HOA Policies',
      kind: 'notice',
      uploaded_at: '2026-01-01',
      download_url: '#'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Tenancy Credentials
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Unit {unit?.unit_number || '4B'}</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Apartment & Lease Documentation
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Physical unit specifications, verified lease agreements, deposit records, and downloadable documents.
          </p>
        </div>
      </div>

      {/* Unit Specs Card - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4 hover-card-elevate">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Building className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Property & Apartment Specifications
            </h3>
          </div>
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
            Unit {unit?.unit_number || '4B'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Address</span>
            <span className="font-semibold text-slate-900 text-xs mt-0.5 block truncate">
              {unit?.address || '1024 Capital View Blvd, Austin, TX'}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Bedrooms / Baths</span>
            <span className="font-semibold text-slate-900 text-xs mt-0.5 block">
              {unit?.bedrooms || 2} Bed / {unit?.bathrooms || 2.0} Bath
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Square Footage</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
              {unit?.sq_ft || 950} sq. ft.
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Monthly Rent Rate</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
              ${Number(unit?.monthly_rent || 1850).toLocaleString()}/mo
            </span>
          </div>
        </div>
      </div>

      {/* Lease Terms Card - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4 hover-card-elevate">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Current Lease Terms
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
            {lease?.status || 'Active'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Lease Start</span>
            <span className="font-mono font-semibold text-slate-900 text-xs mt-0.5 block">
              {lease?.start_date || '2026-01-01'}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Lease Expiration</span>
            <span className="font-mono font-semibold text-slate-900 text-xs mt-0.5 block">
              {lease?.end_date || '2026-12-31'}
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Deposit Held</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
              ${Number(lease?.deposit || 1850).toLocaleString()} (Escrow)
            </span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-slate-500 block text-[10px] font-mono uppercase">Rent Due</span>
            <span className="font-mono font-bold text-slate-900 text-xs mt-0.5 block">
              ${Number(lease?.monthly_rent || 1850).toLocaleString()} (1st of mo.)
            </span>
          </div>
        </div>
      </div>

      {/* Verified Lease Documents - Light Theme */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Lease Documents & Attachments
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Cloud Verified Records</span>
        </div>

        <div className="divide-y divide-slate-100">
          {displayDocs.map((doc: any) => (
            <div key={doc.id} className="py-3.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors px-2 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{doc.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">
                    {doc.kind} • Uploaded {doc.uploaded_at}
                  </p>
                </div>
              </div>

              <a
                href={doc.download_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:text-slate-900 hover:bg-slate-50 text-xs font-semibold transition-all shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Download PDF</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
