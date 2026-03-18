import { useState } from "react";
import ShortenForm from "../components/ShortenForm";
import ResultCard from "../components/ResultCard";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Real-time Analytics",
    desc: "Track clicks, locations, and timestamps for every link you create.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "Private by Default",
    desc: "No account needed. Each link gets a secret token — only you can manage it.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Custom Aliases",
    desc: "Create branded, memorable short links instantly.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="3" height="3"/>
      </svg>
    ),
    title: "QR Code Generation",
    desc: "Auto-generated QR codes ready to download for every link.",
  },
];

export default function Home() {
  const [result, setResult] = useState(null);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-12 animate-fade-up">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
          No sign-up · Your links stay private
        </div>

        <h1
          className="font-display font-extrabold text-4xl sm:text-6xl leading-tight mb-4 text-balance"
          style={{ color: "var(--text)" }}
        >
          Links that work{" "}
          <span className="text-brand-500">smarter</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto text-balance" style={{ color: "var(--text-muted)" }}>
          Shorten, customize, and track your URLs — privately. No account needed, ever.
        </p>
      </div>

      {/* Shorten form */}
      <div
        className="card shadow-lg shadow-black/5 dark:shadow-black/20 mb-6 animate-fade-up"
        style={{ animationDelay: "0.1s", border: "1.5px solid var(--border)" }}
      >
        <ShortenForm onSuccess={(data) => setResult(data)} />
      </div>

      {/* Result */}
      {result && (
        <div className="mb-10">
          <ResultCard data={result} onDismiss={() => setResult(null)} />
        </div>
      )}

      {/* Privacy callout */}
      <div
        className="rounded-2xl border p-4 flex gap-3 items-start mb-10 animate-fade-up"
        style={{ background: "var(--surface)", borderColor: "var(--border)", animationDelay: "0.15s" }}
      >
        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center shrink-0 text-brand-500">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div>
          <p className="text-sm font-semibold mb-0.5" style={{ color: "var(--text)" }}>How privacy works</p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            When you shorten a link, a secret token is saved in <strong>this browser only</strong>. 
            Your dashboard shows links from this browser — nobody else can see or manage them. 
            Don't clear your browser data, or export your links first.
          </p>
        </div>
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: "0.2s" }}>
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="p-4 rounded-2xl border transition-all duration-200 hover:shadow-sm group"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 text-brand-500 transition-transform group-hover:scale-105"
              style={{ background: "var(--surface-2)" }}
            >
              {f.icon}
            </div>
            <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text)" }}>{f.title}</h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
