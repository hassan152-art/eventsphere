export function CardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 bg-slate-100 dark:bg-white/5" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-slate-100 dark:bg-white/5 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 dark:bg-white/5 rounded" />
        <div className="h-3 w-1/2 bg-slate-100 dark:bg-white/5 rounded" />
        <div className="h-3 w-2/3 bg-slate-100 dark:bg-white/5 rounded" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function RowSkeleton() {
  return <div className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />;
}
