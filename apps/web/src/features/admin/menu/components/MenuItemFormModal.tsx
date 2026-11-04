
import { X } from "lucide-react";
import type { MenuFormData } from "../types/menuForm";
import type { MenuItem } from "../../../menu/types/menu";

type OutletOption = {
  id: string;
  name: string;
};

type MenuItemFormModalProps = {
  isOpen: boolean;
  editingItem: MenuItem | null;
  form: MenuFormData;
  outlets: OutletOption[];
  categories: string[];
  onChange: <K extends keyof MenuFormData>(
    key: K,
    value: MenuFormData[K]
  ) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
};

export default function MenuItemFormModal({
  isOpen,
  editingItem,
  form,
  outlets,
  categories,
  onChange,
  onSubmit,
  onClose,
}: MenuItemFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingItem ? "Edit menu item" : "Add menu item"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the menu item details below.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Item name
            </label>

            <input
              required
              value={form.name}
              onChange={(event) => onChange("name", event.target.value)}
              placeholder="e.g. Chicken Biryani"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(event) =>
                onChange("description", event.target.value)
              }
              placeholder="Describe the menu item..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Price (₹)
              </label>

              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={form.price}
                onChange={(event) => onChange("price", event.target.value)}
                placeholder="199"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category
              </label>

              <input
                required
                list="menu-category-options"
                value={form.category}
                onChange={(event) =>
                  onChange("category", event.target.value)
                }
                placeholder="e.g. Biryani"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />

              <datalist id="menu-category-options">
                {categories
                  .filter((category) => category !== "All")
                  .map((category) => (
                    <option key={category} value={category} />
                  ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Outlet
            </label>

            <select
              required
              value={form.outletId}
              onChange={(event) =>
                onChange("outletId", event.target.value)
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-500"
            >
              <option value="">Select outlet</option>

              {outlets.map((outlet) => (
                <option key={outlet.id} value={outlet.id}>
                  {outlet.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isVegetarian}
                onChange={(event) =>
                  onChange("isVegetarian", event.target.checked)
                }
                className="h-4 w-4 accent-orange-600"
              />
              Vegetarian
            </label>

            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(event) =>
                  onChange("isPopular", event.target.checked)
                }
                className="h-4 w-4 accent-orange-600"
              />
              Mark as popular
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              {editingItem ? "Save changes" : "Add menu item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
