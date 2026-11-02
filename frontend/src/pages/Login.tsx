import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  ShieldCheck, 
  Home, 
  KeyRound, 
  Mail, 
  AlertCircle, 
  ArrowRight,
  ArrowLeft,
  Wrench,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeRole = searchParams.get('role'); // null | 'admin' | 'tenant'

  // Admin form state
  const [adminEmail, setAdminEmail] = useState('admin@realestate.com');
  const [adminPassword, setAdminPassword] = useState('Admin12345!');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Tenant form state
  const [tenantEmail, setTenantEmail] = useState('johnny@cashmusic.com');
  const [tenantPassword, setTenantPassword] = useState('Tenant12345!');
  const [tenantError, setTenantError] = useState<string | null>(null);
  const [isTenantSubmitting, setIsTenantSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminSubmitting(true);

    try {
      const user = await login(adminEmail, adminPassword);
      if (user.role !== 'admin') {
        throw new Error('This account does not have Property Manager privileges.');
      }
      const from = (location.state as any)?.from?.pathname;
      navigate(from || '/admin/overview', { replace: true });
    } catch (err: any) {
      setAdminError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  const handleTenantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTenantError(null);
    setIsTenantSubmitting(true);

    try {
      const user = await login(tenantEmail, tenantPassword);
      if (user.role !== 'tenant') {
        throw new Error('This account is not a Resident Tenant account.');
      }
      const from = (location.state as any)?.from?.pathname;
      navigate(from || '/tenant/dashboard', { replace: true });
    } catch (err: any) {
      setTenantError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsTenantSubmitting(false);
    }
  };

  const selectRole = (role: 'admin' | 'tenant') => {
    setSearchParams({ role });
  };

  const clearRole = () => {
    setSearchParams({});
    setAdminError(null);
    setTenantError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-mono text-emerald-700 mb-3 shadow-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          REAL ESTATE OPERATIONS HUB • DUAL ACCESS PORTAL
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          {activeRole === 'admin' 
            ? 'Property Manager Sign In' 
            : activeRole === 'tenant' 
            ? 'Resident Portal Sign In' 
            : 'Select Your Portal Access'}
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-xl mx-auto">
          {activeRole === 'admin'
            ? 'Sign in to access portfolio oversight, automated maintenance review, contractor dispatches, and lease administration.'
            : activeRole === 'tenant'
            ? 'Sign in to access unit maintenance tracking, rent ledger, lease documentation, and scheduled inspections.'
            : 'Choose your access portal below to proceed to the dedicated login.'}
        </p>
      </div>

      {/* VIEW 1: TWO ROLE CARDS (DEFAULT SELECTION SCREEN) */}
      {!activeRole && (
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* CARD 1: PROPERTY MANAGER */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => selectRole('admin')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectRole('admin'); }}
              className="group bg-white rounded-2xl shadow-canva-lg border border-slate-200/90 p-8 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-canva-xl hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                    <Building2 className="w-7 h-7 text-emerald-400" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                    Manager Admin
                  </span>
                </div>

                <div className="mt-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Portfolio Operations
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Property Manager
                  </h2>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Full portfolio oversight: automated issue review, contractor dispatch & disbursements ledger, visits calendar, and resident onboarding.
                  </p>
                </div>

                {/* Key Capabilities */}
                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>CrewAI Automated Maintenance Review</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Contractor Roster & Disbursement Ledger</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Properties & Leased Residents Directory</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <div className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-slate-900 group-hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                  <span>Sign In as Property Manager</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* CARD 2: RESIDENT PORTAL */}
            <div 
              role="button"
              tabIndex={0}
              onClick={() => selectRole('tenant')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') selectRole('tenant'); }}
              className="group bg-white rounded-2xl shadow-canva-lg border border-emerald-200/90 p-8 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1.5 hover:shadow-canva-xl hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 active:scale-[0.98]"
            >
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-emerald-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                    <Home className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Resident Tenant
                  </span>
                </div>

                <div className="mt-6">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 block mb-1">
                    Tenancy Services
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Resident Portal
                  </h2>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                    Personalized resident hub: Report maintenance issues with 5-stage live progress, view lease PDFs, upcoming inspections, and rent payment history.
                  </p>
                </div>

                {/* Key Capabilities */}
                <div className="mt-6 pt-5 border-t border-emerald-100/70 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Submit & Track Maintenance Tickets Live</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Access Lease Agreements & Rent Ledger</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Manage Parking Spot & Emergency Contacts</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <div className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 group-hover:from-emerald-700 group-hover:to-teal-700 transition-all shadow-glow-emerald flex items-center justify-center gap-2">
                  <span>Sign In to Resident Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

          </div>

          {/* Quick Credential Helper Pill for Evaluation */}
          <div className="mt-8 p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 font-medium">Quick Demo Credentials:</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@realestate.com');
                  setAdminPassword('Admin12345!');
                  selectRole('admin');
                }}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors"
              >
                Admin: admin@realestate.com
              </button>
              <button
                type="button"
                onClick={() => {
                  setTenantEmail('johnny@cashmusic.com');
                  setTenantPassword('Tenant12345!');
                  selectRole('tenant');
                }}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              >
                Resident: Johnny (Unit 4B)
              </button>
              <button
                type="button"
                onClick={() => {
                  setTenantEmail('sarah.connor@skyline.org');
                  setTenantPassword('Tenant12345!');
                  selectRole('tenant');
                }}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
              >
                Resident: Sarah (Unit 12A)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: DEDICATED ADMIN LOGIN FORM */}
      {activeRole === 'admin' && (
        <div className="max-w-md mx-auto w-full">
          <div className="mb-4">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-canva-lg border border-slate-200/90 overflow-hidden">
            <div className="p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Operations Portal
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">Property Manager</h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  Admin
                </span>
              </div>

              {adminError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Admin Form */}
              <form onSubmit={handleAdminLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                    Manager Email
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@realestate.com"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isAdminSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{isAdminSubmitting ? 'Authenticating...' : 'Sign In as Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Helper Pill */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Test Account:</span>
              <button
                type="button"
                onClick={() => {
                  setAdminEmail('admin@realestate.com');
                  setAdminPassword('Admin12345!');
                }}
                className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                admin@realestate.com / Admin12345!
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => selectRole('tenant')}
              className="text-xs text-slate-500 hover:text-emerald-700 font-medium transition-colors"
            >
              Looking for the Resident Portal instead? <span className="underline font-semibold">Switch to Resident</span>
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: DEDICATED TENANT LOGIN FORM */}
      {activeRole === 'tenant' && (
        <div className="max-w-md mx-auto w-full">
          <div className="mb-4">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Selection</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-canva-lg border border-emerald-200/90 overflow-hidden">
            <div className="p-8">
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-emerald-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-sm">
                    <Home className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 block">
                      Resident Portal
                    </span>
                    <h2 className="text-lg font-bold text-slate-900">Resident Sign In</h2>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Tenant
                </span>
              </div>

              {tenantError && (
                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                  <span>{tenantError}</span>
                </div>
              )}

              {/* Tenant Form */}
              <form onSubmit={handleTenantLogin} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                    Resident Email
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="johnny@cashmusic.com"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 font-mono">
                    Password
                  </label>
                  <div className="relative rounded-xl shadow-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={tenantPassword}
                      onChange={(e) => setTenantPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isTenantSubmitting}
                  className="w-full mt-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 transition-all shadow-glow-emerald flex items-center justify-center gap-2"
                >
                  <span>{isTenantSubmitting ? 'Authenticating...' : 'Sign In as Resident'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Quick Credential Helper Pills */}
            <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 font-medium">Test Residents:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTenantEmail('johnny@cashmusic.com');
                    setTenantPassword('Tenant12345!');
                  }}
                  className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  Johnny (4B)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTenantEmail('sarah.connor@skyline.org');
                    setTenantPassword('Tenant12345!');
                  }}
                  className="text-[11px] font-mono font-semibold px-2 py-1 rounded-lg bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-colors"
                >
                  Sarah (12A)
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => selectRole('admin')}
              className="text-xs text-slate-500 hover:text-slate-900 font-medium transition-colors"
            >
              Need Property Operations access instead? <span className="underline font-semibold">Switch to Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Footer System Specs */}
      <div className="mt-12 text-center text-xs text-slate-400 font-mono">
        Austin Capital View Portfolio • Unified Authentication Engine v3.0.0
      </div>
    </div>
  );
};
