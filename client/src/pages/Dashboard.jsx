import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getBatchUrls, deleteUrl } from "../utils/api";
import { getAllLinks, removeLink, getLinkCount } from "../utils/tokenStore";
import UrlCard from "../components/UrlCard";
import { SkeletonCard } from "../components/Skeleton";
import { formatNumber } from "../utils/helpers";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [urls, setUrls]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchUrls = useCallback(async () => {
    setLoading(true);
    try {
      const stored = getAllLinks(); // [{ shortCode, manageToken }]
      if (stored.length === 0) { setUrls([]); return; }

      const res = await getBatchUrls(stored);
      setUrls(res.data);
    } catch (err) {
      toast.error(err.message || "Failed to load your links");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const handleDelete = async (shortCode, manageToken) => {
    if (!confirm(`Deactivate /${shortCode}? This cannot be undone.`)) return;
    try {
      await deleteUrl(shortCode, manageToken);
      removeLink(shortCode);
      setUrls((prev) => prev.filter((u) => u.shortCode !== shortCode));
      toast.success("Link deactivated");
    } catch (err) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const storedLinks = getAllLinks();
  const tokenMap    = Object.fromEntries(storedLinks.map((l) => [l.shortCode, l.manageToken]));

  const filtered = search.trim()
    ? urls.filter((u) =>
        u.shortCode.includes(search) ||
        u.originalUrl.toLowerCase().includes(search.toLowerCase())
      )
    : urls;

  const totalClicks = urls.reduce((sum, u) => sum + u.totalClicks, 0);
  const linkCount   = getLinkCount();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: "var(--text)" }}>
            Your Links
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {linkCount} link{linkCount !== 1 ? "s" : ""} saved in this browser
            {urls.length > 0 && ` · ${formatNumber(totalClicks)} total clicks`}
          </p>
        </div>

        {urls.length > 0 && (
          <div className="relative w-full sm:w-64">
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search links…" className="input pl-9 py-2 text-sm" />
          </div>
        )}
      </div>

      {/* Privacy notice */}
      <div
        className="rounded-xl border p-3 flex gap-2.5 items-start mb-6 text-xs"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <svg className="shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        <span>
          These links are stored in <strong>this browser only</strong>. Clearing your browser data or switching devices will lose access to managing them.
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState search={search} linkCount={linkCount} />
      ) : (
        <div className="grid gap-4 animate-fade-in">
          {filtered.map((url) => (
            <UrlCard
              key={url.id}
              url={url}
              manageToken={tokenMap[url.shortCode]}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ search, linkCount }) {
  if (search) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <p className="font-semibold" style={{ color: "var(--text)" }}>No links match "{search}"</p>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Try a different search term</p>
      </div>
    );
  }
  return (
    <div className="text-center py-24 animate-fade-in">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-2)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--text-muted)" }}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      <h3 className="font-semibold text-base mb-1" style={{ color: "var(--text)" }}>No links yet</h3>
      <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
        Shorten your first URL and it'll appear here automatically.
      </p>
      <Link to="/" className="btn-primary">Shorten a link</Link>
    </div>
  );
}
