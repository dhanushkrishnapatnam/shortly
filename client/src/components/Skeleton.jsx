export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="flex gap-3">
        <div className="skeleton w-8 h-8 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-24 rounded" />
          <div className="skeleton h-3 w-3/4 rounded" />
        </div>
        <div className="skeleton h-8 w-12 rounded" />
      </div>
      <div className="skeleton h-px w-full rounded" />
      <div className="flex gap-2">
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-16 rounded-lg" />
        <div className="skeleton h-7 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card">
      <div className="skeleton h-3 w-20 rounded mb-3" />
      <div className="skeleton h-8 w-16 rounded" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-32 rounded mb-6" />
      <div className="skeleton h-48 w-full rounded-xl" />
    </div>
  );
}
