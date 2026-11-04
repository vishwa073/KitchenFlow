import { Search, X } from "lucide-react";

interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MenuSearch({
  value,
  onChange,
}: MenuSearchProps) {
  return (
    <div className="relative w-full md:max-w-xs">
      <Search
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search menu items..."
        aria-label="Search menu items"
        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}