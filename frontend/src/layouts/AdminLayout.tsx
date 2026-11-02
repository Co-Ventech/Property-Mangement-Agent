import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Inbox, 
  Wrench, 
  CalendarClock, 
  Users, 
  BellRing, 
  Sliders, 
  LogOut,
  Building2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Collapsible sidebar state with local storage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('re_admin_sidebar_collapsed') === 'true';
  });

  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('re_admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const navItems = [
    { label: 'Overview', to: '/admin/overview', icon: LayoutDashboard },
    { label: 'Tickets Queue', to: '/admin/tickets', icon: Inbox },
    { label: 'Contractors', to: '/admin/contractors', icon: Wrench },
    { label: 'Visits Calendar', to: '/admin/visits', icon: CalendarClock },
    { label: 'Tenants & Units', to: '/admin/tenants', icon: Users },
    { label: 'Notifications Log', to: '/admin/notifications', icon: BellRing },
    { label: 'Agent Prompts', to: '/admin/settings', icon: Sliders },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Collapsible Sidebar - Light Theme */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-slate-200/90 shadow-xs transition-[width,transform] duration-200 ease-emil-drawer ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Brand Header */}
        <div className={`h-22 pt-4 pb-3 flex items-center border-b border-slate-100 bg-white relative ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          <div 
            onClick={() => isCollapsed && setIsCollapsed(false)}
            className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'cursor-pointer justify-center' : ''}`}
            title={isCollapsed ? 'Click to expand sidebar' : undefined}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs flex-shrink-0">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold tracking-tight text-slate-900 uppercase font-sans">Operations</h1>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    HUB
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">Austin Capital View</p>
              </div>
            )}
          </div>

          {/* Collapse/Expand Toggle Button (Desktop Rail Edge Button) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white hover:bg-slate-50 active:scale-90 text-slate-500 hover:text-slate-900 transition-all border border-slate-200/90 shadow-xs z-30 cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-md text-slate-500 hover:text-slate-900 active:scale-95 transition-transform"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group relative active:scale-[0.98] ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:scale-110`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Tooltip for collapsed state: Emil Kowalski origin-aware scale-95 to scale-100 */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-xs font-medium rounded-md shadow-lg opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 ease-emil-out pointer-events-none z-50 whitespace-nowrap origin-left">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="p-3 border-t border-slate-100 bg-slate-50">
          <div className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? (
              <button
                onClick={logout}
                title="Log Out (Operations Manager)"
                className="w-9 h-9 rounded-lg bg-emerald-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0 font-mono transition-colors group relative"
              >
                <LogOut className="w-4 h-4 hidden group-hover:block text-rose-600" />
                <span className="group-hover:hidden">PM</span>
              </button>
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800 flex-shrink-0 font-mono">
                  PM
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name || 'Operations Manager'}</p>
                  <p className="text-[10px] text-emerald-700 flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Admin Authority</span>
                  </p>
                </div>
                <button
                  onClick={logout}
                  title="Log Out"
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Top Status Bar */}
        <header className="h-14 border-b border-slate-200/90 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-mono font-medium">
                1024 CAPITAL VIEW BLVD, AUSTIN TX
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Automated Review: Active</span>
            </div>
            <button
              onClick={() => navigate('/admin/tickets')}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              Queue
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
