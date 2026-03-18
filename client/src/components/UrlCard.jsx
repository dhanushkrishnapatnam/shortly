import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { copyToClipboard, truncate, formatDate, formatNumber, timeAgo } from "../utils/helpers";

export default function UrlCard({ url, manageToken, onDelete }) {
  const handleCopy = async () => {
    try { await copyToClipboard(url.shortUrl); toast.success("Copied!"); }
    catch { toast.error("Failed to copy"); }
  };

  const isExpired = url.isExpired || (url.expiresAt && new Date() > new Date(url.expiresAt));

  return (
    <div className={`card transition-all duration-200 hover:shadow-sm group ${isExpired ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Favicon */}
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <img src={`https://www.google.com/s2/favicons?domain=${url.originalUrl}&sz=32`} alt=""
            className="w-5 h-5" onError={(e) => { e.target.style.display = "none"; }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-brand-500 font-semibold text-sm">{url.shortCode}</span>
            {url.alias && <span className="badge text-[10px]" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>alias</span>}
            {isExpired && <span className="badge text-[10px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">expired</span>}
          </div>
          <p className="text-sm truncate" style={{ color: "var(--text)" }}>{truncate(url.originalUrl, 55)}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>{timeAgo(url.createdAt)}</span>
            {url.expiresAt && !isExpired && (
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>· Expires {formatDate(url.expiresAt)}</span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-display font-bold text-lg" style={{ color: "var(--text)" }}>{formatNumber(url.totalClicks)}</div>
          <div className="text-xs" style={{ color: "var(--text-muted)" }}>clicks</div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <button onClick={handleCopy} className="btn-ghost text-xs py-1.5 px-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Copy
        </button>

        <Link to={`/stats/${url.shortCode}`} className="btn-ghost text-xs py-1.5 px-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Stats
        </Link>

        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost text-xs py-1.5 px-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open
        </a>

        <button
          onClick={() => onDelete(url.shortCode, manageToken)}
          className="btn-ghost text-xs py-1.5 px-3 ml-auto text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          Delete
        </button>
      </div>
    </div>
  );
}
