type AdminHeaderProps = {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  refreshing: boolean;
};

export default function AdminHeader({
  title,
  subtitle,
  onRefresh,
  refreshing,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          Admin console
        </p>

        <h1 className="mt-1 text-xl font-bold text-slate-900">
          {title}
        </h1>

        <p className="mt-1 hidden text-sm text-slate-500 sm:block">
          {subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
      >
        {refreshing ? "Refreshing..." : "Refresh"}
      </button>
    </header>
  );
}