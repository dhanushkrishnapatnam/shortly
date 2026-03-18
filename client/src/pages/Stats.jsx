import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import toast from "react-hot-toast";
import { getStats } from "../utils/api";
import { getToken } from "../utils/tokenStore";
import StatCard from "../components/StatCard";
import { SkeletonStatCard, SkeletonChart } from "../components/Skeleton";
import { formatNumber, formatDatetime, truncate, copyToClipboard, timeAgo } from "../utils/helpers";

const CHART_COLOR = "#f97316";

export default function Stats() {
  const { code }     = useParams();
  const navigate     = useNavigate();
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [noAccess, setNoAccess] = useState(false);

  useEffect(() => {
    const token = getToken(code);
    if (!token) {
      setNoAccess(true);
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await getStats(code, token);
        setStats(res.data);
      } catch (err) {
        if (err.message.includes("not found") || err.message.includes("invalid token")) {
          setNoAccess(true);
        } else {
          toast.error(err.message || "Failed to load stats");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [code]);

  const handleCopy = async () => {
    if (!stats) return;
    try {
      await copyToClipboard(stats.shortUrl);
      setCopied(true);
      toast.success("Copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error("Failed to copy"); }
  };

  if (loading) return <LoadingSkeleton />;

  if (noAccess) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto px-4 animate-fade-up">
        <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-500"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="font-display font-bold text-xl mb-2" style={{ color: "var(--text)" }}>Access denied</h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
          You can only view stats for links created in this browser. The manage token for <code className="font-mono">/{code}</code> wasn't found here.
        </p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  if (!stats) return null;

  const clicksByDay = stats.clicksByDay || {};
  const chartData = getLast30Days().map((day) => ({
    date: day, clicks: clicksByDay[day] || 0, label: formatDayLabel(day),
  }));

  const countryData = Object.entries(stats.clicksByCountry || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([country, clicks]) => ({ country, clicks }));

  const isExpired = stats.isExpired;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        <Link to="/dashboard" className="hover:text-brand-500 transition-colors">Dashboard</Link>
        <span>/</span>
        <span className="font-mono text-brand-500">{code}</span>
      </div>

      {/* Header card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono font-bold text-xl text-brand-500">{stats.shortUrl}</span>
              {isExpired && <span className="badge bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-xs">Expired</span>}
            </div>
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>{truncate(stats.originalUrl, 80)}</p>
            <div className="flex flex-wrap gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
              <span>Created {timeAgo(stats.createdAt)}</span>
              {stats.expiresAt && <span>· {isExpired ? "Expired" : "Expires"} {formatDatetime(stats.expiresAt)}</span>}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleCopy} className={`btn-secondary text-sm py-2 ${copied ? "border-green-400 text-green-600" : ""}`}>
              {copied ? "✓ Copied" : "Copy Link"}
            </button>
            <a href={stats.originalUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2">Visit →</a>
          </div>
        </div>

        {stats.qrCode && (
          <div className="mt-4 pt-4 border-t flex items-center gap-4" style={{ borderColor: "var(--border)" }}>
            <div className="p-2 bg-white rounded-xl border" style={{ borderColor: "var(--border)" }}>
              <img src={stats.qrCode} alt="QR" className="w-20 h-20" />
            </div>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text)" }}>QR Code</p>
              <a href={stats.qrCode} download={`shortly-${code}.png`} className="btn-secondary text-xs py-1.5"
                onClick={() => toast.success("Downloaded!")}>Download PNG</a>
            </div>
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Clicks" value={formatNumber(stats.totalClicks)} color="brand"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
        <StatCard label="Countries" value={formatNumber(Object.keys(stats.clicksByCountry || {}).length)} color="blue"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>} />
        <StatCard label="Today" value={formatNumber(clicksByDay[today()] || 0)} color="green"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
        <StatCard label="Avg / Day"
          value={stats.totalClicks > 0 ? formatNumber(Math.round(stats.totalClicks / Math.max(1, daysSince(stats.createdAt)))) : "0"}
          color="purple"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>} />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="card lg:col-span-2">
          <h2 className="font-semibold text-base mb-5" style={{ color: "var(--text)" }}>Clicks over time (last 30 days)</h2>
          {stats.totalClicks === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clickGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLOR} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 13 }} formatter={(v) => [v, "Clicks"]} />
                <Area type="monotone" dataKey="clicks" stroke={CHART_COLOR} strokeWidth={2} fill="url(#clickGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: CHART_COLOR }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-base mb-5" style={{ color: "var(--text)" }}>Top countries</h2>
          {countryData.length === 0 ? <NoData /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={countryData} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="country" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: "12px", fontSize: 13 }} />
                <Bar dataKey="clicks" radius={[0, 6, 6, 0]}>
                  {countryData.map((_, i) => <Cell key={i} fill={CHART_COLOR} fillOpacity={1 - i * 0.08} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-base mb-4" style={{ color: "var(--text)" }}>Recent clicks</h2>
          {(stats.recentClicks || []).length === 0 ? <NoData /> : (
            <div className="space-y-3 overflow-y-auto max-h-[240px] scrollbar-thin pr-1">
              {stats.recentClicks.map((click, i) => (
                <div key={i} className="flex items-center justify-between text-sm py-2 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <div>
                    <div className="font-medium" style={{ color: "var(--text)" }}>
                      {click.country}{click.city !== "Unknown" ? ` · ${click.city}` : ""}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{formatDatetime(click.timestamp)}</div>
                  </div>
                  {click.referrer && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                      {truncate(click.referrer.replace(/https?:\/\//, ""), 20)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoData() {
  return <div className="flex items-center justify-center h-32 text-sm" style={{ color: "var(--text-muted)" }}>No data yet — share your link!</div>;
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="skeleton h-4 w-40 rounded" />
      <div className="card"><div className="skeleton h-6 w-48 rounded mb-3" /><div className="skeleton h-4 w-full rounded mb-2" /></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}</div>
      <div className="grid lg:grid-cols-2 gap-6"><SkeletonChart /><SkeletonChart /></div>
    </div>
  );
}

function getLast30Days() {
  return Array.from({ length: 30 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });
}
function formatDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function today() { return new Date().toISOString().split("T")[0]; }
function daysSince(dateStr) { return Math.max(1, Math.floor((Date.now() - new Date(dateStr)) / 86400000)); }
