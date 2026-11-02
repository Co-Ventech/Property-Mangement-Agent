import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  RefreshCw, 
  Search
} from 'lucide-react';
import { api } from '../../api/client';
import { NotificationRecord } from '../../types';

export const NotificationsLog: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = notifications.filter(n => {
    const matchesChannel = filterChannel === 'all' || n.channel.toLowerCase() === filterChannel.toLowerCase();
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || 
      n.recipient.toLowerCase().includes(query) ||
      (n.subject && n.subject.toLowerCase().includes(query)) ||
      n.body.toLowerCase().includes(query);
    return matchesChannel && matchesSearch;
  });

  const getChannelIcon = (ch: string) => {
    switch (ch.toLowerCase()) {
      case 'sms':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-teal-600" />;
      case 'email':
      default:
        return <Mail className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-700 uppercase bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Communications
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-mono">Dispatch History</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900">
            Notification Dispatch Log
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Complete record of SMS, WhatsApp, and email communications dispatched to residents and service contractors.
          </p>
        </div>

        <button
          onClick={loadNotifications}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs active:scale-[0.97]"
          title="Refresh Log"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-600 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono text-slate-500 text-xs mr-1 uppercase font-semibold">Channel:</span>
          {['all', 'sms', 'whatsapp', 'email'].map((ch) => {
            const isActive = filterChannel === ch;
            return (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={`px-3.5 py-1.5 rounded-xl capitalize font-semibold transition-all text-xs active:scale-[0.97] ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {ch}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search recipient or message..."
            className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Notifications Table - Light Theme (Status Column Removed) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-canva overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-mono text-[10px] font-bold">
              <tr>
                <th className="py-3.5 px-6">Channel</th>
                <th className="py-3.5 px-4">Recipient</th>
                <th className="py-3.5 px-4">Subject / Purpose</th>
                <th className="py-3.5 px-6">Message Content</th>
                <th className="py-3.5 px-6 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 font-mono">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mx-auto mb-2" />
                    Loading notifications...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No notification records found.
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getChannelIcon(n.channel)}
                        <span className="font-bold uppercase text-[11px] text-slate-900 font-mono">{n.channel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900 whitespace-nowrap text-xs">
                      {n.recipient}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {n.subject || 'Dispatch Notice'}
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 max-w-md" title={n.body}>
                      <span className="line-clamp-2">{n.body}</span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {n.created_at ? new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Just now'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
