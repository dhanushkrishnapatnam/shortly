import { Outlet, NavLink, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      </div>
      <span className="font-display font-bold text-xl" style={{ color: "var(--text)" }}>
        Shortly
      </span>
    </Link>
  );
}

export default function Layout() {
  const { isDark, toggle } = useTheme();

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-150 ${
      isActive
        ? "bg-brand-500/10 text-brand-500"
        : "hover:bg-[var(--surface-2)]"
    }`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      {/* Navbar */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md"
        style={{
          background: "rgba(var(--bg-rgb, 250,250,248), 0.85)",
          borderColor: "var(--border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Logo />

          <nav className="flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
            <NavLink to="/" end className={navLinkClass}>
              Shorten
            </NavLink>
            <NavLink to="/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
          </nav>

          <button
            onClick={toggle}
            className="btn-ghost w-9 h-9 p-0 rounded-lg"
            aria-label="Toggle theme"
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer
        className="border-t py-6 text-center text-xs"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        <p>
          Built with ♥ by Dhanush &nbsp;·&nbsp;{" "}
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-500 transition-colors"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
