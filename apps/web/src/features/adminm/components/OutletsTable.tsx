import type { AdminOutlet } from "../services/AdminService";

type OutletsTableProps = {
  outlets: AdminOutlet[];
  onAddOutlet: () => void;
};

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-xl text-slate-500">
        ⌂
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        No outlets found
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        Create your first outlet using the Add outlet button.
      </p>
    </div>
  );
}

export default function OutletsTable({
  outlets,
  onAddOutlet,
}: OutletsTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h2 className="font-bold text-slate-900">All outlets</h2>

          <p className="mt-1 text-sm text-slate-500">
            Outlets registered in the KitchenFlow platform.
          </p>
        </div>

        <button
          type="button"
          onClick={onAddOutlet}
          className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700"
        >
          + Add outlet
        </button>
      </div>

      {outlets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-h-105 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Outlet</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Staff</th>
                <th className="px-5 py-3">Menu items</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {outlets.map((outlet) => (
                <tr
                  key={outlet.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {outlet.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {outlet.code}
                      {outlet.isCloudKitchen ? " · Cloud kitchen" : ""}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-slate-700">
                      {outlet.area}
                      {outlet.city?.name ? `, ${outlet.city.name}` : ""}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {outlet.city?.state ?? ""}
                    </p>
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-700">
                    {outlet._count?.orders ?? 0}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {outlet._count?.staff ?? 0}
                  </td>

                  <td className="px-5 py-4 text-slate-700">
                    {outlet._count?.menuItems ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}