const { useState, useEffect } = React;

    function App() {
      const [activeAgent, setActiveAgent] = useState("operations"); 
      const [activeNav, setActiveNav] = useState("overview"); // "overview" | "queue" | "agents" | "integrations"

      const [tickets, setTickets] = useState([]);
      const [stats, setStats] = useState({ total: 0, emergency: 0, pending: 0, dispatched: 0 });
      const [selectedTicket, setSelectedTicket] = useState(null);
      const [isDrawerOpen, setIsDrawerOpen] = useState(false);
      const [filterUrgency, setFilterUrgency] = useState("all");
      const [filterStatus, setFilterStatus] = useState("all");
      const [searchQuery, setSearchQuery] = useState("");
      const [loading, setLoading] = useState(false);
      const [copied, setCopied] = useState(false);
      const [activeChannel, setActiveChannel] = useState("email");
      const [dispatchAlert, setDispatchAlert] = useState(null);
      const [sendingDispatch, setSendingDispatch] = useState(false);

      // Tenant form state
      const [tenantForm, setTenantForm] = useState({
        tenant_name: "",
        tenant_email: "",
        tenant_phone: "",
        flat_number: "",
        issue_title: "",
        description: "",
      });
      const [evidenceFiles, setEvidenceFiles] = useState([]);
      const [submitStatus, setSubmitStatus] = useState(null);

      // Agent Prompts & Configuration State
      const [agentConfig, setAgentConfig] = useState({
        intake_prompt: "",
        investigator_prompt: "",
        email_agent_prompt: "",
        sms_agent_prompt: "",
        whatsapp_agent_prompt: "",
        history_records: []
      });
      const [configSaved, setConfigSaved] = useState(false);

      // Communication Integrations State
      const [integrations, setIntegrations] = useState({
        contractor_email: "dispatch@apexair-mechanical.com",
        contractor_phone: "+1 (512) 302-8841",
        contractor_whatsapp: "+15123028841"
      });
      const [settingsSaved, setSettingsSaved] = useState(false);

      const fetchTickets = async () => {
        try {
          const res = await fetch(`/api/tickets?urgency=${filterUrgency}&status=${filterStatus}`);
          const data = await res.json();
          setTickets(data);
          if (data.length > 0 && !selectedTicket) {
            setSelectedTicket(data[0]);
          } else if (selectedTicket) {
            const updated = data.find(t => t.id === selectedTicket.id);
            if (updated) setSelectedTicket(updated);
          }
        } catch (e) {
          console.error(e);
        }
      };

      const fetchStats = async () => {
        try {
          const res = await fetch("/api/stats");
          const data = await res.json();
          setStats(data);
        } catch (e) {
          console.error(e);
        }
      };

      const fetchConfig = async () => {
        try {
          const res = await fetch("/api/config");
          const data = await res.json();
          setAgentConfig(data);
        } catch (e) {
          console.error(e);
        }
      };

      useEffect(() => {
        fetchTickets();
        fetchStats();
        fetchConfig();
      }, [filterUrgency, filterStatus]);

      useEffect(() => {
        if (window.lucide) window.lucide.createIcons();
      }, [tickets, selectedTicket, activeAgent, activeNav, activeChannel, dispatchAlert, isDrawerOpen]);

      const handleTenantSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitStatus(null);
        try {
          const fd = new FormData();
          Object.keys(tenantForm).forEach(k => fd.append(k, tenantForm[k]));
          for (let i = 0; i < evidenceFiles.length; i++) {
            fd.append("evidence", evidenceFiles[i]);
          }
          const res = await fetch("/api/tickets", { method: "POST", body: fd });
          const json = await res.json();
          setSubmitStatus({
            success: true,
            msg: `Maintenance Request Reference #${json.id} has been submitted successfully. A property operations supervisor has been notified.`
          });
          setTenantForm({
            tenant_name: "",
            tenant_email: "",
            tenant_phone: "",
            flat_number: "",
            issue_title: "",
            description: "",
          });
          setEvidenceFiles([]);
          fetchTickets();
          fetchStats();
        } catch (err) {
          setSubmitStatus({ success: false, msg: "Unable to submit request. Please check connection and retry." });
        } finally {
          setLoading(false);
        }
      };

      const updateTicketStatus = async (ticketId, newStatus) => {
        try {
          await fetch(`/api/tickets/${ticketId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
          });
          fetchTickets();
          fetchStats();
        } catch (err) {
          console.error(err);
        }
      };

      const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      const handleSaveConfig = async (e) => {
        e.preventDefault();
        try {
          await fetch("/api/config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(agentConfig)
          });
          setConfigSaved(true);
          setTimeout(() => setConfigSaved(false), 2500);
        } catch (err) {
          console.error(err);
        }
      };

      const handleSaveIntegrations = (e) => {
        e.preventDefault();
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      };

      const triggerDispatch = async (channel, message, recipient) => {
        if (!selectedTicket) return;
        setSendingDispatch(true);
        setDispatchAlert(null);
        try {
          const res = await fetch("/api/dispatch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              channel: channel,
              recipient: recipient,
              message: message,
              ticket_id: selectedTicket.id
            })
          });
          const json = await res.json();
          setDispatchAlert({
            success: true,
            msg: `${channel.toUpperCase()} Dispatch Successfully Triggered to ${recipient}!`
          });
          await updateTicketStatus(selectedTicket.id, "dispatched");
          setTimeout(() => setDispatchAlert(null), 4000);
        } catch (err) {
          setDispatchAlert({ success: false, msg: "Failed to dispatch communication." });
        } finally {
          setSendingDispatch(false);
        }
      };

      const getChannelMessage = (channel) => {
        if (!selectedTicket) return "";
        const payloads = selectedTicket.channel_payloads || {};
        if (channel === "email") {
          return payloads.email || selectedTicket.contractor_dispatch_draft || "";
        } else if (channel === "sms") {
          return payloads.sms || `[DISPATCH ALERT] Unit ${selectedTicket.flat_number} - ${selectedTicket.issue_title}. Urgency: ${(selectedTicket.urgency || "").toUpperCase()}. Please confirm ETA.`;
        } else if (channel === "whatsapp") {
          return payloads.whatsapp || `*WORK ORDER DISPATCH*\n*Unit:* ${selectedTicket.flat_number}\n*Issue:* ${selectedTicket.issue_title}\n*Priority:* ${(selectedTicket.urgency || "").toUpperCase()}\n*Summary:* ${selectedTicket.ai_summary}\n\nPlease reply with your technician ETA.`;
        }
        return "";
      };

      const openTicketDrawer = (ticket) => {
        setSelectedTicket(ticket);
        setIsDrawerOpen(true);
        setDispatchAlert(null);
      };

      const filteredTickets = tickets.filter(t => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.tenant_name.toLowerCase().includes(q) ||
          t.flat_number.toLowerCase().includes(q) ||
          t.issue_title.toLowerCase().includes(q) ||
          (t.category && t.category.toLowerCase().includes(q))
        );
      });

      const navItems = [
        { id: "overview", label: "Operations Overview", icon: "layout-dashboard" },
        { id: "queue", label: "Maintenance Queue (Full Table)", icon: "clipboard-list" },
        { id: "agents", label: "Agent Prompts & History", icon: "sparkles" },
        { id: "integrations", label: "Dispatch Integrations", icon: "share-2" },
      ];

      return (
        <div className="flex-1 flex flex-col min-h-screen">
          {/* TopBar */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                <i data-lucide="bot" className="w-5 h-5"></i>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-900 text-sm tracking-tight">Real Estate Operations Hub</span>
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-medium">
                    Multi-Agent AI
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Autonomous Intake, History Investigation & Multi-Channel Dispatch</p>
              </div>
            </div>

            {/* Central Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 shadow-inner">
              <button
                type="button"
                onClick={() => setActiveAgent("operations")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeAgent === "operations"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                <i data-lucide="workflow" className="w-3.5 h-3.5"></i>
                <span>Real Estate Manager Hub</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveAgent("tenant")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeAgent === "tenant"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                <i data-lucide="user-check" className="w-3.5 h-3.5"></i>
                <span>Tenant Portal</span>
              </button>
            </div>

            {/* Sync Badge */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Port 8000 &bull; Supabase Sync</span>
              </div>
            </div>
          </header>

          {/* MAIN WORKSPACE */}
          <div className="flex-1 flex">
            {/* SIDEBAR */}
            {activeAgent === "operations" && (
              <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
                <div>
                  <div className="px-3 py-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Maintenance Operations
                    </span>
                  </div>
                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const isActive = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveNav(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold shadow-xs"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                          }`}
                        >
                          <i data-lucide={item.icon} className="w-4 h-4 shrink-0"></i>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 px-3">
                  <p className="font-medium text-slate-700">Multi-Agent Workflow</p>
                  <p className="mt-0.5 text-slate-500 leading-tight">
                    Intake &bull; History Investigator &bull; One-Click Dispatch
                  </p>
                </div>
              </aside>
            )}

            {/* CONTENT AREA */}
            <main className="flex-1 bg-slate-50 p-6 overflow-y-auto min-h-[calc(100vh-4rem)]">
              {/* TENANT SUBMISSION VIEW */}
              {activeAgent === "tenant" && (
                <div className="max-w-2xl mx-auto py-6">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Resident Services</span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">Submit a Maintenance Request</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Log property repairs or maintenance concerns directly to operations.
                      </p>
                    </div>

                    {submitStatus && (
                      <div
                        className={`p-3.5 rounded-lg text-xs leading-relaxed ${
                          submitStatus.success
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium"
                            : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                      >
                        {submitStatus.msg}
                      </div>
                    )}

                    <form onSubmit={handleTenantSubmit} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Resident Full Name</label>
                          <input
                            type="text"
                            required
                            value={tenantForm.tenant_name}
                            onChange={(e) => setTenantForm({ ...tenantForm, tenant_name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Flat / Unit Number</label>
                          <input
                            type="text"
                            required
                            value={tenantForm.flat_number}
                            onChange={(e) => setTenantForm({ ...tenantForm, flat_number: e.target.value })}
                            placeholder="e.g. 4B"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Contact Phone Number</label>
                          <input
                            type="tel"
                            required
                            value={tenantForm.tenant_phone}
                            onChange={(e) => setTenantForm({ ...tenantForm, tenant_phone: e.target.value })}
                            placeholder="+1 (512) 649-2834"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={tenantForm.tenant_email}
                            onChange={(e) => setTenantForm({ ...tenantForm, tenant_email: e.target.value })}
                            placeholder="resident@building.com"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Issue Headline</label>
                        <input
                          type="text"
                          required
                          value={tenantForm.issue_title}
                          onChange={(e) => setTenantForm({ ...tenantForm, issue_title: e.target.value })}
                          placeholder="Brief summary of the defect"
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Detailed Description</label>
                        <textarea
                          rows="4"
                          required
                          value={tenantForm.description}
                          onChange={(e) => setTenantForm({ ...tenantForm, description: e.target.value })}
                          placeholder="Describe specific symptoms, onset time, and current conditions..."
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Evidence Files</label>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setEvidenceFiles(e.target.files)}
                          className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-800 cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition text-xs shadow-xs disabled:opacity-50"
                      >
                        {loading ? "Submitting Request..." : "Submit Maintenance Ticket"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* OPERATIONS VIEW: 1. OVERVIEW (SPLIT VIEW) */}
              {activeAgent === "operations" && activeNav === "overview" && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  {/* Stat Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tickets</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{stats.total}</p>
                        <span className="text-[11px] text-slate-500 mt-1 block">Avg triage: <strong>4.8 min</strong></span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-xs">
                        <i data-lucide="layers" className="w-5 h-5"></i>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Critical Emergencies</p>
                        <p className="text-2xl font-bold text-red-600 mt-1 tracking-tight">{stats.emergency}</p>
                        <span className="text-[11px] font-semibold text-red-600 mt-1 block">SLA: &lt; 15m response</span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 shrink-0 shadow-xs">
                        <i data-lucide="alert-triangle" className="w-5 h-5"></i>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Needs Review</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1 tracking-tight">{stats.pending}</p>
                        <span className="text-[11px] text-slate-500 mt-1 block">Avg queue: <strong>8 min</strong></span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                        <i data-lucide="clock" className="w-5 h-5"></i>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-start justify-between">
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Dispatched / Active</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1 tracking-tight">{stats.dispatched}</p>
                        <span className="text-[11px] font-semibold text-emerald-600 mt-1 block">SLA dispatch: <strong>98.6%</strong></span>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                        <i data-lucide="check-circle-2" className="w-5 h-5"></i>
                      </div>
                    </div>
                  </div>

                  {/* Split Pane: Queue Summary on Left, Selected Ticket on Right */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left Column: Quick Select Queue */}
                    <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <i data-lucide="list" className="w-4 h-4 text-slate-500"></i>
                          <h2 className="text-sm font-bold text-slate-900">Recent Triage Cases</h2>
                        </div>
                        <button
                          onClick={() => setActiveNav("queue")}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          View Full Table &rarr;
                        </button>
                      </div>

                      <div className="space-y-2.5 max-h-[660px] overflow-y-auto pr-1">
                        {tickets.slice(0, 8).map((t) => {
                          const isSelected = selectedTicket?.id === t.id;
                          return (
                            <div
                              key={t.id}
                              onClick={() => { setSelectedTicket(t); setDispatchAlert(null); }}
                              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? "border-indigo-600 bg-indigo-50/30 shadow-xs ring-1 ring-indigo-500"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-mono font-bold text-slate-600">
                                  {t.id} &bull; Unit {t.flat_number}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                    t.urgency === "emergency"
                                      ? "badge-emergency"
                                      : t.urgency === "urgent"
                                      ? "badge-urgent"
                                      : "badge-routine"
                                  }`}
                                >
                                  {t.urgency}
                                </span>
                              </div>
                              <h3 className="font-semibold text-slate-900 text-xs leading-snug line-clamp-1">
                                {t.issue_title}
                              </h3>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{t.description}</p>
                              <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                <span>Severity: <strong className="text-slate-800">{t.severity} / 5</strong></span>
                                <span className="capitalize font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                  {t.category}
                                </span>
                                <span className="capitalize text-slate-600 font-medium">{t.status}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: AI Deep Inspection & Dispatch */}
                    <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
                      {!selectedTicket ? (
                        <div className="text-center py-24 text-slate-400 text-xs">
                          Select a maintenance case to inspect AI diagnostic findings and dispatch actions.
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {dispatchAlert && (
                            <div className="p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span>{dispatchAlert.msg}</span>
                              <span className="text-[10px] font-mono uppercase bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">Sent</span>
                            </div>
                          )}

                          {selectedTicket.safety_alert && (
                            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl flex items-start gap-3">
                              <i data-lucide="alert-triangle" className="w-5 h-5 text-red-600 shrink-0 mt-0.5"></i>
                              <div>
                                <h4 className="text-red-900 font-bold text-xs uppercase tracking-wider">
                                  Safety Protocol Activated
                                </h4>
                                <p className="text-red-800 text-xs mt-0.5">
                                  Automated rule match: <strong>"{selectedTicket.safety_alert}"</strong>. Priority override to EMERGENCY.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Ticket Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                                  {selectedTicket.id}
                                </span>
                                <span className="text-xs text-slate-400">
                                  Logged: {new Date(selectedTicket.created_at).toLocaleString()}
                                </span>
                              </div>
                              <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedTicket.issue_title}</h2>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5"
                              >
                                <i data-lucide="check" className="w-3.5 h-3.5"></i>
                                <span>Mark Resolved</span>
                              </button>
                            </div>
                          </div>

                          {/* Resident Profile */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                            <div>
                              <p className="text-slate-400 font-medium">Tenant</p>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.tenant_name}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium">Unit</p>
                              <p className="font-bold text-slate-800 mt-0.5">Unit {selectedTicket.flat_number}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium">Phone</p>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.tenant_phone}</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium">Email</p>
                              <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.tenant_email}</p>
                            </div>
                          </div>

                          {/* AI RATING RATIONALE BOX */}
                          <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <i data-lucide="brain-circuit" className="w-4 h-4 text-purple-700"></i>
                                <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                                  AI Priority & Severity Rating Rationale
                                </h4>
                              </div>
                              <span className="text-[11px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                                {selectedTicket.urgency?.toUpperCase()} &bull; Severity {selectedTicket.severity}/5
                              </span>
                            </div>
                            <p className="text-xs text-purple-900 leading-relaxed">
                              {selectedTicket.ai_rating_rationale || `Assigned ${selectedTicket.urgency?.toUpperCase()} with severity score ${selectedTicket.severity}/5 based on physical symptom analysis and building risk mitigation guidelines.`}
                            </p>
                          </div>

                          {/* AGENT 2 FINDINGS: History Investigator */}
                          <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <i data-lucide="history" className="w-4 h-4 text-indigo-700"></i>
                                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                                  Agent 2: Maintenance History Investigator
                                </h4>
                              </div>
                              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                                Unit {selectedTicket.flat_number} Cross-Reference
                              </span>
                            </div>
                            <p className="text-xs text-indigo-900 leading-relaxed">
                              {selectedTicket.history_findings || "No previous chronic failure logs on record for this unit."}
                            </p>
                          </div>

                          {/* SHARED RESULT: Case Report */}
                          <div className="border border-slate-200 bg-white rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <div className="flex items-center gap-2">
                                <i data-lucide="file-text" className="w-4 h-4 text-slate-600"></i>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  Shared Result: Consolidated Case Report
                                </h4>
                              </div>
                              <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                Est. Budget: {selectedTicket.estimated_cost}
                              </span>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed">
                              {selectedTicket.ai_summary}
                            </p>

                            <div>
                              <p className="text-xs font-semibold text-slate-700 mb-1.5">Action Plan Recommended by Agents:</p>
                              <ul className="space-y-1">
                                {(selectedTicket.action_plan || []).map((step, idx) => (
                                  <li key={idx} className="flex items-start text-xs text-slate-700 gap-2">
                                    <span className="font-semibold text-slate-400">{idx + 1}.</span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* MULTI-CHANNEL DISPATCH PANEL WITH SEND BUTTONS */}
                          <div className="border border-slate-200 rounded-xl p-4 space-y-4 bg-white">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-2">
                                <i data-lucide="send" className="w-4 h-4 text-slate-600"></i>
                                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                                  Outbound Contractor Dispatch
                                </h4>
                              </div>
                              <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                                <button
                                  onClick={() => setActiveChannel("email")}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                                    activeChannel === "email" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"
                                  }`}
                                >
                                  Email
                                </button>
                                <button
                                  onClick={() => setActiveChannel("sms")}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                                    activeChannel === "sms" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"
                                  }`}
                                >
                                  SMS
                                </button>
                                <button
                                  onClick={() => setActiveChannel("whatsapp")}
                                  className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                                    activeChannel === "whatsapp" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"
                                  }`}
                                >
                                  WhatsApp
                                </button>
                              </div>
                            </div>

                            {activeChannel === "email" && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">Recipient: <strong className="text-slate-800">{integrations.contractor_email}</strong></span>
                                  <button onClick={() => copyToClipboard(getChannelMessage("email"))} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                                    {copied ? "Copied" : "Copy Draft"}
                                  </button>
                                </div>
                                <textarea
                                  readOnly
                                  rows="5"
                                  value={getChannelMessage("email")}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 focus:outline-none"
                                />
                                <div className="flex justify-end">
                                  <button
                                    disabled={sendingDispatch}
                                    onClick={() => triggerDispatch("email", getChannelMessage("email"), integrations.contractor_email)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <i data-lucide="mail" className="w-3.5 h-3.5"></i>
                                    <span>{sendingDispatch ? "Dispatching..." : "Send Email Dispatch"}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {activeChannel === "sms" && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">Recipient: <strong className="text-slate-800">{integrations.contractor_phone}</strong></span>
                                  <button onClick={() => copyToClipboard(getChannelMessage("sms"))} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                                    {copied ? "Copied" : "Copy SMS"}
                                  </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800">
                                  {getChannelMessage("sms")}
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    disabled={sendingDispatch}
                                    onClick={() => triggerDispatch("sms", getChannelMessage("sms"), integrations.contractor_phone)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <i data-lucide="message-square" className="w-3.5 h-3.5"></i>
                                    <span>{sendingDispatch ? "Dispatching..." : "Send SMS Dispatch"}</span>
                                  </button>
                                </div>
                              </div>
                            )}

                            {activeChannel === "whatsapp" && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">WhatsApp To: <strong className="text-slate-800">{integrations.contractor_whatsapp}</strong></span>
                                  <button onClick={() => copyToClipboard(getChannelMessage("whatsapp"))} className="text-indigo-600 hover:text-indigo-800 font-semibold">
                                    {copied ? "Copied" : "Copy WhatsApp"}
                                  </button>
                                </div>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-slate-800 whitespace-pre-wrap">
                                  {getChannelMessage("whatsapp")}
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    disabled={sendingDispatch}
                                    onClick={() => triggerDispatch("whatsapp", getChannelMessage("whatsapp"), integrations.contractor_whatsapp)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-2 disabled:opacity-50"
                                  >
                                    <i data-lucide="send" className="w-3.5 h-3.5"></i>
                                    <span>{sendingDispatch ? "Dispatching..." : "Send WhatsApp Dispatch"}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* OPERATIONS VIEW: 2. MAINTENANCE QUEUE (FULL DETAILED TABLE WITH SLIDE-OUT DRAWER) */}
              {activeAgent === "operations" && activeNav === "queue" && (
                <div className="space-y-6 max-w-7xl mx-auto">
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
                      <div>
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">Maintenance Ticket Queue</h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Complete registry of tenant requests, multi-agent triage classifications, and contractor work orders.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Search Bar */}
                        <div className="relative">
                          <i data-lucide="search" className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"></i>
                          <input
                            type="text"
                            placeholder="Search unit, resident, title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 w-56 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        {/* Urgency Filter */}
                        <select
                          value={filterUrgency}
                          onChange={(e) => setFilterUrgency(e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                        >
                          <option value="all">All Urgencies</option>
                          <option value="emergency">Emergency</option>
                          <option value="urgent">Urgent</option>
                          <option value="routine">Routine</option>
                        </select>

                        {/* Status Filter */}
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                        >
                          <option value="all">All Statuses</option>
                          <option value="triaged">Triaged</option>
                          <option value="dispatched">Dispatched</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    {/* Full Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-50/50">
                            <th className="py-3 px-4 font-semibold">Ticket Ref</th>
                            <th className="py-3 px-4 font-semibold">Unit & Tenant</th>
                            <th className="py-3 px-4 font-semibold">Issue Summary</th>
                            <th className="py-3 px-4 font-semibold">Category</th>
                            <th className="py-3 px-4 font-semibold">Urgency & Severity</th>
                            <th className="py-3 px-4 font-semibold">AI Rationale Summary</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredTickets.length === 0 ? (
                            <tr>
                              <td colSpan="8" className="py-12 text-center text-slate-400">
                                No maintenance tickets match the current filter criteria.
                              </td>
                            </tr>
                          ) : (
                            filteredTickets.map((t) => (
                              <tr
                                key={t.id}
                                onClick={() => openTicketDrawer(t)}
                                className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                              >
                                <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                                  {t.id}
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="font-semibold text-slate-900">Unit {t.flat_number}</div>
                                  <div className="text-slate-400 text-[11px]">{t.tenant_name}</div>
                                </td>
                                <td className="py-3.5 px-4 max-w-xs">
                                  <div className="font-semibold text-slate-800 truncate">{t.issue_title}</div>
                                  <div className="text-slate-500 text-[11px] truncate">{t.description}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="capitalize font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                    {t.category}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                        t.urgency === "emergency"
                                          ? "badge-emergency"
                                          : t.urgency === "urgent"
                                          ? "badge-urgent"
                                          : "badge-routine"
                                      }`}
                                    >
                                      {t.urgency}
                                    </span>
                                    <span className="font-bold text-slate-700 text-[11px]">
                                      {t.severity}/5
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 max-w-xs">
                                  <p className="text-slate-600 text-[11px] line-clamp-2">
                                    {t.ai_rating_rationale || t.ai_summary || "Automated triage classification assigned."}
                                  </p>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className={`capitalize text-[11px] font-semibold px-2 py-0.5 rounded ${
                                    t.status === "dispatched" ? "bg-indigo-50 text-indigo-700" :
                                    t.status === "resolved" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {t.status}
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 text-right">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); openTicketDrawer(t); }}
                                    className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs inline-flex items-center gap-1"
                                  >
                                    <span>Details</span>
                                    <i data-lucide="chevron-right" className="w-3.5 h-3.5"></i>
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* AGENT PROMPTS & HISTORY TAB */}
              {activeAgent === "operations" && activeNav === "agents" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="border-b border-slate-200 pb-4 mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <i data-lucide="sparkles" className="w-4 h-4 text-indigo-600"></i>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Agent Configuration</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Custom Multi-Agent System Prompts</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Set the system prompts directly from the dashboard.
                      </p>
                    </div>

                    {configSaved && (
                      <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                        Agent prompts updated and saved successfully!
                      </div>
                    )}

                    <form onSubmit={handleSaveConfig} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Agent 1: Maintenance Intake Analyst Prompt
                        </label>
                        <textarea
                          rows="3"
                          value={agentConfig.intake_prompt}
                          onChange={(e) => setAgentConfig({ ...agentConfig, intake_prompt: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-5 space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Agent 2: Maintenance History Investigator Prompt
                        </label>
                        <textarea
                          rows="3"
                          value={agentConfig.investigator_prompt}
                          onChange={(e) => setAgentConfig({ ...agentConfig, investigator_prompt: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-5 space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Agent 3: Email Dispatch Agent Prompt
                        </label>
                        <textarea
                          rows="3"
                          value={agentConfig.email_agent_prompt}
                          onChange={(e) => setAgentConfig({ ...agentConfig, email_agent_prompt: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-5 space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Agent 4: SMS Dispatch Agent Prompt
                        </label>
                        <textarea
                          rows="3"
                          value={agentConfig.sms_agent_prompt}
                          onChange={(e) => setAgentConfig({ ...agentConfig, sms_agent_prompt: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-5 space-y-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Agent 5: WhatsApp Dispatch Agent Prompt
                        </label>
                        <textarea
                          rows="3"
                          value={agentConfig.whatsapp_agent_prompt}
                          onChange={(e) => setAgentConfig({ ...agentConfig, whatsapp_agent_prompt: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="border-t border-slate-200 pt-4 flex justify-end">
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs"
                        >
                          Save All Agent Prompts
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* INTEGRATIONS TAB */}
              {activeAgent === "operations" && activeNav === "integrations" && (
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <div className="border-b border-slate-200 pb-4 mb-6">
                      <div className="flex items-center gap-2 mb-1">
                        <i data-lucide="share-2" className="w-4 h-4 text-indigo-600"></i>
                        <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Outbound Channels</span>
                      </div>
                      <h2 className="text-base font-bold text-slate-900">Communication & Dispatch Integrations</h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Configure target recipient numbers and email addresses used by the one-click dispatch buttons.
                      </p>
                    </div>

                    {settingsSaved && (
                      <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                        Recipient numbers and integrations saved.
                      </div>
                    )}

                    <form onSubmit={handleSaveIntegrations} className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primary Contractor Email</h3>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Contractor Dispatch Email</label>
                          <input
                            type="email"
                            value={integrations.contractor_email}
                            onChange={(e) => setIntegrations({ ...integrations, contractor_email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-5 space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Primary Contractor SMS Mobile</h3>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Contractor Mobile Phone (SMS)</label>
                          <input
                            type="text"
                            value={integrations.contractor_phone}
                            onChange={(e) => setIntegrations({ ...integrations, contractor_phone: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-5 space-y-3">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">WhatsApp Business Contact</h3>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Contractor WhatsApp Number</label>
                          <input
                            type="text"
                            value={integrations.contractor_whatsapp}
                            onChange={(e) => setIntegrations({ ...integrations, contractor_whatsapp: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="border-t border-slate-200 pt-4 flex justify-end">
                        <button
                          type="submit"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs"
                        >
                          Save Recipient Configurations
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </main>
          </div>

          {/* SLIDE-OUT DETAIL DRAWER (When clicking any ticket in the Table Queue) */}
          {isDrawerOpen && selectedTicket && (
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
              {/* Backdrop */}
              <div
                onClick={() => setIsDrawerOpen(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
              ></div>

              {/* Side Drawer Panel */}
              <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-50 overflow-y-auto">
                {/* Drawer Header */}
                <div className="p-6 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                      {selectedTicket.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        selectedTicket.urgency === "emergency"
                          ? "badge-emergency"
                          : selectedTicket.urgency === "urgent"
                          ? "badge-urgent"
                          : "badge-routine"
                      }`}
                    >
                      {selectedTicket.urgency}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <i data-lucide="x" className="w-5 h-5"></i>
                  </button>
                </div>

                {/* Drawer Body */}
                <div className="p-6 space-y-6 flex-1">
                  {dispatchAlert && (
                    <div className="p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span>{dispatchAlert.msg}</span>
                      <span className="text-[10px] font-mono uppercase bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">Sent</span>
                    </div>
                  )}

                  {selectedTicket.safety_alert && (
                    <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-xl flex items-start gap-3">
                      <i data-lucide="alert-triangle" className="w-5 h-5 text-red-600 shrink-0 mt-0.5"></i>
                      <div>
                        <h4 className="text-red-900 font-bold text-xs uppercase tracking-wider">Safety Hazard Detected</h4>
                        <p className="text-red-800 text-xs mt-0.5">
                          Deterministic safety rule match: <strong>"{selectedTicket.safety_alert}"</strong>.
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug">{selectedTicket.issue_title}</h2>
                    <p className="text-xs text-slate-400 mt-1">Logged: {new Date(selectedTicket.created_at).toLocaleString()}</p>
                  </div>

                  {/* Resident Profile */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Resident</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.tenant_name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Unit</p>
                      <p className="font-bold text-slate-800 mt-0.5">Unit {selectedTicket.flat_number}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Phone</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.tenant_phone}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-medium">Email</p>
                      <p className="font-bold text-slate-800 mt-0.5">{selectedTicket.tenant_email}</p>
                    </div>
                  </div>

                  {/* Problem Description */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tenant Problem Statement</h4>
                    <div className="bg-slate-50 rounded-xl p-3.5 text-xs text-slate-800 border border-slate-200 leading-relaxed">
                      {selectedTicket.description}
                    </div>
                  </div>

                  {/* AI RATING RATIONALE (Why it gave rating & severity) */}
                  <div className="border border-purple-200 bg-purple-50/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <i data-lucide="brain-circuit" className="w-4 h-4 text-purple-700"></i>
                        <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                          AI Priority & Severity Rating Rationale
                        </h4>
                      </div>
                      <span className="text-[11px] font-semibold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full">
                        {selectedTicket.urgency?.toUpperCase()} &bull; Severity {selectedTicket.severity}/5
                      </span>
                    </div>
                    <p className="text-xs text-purple-900 leading-relaxed">
                      {selectedTicket.ai_rating_rationale || `Assigned ${selectedTicket.urgency?.toUpperCase()} with severity score ${selectedTicket.severity}/5 based on physical symptom analysis and building risk mitigation guidelines.`}
                    </p>
                  </div>

                  {/* History Findings */}
                  <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <i data-lucide="history" className="w-4 h-4 text-indigo-700"></i>
                      <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                        Agent 2: Historical Work Order Cross-Reference
                      </h4>
                    </div>
                    <p className="text-xs text-indigo-900 leading-relaxed">
                      {selectedTicket.history_findings || "No previous chronic failure logs on record for this unit."}
                    </p>
                  </div>

                  {/* Recommended Action Plan */}
                  <div className="border border-slate-200 bg-white rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Resolution Plan & Estimated Cost</h4>
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Budget: {selectedTicket.estimated_cost}
                      </span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {(selectedTicket.action_plan || []).map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-semibold text-slate-400">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Outbound Dispatch in Drawer */}
                  <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trigger Outbound Dispatch</h4>
                      <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          onClick={() => setActiveChannel("email")}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${activeChannel === "email" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"}`}
                        >
                          Email
                        </button>
                        <button
                          onClick={() => setActiveChannel("sms")}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${activeChannel === "sms" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"}`}
                        >
                          SMS
                        </button>
                        <button
                          onClick={() => setActiveChannel("whatsapp")}
                          className={`px-3 py-1 text-xs font-medium rounded-md ${activeChannel === "whatsapp" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600"}`}
                        >
                          WhatsApp
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        readOnly
                        rows="4"
                        value={getChannelMessage(activeChannel)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-800 focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={sendingDispatch}
                          onClick={() => {
                            const recipient = activeChannel === "email" ? integrations.contractor_email :
                                              activeChannel === "sms" ? integrations.contractor_phone : integrations.contractor_whatsapp;
                            triggerDispatch(activeChannel, getChannelMessage(activeChannel), recipient);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <i data-lucide="send" className="w-3.5 h-3.5"></i>
                          <span>Send {activeChannel.toUpperCase()} Dispatch</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between sticky bottom-0">
                  <span className="text-xs text-slate-500 capitalize">Status: <strong>{selectedTicket.status}</strong></span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { updateTicketStatus(selectedTicket.id, "resolved"); setIsDrawerOpen(false); }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1.5"
                    >
                      <i data-lucide="check" className="w-3.5 h-3.5"></i>
                      <span>Mark Resolved</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
