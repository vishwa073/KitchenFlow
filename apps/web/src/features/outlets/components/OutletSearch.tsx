import { Search } from "lucide-react";
import type { OutletCategory } from "../types/outlet";

interface OutletSearchProps {
  search: string;
  category: OutletCategory;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: OutletCategory) => void;
}

const categories: OutletCategory[] = [
  "All",
  "South Indian",
  "North Indian",
  "Fast Food",
  "Cafe",
];

export default function OutletSearch({
  search,
  category,
  onSearchChange,
  onCategoryChange,
}: OutletSearchProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search outlets or cuisines..."
          className="w-full rounded-xl border border-stone-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onCategoryChange(item)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              category === item
                ? "bg-orange-600 text-white"
                : "border border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}