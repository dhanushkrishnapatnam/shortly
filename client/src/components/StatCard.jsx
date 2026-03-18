export default function StatCard({ label, value, icon, sub, color = "brand" }) {
  const colorMap = {
    brand: "text-brand-500 bg-brand-50 dark:bg-brand-900/20",
    green: "text-green-600 bg-green-50 dark:bg-green-900/20",
    blue: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    purple: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
            {label}
          </p>
          <p className="font-display font-bold text-3xl" style={{ color: "var(--text)" }}>
            {value}
          </p>
          {sub && (
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {sub}
            </p>
          )}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
