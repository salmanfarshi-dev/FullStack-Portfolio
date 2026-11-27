import { useCallback, useEffect, useState } from "react";
import {
  FiActivity, FiSearch, FiRefreshCw, FiCheckCircle, FiAlertCircle,
  FiAlertTriangle, FiChevronLeft, FiChevronRight, FiFilter, FiClock,
  FiUser, FiLayers, FiX, FiShield,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const modules = [
  ["", "All modules"], ["auth", "Authentication"], ["projects", "Projects"],
  ["skills", "Skills"], ["about", "About"], ["hero", "Hero Section"],
  ["contact", "Messages"], ["newsletter", "Newsletter"], ["journeys", "Journey"],
  ["socials", "Social Links"], ["resume", "Resume"], ["seo", "SEO"],
  ["settings", "Website Settings"], ["analytics", "Analytics"],
  ["notifications", "Notifications"], ["system", "System"],
];

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-US", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const statusConfig = {
  success: { label: "Success", icon: FiCheckCircle, className: "bg-emerald-500/10 text-emerald-500" },
  failed: { label: "Failed", icon: FiAlertCircle, className: "bg-red-500/10 text-red-500" },
  warning: { label: "Warning", icon: FiAlertTriangle, className: "bg-amber-500/10 text-amber-500" },
};

const StatCard = ({ label, value, icon: Icon, tone }) => (
  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon size={20} /></div>
    <p className="mt-4 text-sm text-[var(--color-muted)]">{label}</p>
    <p className="mt-1 font-heading text-3xl font-bold">{Number(value || 0).toLocaleString()}</p>
  </div>
);

const ActivityLogs = () => {
  const [summary, setSummary] = useState({ total: 0, successful: 0, failed: 0, warning: 0 });
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1, limit: 20 });
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [module, setModule] = useState("");
  const [status, setStatus] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [retentionDays, setRetentionDays] = useState("180");
  const [cleaning, setCleaning] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (module) params.set("module", module);
      if (status) params.set("status", status);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      if (appliedSearch) params.set("search", appliedSearch);

      const [logsResponse, summaryResponse] = await Promise.all([
        fetch(`${API_URL}/activity-logs?${params}`, { credentials: "include" }),
        fetch(`${API_URL}/activity-logs/summary?days=30`, { credentials: "include" }),
      ]);
      const logsData = await logsResponse.json().catch(() => ({}));
      const summaryData = await summaryResponse.json().catch(() => ({}));
      if (!logsResponse.ok) throw new Error(logsData.message || "Failed to load activity logs.");
      if (!summaryResponse.ok) throw new Error(summaryData.message || "Failed to load activity summary.");

      setLogs(Array.isArray(logsData.logs) ? logsData.logs : []);
      setPagination(logsData.pagination || { page: 1, total: 0, totalPages: 1, limit: 20 });
      setSummary(summaryData.summary || { total: 0, successful: 0, failed: 0, warning: 0 });
    } catch (err) {
      setError(err.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [page, module, status, fromDate, toDate, appliedSearch]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  };

  const handleCleanup = async () => {
    if (cleaning) return;
    const days = Number(retentionDays);
    if (!window.confirm(`Delete activity logs older than ${days} days? This cannot be undone.`)) return;

    setCleaning(true);
    try {
      const response = await fetch(`${API_URL}/activity-logs/cleanup`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Failed to clean up activity logs.");
      window.alert(data.message || `Deleted ${data.deletedCount || 0} old records.`);
      await fetchLogs();
    } catch (err) {
      window.alert(err.message || "Unable to clean up activity logs.");
    } finally {
      setCleaning(false);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setModule("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Security & transparency</p>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Activity Logs</h1>
          <p className="mt-2 max-w-2xl text-sm text-[var(--color-muted)]">Track administrative actions and monitor important changes across your portfolio.</p>
        </div>
        <button type="button" onClick={fetchLogs} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)] disabled:opacity-50">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </section>

      {error && <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">{error}</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total activities · 30 days" value={summary.total} icon={FiActivity} tone="bg-cyan-500/10 text-cyan-500" />
        <StatCard label="Successful actions" value={summary.successful} icon={FiCheckCircle} tone="bg-emerald-500/10 text-emerald-500" />
        <StatCard label="Failed actions" value={summary.failed} icon={FiAlertCircle} tone="bg-red-500/10 text-red-500" />
        <StatCard label="Warnings" value={summary.warning} icon={FiAlertTriangle} tone="bg-amber-500/10 text-amber-500" />
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold"><FiFilter className="text-[var(--color-primary)]" /> Filter activity</div>
        <form onSubmit={handleSearch} className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_170px_145px_150px_150px_auto]">
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search action, admin or description..." className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[var(--color-primary)]" />
          </div>
          <select value={module} onChange={(event) => { setModule(event.target.value); setPage(1); }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]">
            {modules.map(([value, label]) => <option key={value || "all"} value={value}>{label}</option>)}
          </select>
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 text-sm outline-none focus:border-[var(--color-primary)]">
            <option value="">All statuses</option><option value="success">Success</option><option value="failed">Failed</option><option value="warning">Warning</option>
          </select>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]"><span>From date</span><input type="date" value={fromDate} max={toDate || undefined} onChange={(event) => { setFromDate(event.target.value); setPage(1); }} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" /></label>
          <label className="flex flex-col gap-1 text-xs text-[var(--color-muted)]"><span>To date</span><input type="date" value={toDate} min={fromDate || undefined} onChange={(event) => { setToDate(event.target.value); setPage(1); }} className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]" /></label>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-bold text-slate-950 transition hover:brightness-110">Search</button>
            <button type="button" onClick={resetFilters} title="Clear filters" className="rounded-xl border border-[var(--color-border)] px-3 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"><FiX /></button>
          </div>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-5 py-4">
          <div><h2 className="font-heading text-lg font-bold">Recent activity</h2><p className="mt-1 text-xs text-[var(--color-muted)]">{pagination.total || 0} records found</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]"><FiShield size={13} /> Admin audit trail</span>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[var(--color-muted)]"><FiRefreshCw className="animate-spin" /> Loading activity...</div>
        ) : logs.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><FiActivity size={25} /></div>
            <h3 className="mt-4 font-heading text-lg font-bold">No activity found</h3>
            <p className="mt-1 max-w-md text-sm leading-6 text-[var(--color-muted)]">There are no records matching these filters. New administrative events will appear here as activity tracking is enabled.</p>
            {(module || status || appliedSearch) && <button type="button" onClick={resetFilters} className="mt-4 text-sm font-semibold text-[var(--color-primary)]">Clear all filters</button>}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] text-left">
                <thead className="bg-[var(--color-background)] text-[11px] uppercase tracking-wider text-[var(--color-muted)]">
                  <tr><th className="px-5 py-4 font-semibold">Activity</th><th className="px-4 py-4 font-semibold">Admin</th><th className="px-4 py-4 font-semibold">Module</th><th className="px-4 py-4 font-semibold">Status</th><th className="px-5 py-4 font-semibold">Date & time</th></tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {logs.map((log) => {
                    const state = statusConfig[log.status] || statusConfig.success;
                    const StateIcon = state.icon;
                    return <tr key={log._id} className="transition hover:bg-[var(--color-surface-hover)]">
                      <td className="max-w-[390px] px-5 py-4"><p className="text-sm font-semibold">{String(log.action || "Activity").replaceAll("_", " ")}</p><p className="mt-1 truncate text-xs text-[var(--color-muted)]">{log.description}</p></td>
                      <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-sm"><FiUser className="text-[var(--color-muted)]" />{log.adminName || log.admin?.name || "System"}</span></td>
                      <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-background)] px-2.5 py-1.5 text-xs capitalize"><FiLayers className="text-[var(--color-muted)]" />{log.module || "system"}</span></td>
                      <td className="px-4 py-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${state.className}`}><StateIcon size={13} />{state.label}</span></td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-[var(--color-muted)]"><span className="inline-flex items-center gap-1.5"><FiClock size={13} />{dateLabel(log.createdAt)}</span></td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-4 md:hidden">
              {logs.map((log) => {
                const state = statusConfig[log.status] || statusConfig.success;
                const StateIcon = state.icon;
                return <article key={log._id} className="rounded-xl border border-[var(--color-border)] p-4">
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-sm font-semibold capitalize">{String(log.action || "Activity").replaceAll("_", " ")}</h3><p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{log.description}</p></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${state.className}`}><StateIcon size={12} />{state.label}</span></div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-muted)]"><span className="inline-flex items-center gap-1"><FiUser />{log.adminName || "System"}</span><span className="capitalize">{log.module}</span><span>{dateLabel(log.createdAt)}</span></div>
                </article>;
              })}
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[var(--color-muted)]">Page {pagination.page || page} of {Math.max(1, pagination.totalPages || 1)}</p>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"><FiChevronLeft /> Previous</button>
            <button type="button" disabled={page >= (pagination.totalPages || 1) || loading} onClick={() => setPage((current) => current + 1)} className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40">Next <FiChevronRight /></button>
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-sm font-bold">Log retention</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Permanently remove records older than the selected retention period.</p></div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={retentionDays} onChange={(event) => setRetentionDays(event.target.value)} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"><option value="90">90 days</option><option value="180">180 days</option><option value="365">1 year</option><option value="730">2 years</option><option value="1095">3 years</option></select>
          <button type="button" onClick={handleCleanup} disabled={cleaning} className="rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-red-500/10 disabled:opacity-50">{cleaning ? "Cleaning..." : "Clean old logs"}</button>
        </div>
      </section>
      <p className="text-right text-[10px] text-[var(--color-muted)]">Activity summaries cover the last 30 days. Sensitive request metadata is not exposed in this view.</p>
    </div>
  );
};

export default ActivityLogs;
