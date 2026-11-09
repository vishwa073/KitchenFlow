
import { Search } from "lucide-react";

type OutletOption = {
  id: string;
  name: string;
};

type MenuFiltersProps = {
  search: string;
  outletId: string;
  category: string;
  showUnavailable: boolean;
  outlets: OutletOption[];
  categories: string[];
  onSearchChange: (value: string) => void;
  onOutletChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onShowUnavailableChange: (value: boolean) => void;
};

export default function MenuFilters({
  search,
  category,
  showUnavailable,
  categories,
  onSearchChange,
  onCategoryChange,
  onShowUnavailableChange,
}: MenuFiltersProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search menu items..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-orange-500"
        >
          <option value="All">All categories</option>

          {categories
            .filter((item) => item !== "All")
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>

        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={showUnavailable}
            onChange={(event) =>
              onShowUnavailableChange(event.target.checked)
            }
            className="h-4 w-4 accent-orange-600"
          />

          Show unavailable items
        </label>
      </div>
    </div>
  );
}
