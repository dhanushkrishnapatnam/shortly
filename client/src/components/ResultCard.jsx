import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { copyToClipboard, formatDate, truncate } from "../utils/helpers";

export default function ResultCard({ data, onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(data.shortUrl);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleDownloadQr = () => {
    const a = document.createElement("a");
    a.href = data.qrCode;
    a.download = `shortly-${data.shortCode}.png`;
    a.click();
    toast.success("QR code downloaded!");
  };

  return (
    <div className="card animate-fade-up border-brand-200 dark:border-brand-900/50 relative overflow-hidden">
      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-400 via-brand-500 to-brand-400" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M20 6L9 17l-5-5"/></svg>
              Ready
            </span>
            {data.expiresAt && (
              <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                Expires {formatDate(data.expiresAt)}
              </span>
            )}
          </div>
          <p className="text-xs mt-1 max-w-sm" style={{ color: "var(--text-muted)" }}>
            {truncate(data.originalUrl, 60)}
          </p>
        </div>
        <button onClick={onDismiss} className="btn-ghost w-8 h-8 p-0 shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Short URL display */}
      <div
        className="flex items-center gap-3 rounded-xl p-3 border mb-4"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <span className="flex-1 font-mono text-brand-500 font-semibold text-sm sm:text-base truncate">
          {data.shortUrl}
        </span>
        <button
          onClick={handleCopy}
          className={`btn-secondary shrink-0 text-xs py-1.5 px-3 transition-all ${
            copied ? "border-green-400 text-green-600 dark:text-green-400" : ""
          }`}
        >
          {copied ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <Link to={`/stats/${data.shortCode}`} className="btn-secondary text-xs py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Analytics
        </Link>

        {data.qrCode && (
          <button
            onClick={() => setShowQr((v) => !v)}
            className="btn-secondary text-xs py-2"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/></svg>
            QR Code
          </button>
        )}

        <a
          href={data.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-xs py-2"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Visit
        </a>
      </div>

      {/* QR Code panel */}
      {showQr && data.qrCode && (
        <div className="mt-4 pt-4 border-t flex flex-col items-center gap-3 animate-fade-up" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Scan to visit</p>
          <div className="p-3 bg-white rounded-xl shadow-sm">
            <img src={data.qrCode} alt="QR Code" className="w-40 h-40" />
          </div>
          <button onClick={handleDownloadQr} className="btn-secondary text-xs py-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}
