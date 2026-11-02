import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle, RefreshCw, Bot, ShieldCheck, Sparkles } from 'lucide-react';
import { api } from '../../api/client';

export const AgentSettings: React.FC = () => {
  const [prompts, setPrompts] = useState<Record<string, string>>({
    intake_prompt: '',
    investigator_prompt: '',
    email_prompt: '',
    sms_prompt: '',
    whatsapp_prompt: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadPrompts() {
      try {
        const data = await api.getPrompts();
        setPrompts(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrompts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updatePrompts(prompts);
      setSuccessMsg('Agent prompt instructions updated and persisted to database.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (key: string, val: string) => {
    setPrompts(prev => ({ ...prev, [key]: val }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-xs font-mono text-slate-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3" />
        Loading AI agent prompts...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Intelligence Engine
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">CrewAI Agent Directives</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Automated Assessment & Review Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Customize reasoning instructions for automated intake analysis, history investigation, and dispatch drafting.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Agent 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-canva space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Agent 1: Maintenance Intake Analyst
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Governs physical symptom extraction, equipment categorization, and identifying missing diagnostic information.
          </p>
          <textarea
            rows={3}
            value={prompts.intake_prompt || ''}
            onChange={(e) => handleChange('intake_prompt', e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Agent 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-canva space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Agent 2: History Investigator
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            Instructions for cross-referencing past 24-month work orders and synthesizing chronic equipment wear.
          </p>
          <textarea
            rows={3}
            value={prompts.investigator_prompt || ''}
            onChange={(e) => handleChange('investigator_prompt', e.target.value)}
            className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>

        {/* Agent 3, 4, 5 Dispatches */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-canva space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              Dispatch Synthesis Agents (Email, SMS, WhatsApp)
            </h3>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-mono">
              Email Dispatch Agent Prompt
            </label>
            <textarea
              rows={2}
              value={prompts.email_prompt || ''}
              onChange={(e) => handleChange('email_prompt', e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-mono">
              Urgent SMS Dispatch Agent Prompt
            </label>
            <textarea
              rows={2}
              value={prompts.sms_prompt || ''}
              onChange={(e) => handleChange('sms_prompt', e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 font-mono">
              WhatsApp Structured Briefing Agent Prompt
            </label>
            <textarea
              rows={2}
              value={prompts.whatsapp_prompt || ''}
              onChange={(e) => handleChange('whatsapp_prompt', e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 text-xs font-mono bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 active:scale-95"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>{isSaving ? 'Persisting Changes...' : 'Save Agent Prompt Config'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
