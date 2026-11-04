
import { Eye, EyeOff, Pencil, Trash2, Utensils } from "lucide-react";
import type { MenuItem } from "../../../menu/types/menu";

type OutletOption = {
  id: string;
  name: string;
};

type MenuItemsTableProps = {
  items: MenuItem[];
  outlets: OutletOption[];
  onEdit: (item: MenuItem) => void;
  onToggleAvailability: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MenuItemsTable({
  items,
  outlets,
  onEdit,
  onToggleAvailability,
  onDelete,
}: MenuItemsTableProps) {
  const getOutletName = (outletId: string) =>
    outlets.find((outlet) => outlet.id === outletId)?.name ??
    "Unknown outlet";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Menu items</h2>
        <p className="mt-1 text-xs text-slate-500">
          {items.length} items displayed
        </p>
      </div>

      {items.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <Utensils className="mx-auto text-slate-300" size={36} />

          <h3 className="mt-3 font-semibold text-slate-800">
            No menu items found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing the search or filter options.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Item</th>
                <th className="px-5 py-4 font-semibold">Outlet</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Price</th>
                <th className="px-5 py-4 font-semibold">Availability</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded-xl object-cover"
                      />

                      <div>
                        <p className="font-medium text-slate-900">
                          {item.name}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2">
                          {item.isVegetarian && (
                            <span className="text-xs text-emerald-600">
                              Vegetarian
                            </span>
                          )}

                          {item.isPopular && (
                            <span className="text-xs text-orange-600">
                              Popular
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {getOutletName(item.outletId)}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {item.category}
                  </td>

                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                    ₹{item.price.toFixed(2)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        item.isAvailable
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {item.isAvailable ? "Available" : "Unavailable"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(item)}
                        title="Edit item"
                        aria-label={`Edit ${item.name}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleAvailability(item.id)}
                        title={
                          item.isAvailable
                            ? "Mark unavailable"
                            : "Mark available"
                        }
                        aria-label={`Toggle availability for ${item.name}`}
                        className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
                      >
                        {item.isAvailable ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        title="Delete item"
                        aria-label={`Delete ${item.name}`}
                        className="rounded-lg border border-rose-100 p-2 text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
