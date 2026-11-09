import type { AdminOutlet } from "../services/AdminService";

type AdminOverviewProps = {
  outlets: AdminOutlet[];
  onViewOutlets: () => void;
};

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-lg text-orange-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </div>
  );
}

export default function AdminOverview({
  outlets,
  onViewOutlets,
}: AdminOverviewProps) {
  const totalOrders = outlets.reduce(
    (total, outlet) => total + (outlet._count?.orders ?? 0),
    0,
  );

  const totalStaff = outlets.reduce(
    (total, outlet) => total + (outlet._count?.staff ?? 0),
    0,
  );

  const totalMenuItems = outlets.reduce(
    (total, outlet) => total + (outlet._count?.menuItems ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-5">
          <h2 className="text-lg font-bold text-slate-900">
            Platform overview
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            A quick overview of the outlets currently registered in KitchenFlow.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total outlets"
            value={outlets.length}
            detail="Registered outlets"
            icon="⌂"
          />

          <MetricCard
            label="Total orders"
            value={totalOrders}
            detail="Orders across all outlets"
            icon="▤"
          />

          <MetricCard
            label="Total staff"
            value={totalStaff}
            detail="Staff assigned to outlets"
            icon="♙"
          />

          <MetricCard
            label="Menu items"
            value={totalMenuItems}
            detail="Menu items across outlets"
            icon="☷"
          />
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 ring-1 ring-slate-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900">
              Outlet management
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              View outlet locations and their associated data.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewOutlets}
            className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
          >
            View outlets
          </button>
        </div>
      </section>
    </div>
  );
}