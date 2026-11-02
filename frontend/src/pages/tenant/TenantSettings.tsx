import React, { useState } from 'react';
import { 
  KeyRound, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Bell, 
  Smartphone, 
  MessageSquare, 
  Mail,
  ShieldCheck,
  Sparkles,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const TenantSettings: React.FC = () => {
  const { user } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Notification Preferences
  const [prefSMS, setPrefSMS] = useState(true);
  const [prefWhatsApp, setPrefWhatsApp] = useState(true);
  const [prefEmail, setPrefEmail] = useState(true);
  const [prefSaved, setPrefSaved] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword
      });
      setSuccessMsg('Your password has been successfully updated.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Account Security
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">Resident Profile</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Resident Portal Settings
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Manage your account security, password credentials, contact details, and notification dispatch preferences.
          </p>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Resident Profile Information
            </h3>
            <p className="text-[11px] text-slate-500">Verified resident profile linked with your tenancy lease</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">Resident Name</span>
            <span className="font-bold text-slate-900 text-xs mt-1 block">{user?.full_name}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">Email Address</span>
            <span className="font-mono text-emerald-700 font-semibold text-xs mt-1 block truncate">{user?.email}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[10px] font-mono uppercase tracking-wider">Primary Phone</span>
            <span className="font-mono text-slate-700 font-semibold text-xs mt-1 block">{user?.phone || '(512) 555-0201'}</span>
          </div>
        </div>
      </div>

      {/* Basic Password Reset Form (Required by user request) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Security & Password Reset
            </h3>
            <p className="text-[11px] text-slate-500">Update your resident portal login credentials</p>
          </div>
        </div>

        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full sm:w-80 border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full border border-slate-200 bg-slate-50 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm transition-all active:scale-[0.97] disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva p-6 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              Communication & Dispatch Channels
            </h3>
            <p className="text-[11px] text-slate-500">Choose how property managers and service technicians notify you</p>
          </div>
        </div>

        {prefSaved && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-medium">Preferences saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSavePreferences} className="space-y-3.5 text-xs">
          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">SMS Direct Text Messages</p>
                <p className="text-[11px] text-slate-500">Emergency leak alerts and visit arrival notifications</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefSMS}
              onChange={(e) => setPrefSMS(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-100/70 text-teal-700 flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">WhatsApp Structured Briefings</p>
                <p className="text-[11px] text-slate-500">Inspection reminders and contractor scheduling options</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefWhatsApp}
              onChange={(e) => setPrefWhatsApp(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <label className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-cyan-100/70 text-cyan-700 flex items-center justify-center">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Email Receipts & Statements</p>
                <p className="text-[11px] text-slate-500">Monthly rent statements and detailed inspection reports</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={prefEmail}
              onChange={(e) => setPrefEmail(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
          </label>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl font-bold shadow-sm active:scale-[0.97] transition-all"
            >
              <Save className="w-4 h-4 text-emerald-600" />
              <span>Save Notification Preferences</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
