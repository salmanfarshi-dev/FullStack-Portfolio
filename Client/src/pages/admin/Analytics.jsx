import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiActivity, FiUsers, FiEye, FiFileText, FiFolder, FiMail,
  FiMessageSquare, FiDownload, FiMousePointer, FiRefreshCw,
  FiMonitor, FiSmartphone, FiTablet, FiGlobe, FiTrendingUp,
} from "react-icons/fi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

const number = (value) => new Intl.NumberFormat("en-US").format(Number(value) || 0);

const StatCard = ({ title, value, description, icon: Icon, live = false }) => (
  <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Icon size={20} />
      </div>
      {live && <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-500"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Live</span>}
    </div>
    <p className="mt-5 text-sm font-medium text-[var(--color-muted)]">{title}</p>
    <p className="mt-1 font-heading text-3xl font-bold tracking-tight">{number(value)}</p>
    <p className="mt-2 text-xs text-[var(--color-muted)]">{description}</p>
  </article>
);

const Analytics = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(`${API_URL}/analytics/overview?days=${days}`, {
        credentials: "include",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load analytics.");
      setData(result);
      setError("");
    } catch (err) {
      setError(err.message || "Could not load analytics.");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics(true);
    const interval = window.setInterval(() => fetchAnalytics(false), 30000);
    return () => window.clearInterval(interval);
  }, [fetchAnalytics]);

  const overview = data?.overview || {};
  const chart = useMemo(() => {
    const rows = data?.dailyStats || [];
    if (!rows.length) return [];
    const max = Math.max(1, ...rows.map((row) => row.visitors || 0));
    return rows.map((row) => ({ ...row, height: Math.max(5, ((row.visitors || 0) / max) * 100) }));
  }, [data]);

  const deviceIcons = { desktop: FiMonitor, mobile: FiSmartphone, tablet: FiTablet };
  const sourceLabels = { direct: "Direct", search: "Search", social: "Social", referral: "Referral", other: "Other" };
  const deviceTotal = (data?.deviceStats || []).reduce((sum, item) => sum + item.count, 0) || 1;
  const lastUpdated = data?.updatedAt ? new Date(data.updatedAt).toLocaleTimeString() : "—";

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-primary)]">Performance center</p>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">Website Analytics</h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">Understand your audience, traffic and portfolio engagement.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={days} onChange={(event) => setDays(Number(event.target.value))} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button type="button" onClick={() => fetchAnalytics(true)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)]">
            <FiRefreshCw size={15} /> Refresh
          </button>
        </div>
      </section>

      {error && <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-500">{error} Make sure the backend is running and you are logged in.</div>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Live Visitors" value={overview.liveVisitors} description="Active in the last 90 seconds" icon={FiActivity} live />
        <StatCard title="Total Visitors" value={overview.totalVisitors} description="Unique tracked browser sessions" icon={FiUsers} />
        <StatCard title="Today's Visitors" value={overview.todayVisitors} description="Unique visitors today" icon={FiTrendingUp} />
        <StatCard title="Total Page Views" value={overview.totalPageViews} description="All recorded page views" icon={FiEye} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Published Projects" value={overview.totalProjects} description="Projects visible on portfolio" icon={FiFolder} />
        <StatCard title="Total Messages" value={overview.totalMessages} description="Contact form submissions" icon={FiMail} />
        <StatCard title="Unread Messages" value={overview.unreadMessages} description="Messages waiting for a reply" icon={FiMessageSquare} />
        <StatCard title="Project Clicks" value={overview.projectClicks} description={`Selected period · ${days} days`} icon={FiMousePointer} />
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div><h2 className="font-heading text-lg font-bold">Visitor Trends</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Unique visitors per day · last {days} days</p></div>
            <span className="rounded-lg bg-[var(--color-primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">{number(overview.periodVisitors)} visitors</span>
          </div>
          {loading && !data ? <div className="flex h-56 items-center justify-center text-sm text-[var(--color-muted)]">Loading analytics…</div> : chart.length ? (
            <div className="mt-8 flex h-56 items-end gap-1.5 overflow-x-auto border-b border-[var(--color-border)] pb-2">
              {chart.map((item) => <div key={item._id} title={`${item._id}: ${item.visitors} visitors · ${item.pageViews} views`} className="group flex h-full min-w-[9px] flex-1 flex-col justify-end">
                <div className="w-full rounded-t-md bg-[var(--color-primary)]/75 transition-all group-hover:bg-[var(--color-primary)]" style={{ height: `${item.height}%`, minHeight: "3px" }} />
              </div>)}
            </div>
          ) : <div className="flex h-56 flex-col items-center justify-center text-center"><FiTrendingUp size={26} className="text-[var(--color-muted)]" /><p className="mt-3 text-sm font-semibold">No visitor data yet</p><p className="mt-1 text-xs text-[var(--color-muted)]">Visits will appear after tracking is active.</p></div>}
          <div className="mt-3 flex justify-between text-[10px] text-[var(--color-muted)]"><span>{chart[0]?._id || "—"}</span><span>{chart.at(-1)?._id || "—"}</span></div>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-lg font-bold">Traffic Sources</h2>
          <p className="mt-1 text-xs text-[var(--color-muted)]">Where visitors come from</p>
          <div className="mt-6 space-y-5">
            {(data?.sourceStats || []).length ? data.sourceStats.map((item) => {
              const total = data.sourceStats.reduce((sum, entry) => sum + entry.count, 0) || 1;
              return <div key={item._id}><div className="mb-2 flex justify-between text-sm"><span className="capitalize">{sourceLabels[item._id] || item._id}</span><strong>{Math.round(item.count / total * 100)}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-hover)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${item.count / total * 100}%` }} /></div></div>;
            }) : <p className="py-10 text-center text-xs text-[var(--color-muted)]">No source data yet</p>}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-lg font-bold">Devices</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Devices used by your audience</p>
          <div className="mt-6 space-y-4">
            {(data?.deviceStats || []).length ? data.deviceStats.map((item) => {
              const Icon = deviceIcons[item._id] || FiGlobe;
              return <div key={item._id} className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]"><Icon size={18} /></div><div className="min-w-0 flex-1"><div className="flex justify-between text-sm"><span className="capitalize">{item._id}</span><strong>{Math.round(item.count / deviceTotal * 100)}%</strong></div><div className="mt-2 h-1.5 rounded-full bg-[var(--color-surface-hover)]"><div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${item.count / deviceTotal * 100}%` }} /></div></div><span className="text-xs text-[var(--color-muted)]">{number(item.count)}</span></div>;
            }) : <p className="py-10 text-center text-xs text-[var(--color-muted)]">No device data yet</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="font-heading text-lg font-bold">Top Pages</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Most viewed pages in this period</p>
          <div className="mt-5 space-y-1">
            {(data?.topPages || []).length ? data.topPages.map((item, index) => <div key={item.page} className="flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-[var(--color-surface-hover)]"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm">{item.page}</span><span className="text-xs font-semibold">{number(item.views)} views</span></div>) : <p className="py-10 text-center text-xs text-[var(--color-muted)]">No page views yet</p>}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2"><div><h2 className="font-heading text-lg font-bold">Top Projects</h2><p className="mt-1 text-xs text-[var(--color-muted)]">Projects visitors clicked most</p></div><span className="text-[10px] text-[var(--color-muted)]">Updated {lastUpdated}</span></div>
        <div className="mt-4 divide-y divide-[var(--color-border)]">
          {(data?.topProjects || []).length ? data.topProjects.map((item, index) => <div key={item._id || index} className="flex items-center gap-3 py-3"><span className="text-xs font-bold text-[var(--color-muted)]">#{index + 1}</span><span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title || "Untitled project"}</span><span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)]"><FiMousePointer size={13} /> {number(item.clicks)} clicks</span></div>) : <p className="py-8 text-center text-xs text-[var(--color-muted)]">Project click data will appear here.</p>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-4 text-sm"><div className="flex items-center gap-2 text-[var(--color-muted)]"><FiDownload /> Resume downloads <strong className="ml-auto text-[var(--color-text)]">{number(overview.resumeDownloads)}</strong></div><div className="flex items-center gap-2 text-[var(--color-muted)]"><FiFileText /> Contact conversions <strong className="ml-auto text-[var(--color-text)]">{number(overview.contactSubmissions)}</strong></div></div>
      </section>
      <p className="text-right text-[10px] text-[var(--color-muted)]">Dashboard refreshes every 30 seconds · Live visitors use a 90-second activity window.</p>
    </div>
  );
};

export default Analytics;
