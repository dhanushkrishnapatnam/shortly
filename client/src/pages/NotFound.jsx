import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-up">
      <div
        className="font-display font-extrabold text-[8rem] leading-none mb-4 select-none"
        style={{ color: "var(--border)" }}
      >
        404
      </div>
      <h1 className="font-display font-bold text-2xl mb-2" style={{ color: "var(--text)" }}>
        Page not found
      </h1>
      <p className="text-sm mb-8 max-w-xs" style={{ color: "var(--text-muted)" }}>
        The page you're looking for doesn't exist, or maybe the link has expired.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="btn-primary">
          Go Home
        </Link>
        <Link to="/dashboard" className="btn-secondary">
          Dashboard
        </Link>
      </div>
    </div>
  );
}
