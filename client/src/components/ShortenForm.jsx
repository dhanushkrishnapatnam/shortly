import { useState } from "react";
import toast from "react-hot-toast";
import { shortenUrl } from "../utils/api";
import { addLink } from "../utils/tokenStore";
import { isValidUrl } from "../utils/helpers";

export default function ShortenForm({ onSuccess }) {
  const [url, setUrl]               = useState("");
  const [alias, setAlias]           = useState("");
  const [expiresAt, setExpiresAt]   = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [urlError, setUrlError]     = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setUrlError("Please enter a URL"); return; }
    if (!isValidUrl(trimmed)) { setUrlError("Enter a valid URL starting with http:// or https://"); return; }

    setLoading(true);
    try {
      const result = await shortenUrl({
        url: trimmed,
        alias: alias.trim() || undefined,
        expiresAt: expiresAt || undefined,
      });

      const { shortCode, manageToken } = result.data;

      // Store the ownership token in this browser
      addLink(shortCode, manageToken);

      onSuccess(result.data);
      toast.success("Link shortened!");
      setUrl(""); setAlias(""); setExpiresAt(""); setShowAdvanced(false);
    } catch (err) {
      toast.error(err.message || "Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setUrlError(""); }}
              placeholder="Paste your long URL here…"
              className={`input pl-10 ${urlError ? "border-red-400" : ""}`}
              disabled={loading}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary whitespace-nowrap px-6" disabled={loading}>
            {loading ? (
              <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Shortening…</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg> Shorten</>
            )}
          </button>
        </div>
        {urlError && <p className="mt-1.5 text-xs text-red-500 animate-fade-in">{urlError}</p>}
      </div>

      <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="btn-ghost text-xs px-2 py-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
        {showAdvanced ? "Hide" : "Show"} advanced options
      </button>

      {showAdvanced && (
        <div className="grid sm:grid-cols-2 gap-3 animate-fade-up pt-1">
          <div>
            <label className="label">Custom alias (optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono select-none" style={{ color: "var(--text-muted)" }}>shortly/</span>
              <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)}
                placeholder="my-link" className="input pl-20 font-mono text-sm"
                disabled={loading} maxLength={30} />
            </div>
          </div>
          <div>
            <label className="label">Expiry date (optional)</label>
            <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)}
              min={minDateStr} className="input" disabled={loading} />
          </div>
        </div>
      )}
    </form>
  );
}
