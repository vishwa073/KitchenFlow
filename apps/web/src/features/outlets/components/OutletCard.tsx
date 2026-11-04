import type { Outlet } from "../types/outlet";
import { Clock3, Star } from "lucide-react";

interface OutletCardProps {
  outlet: Outlet;
  onSelect: (outlet: Outlet) => void;
}

export default function OutletCard({
  outlet,
  onSelect,
}: OutletCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(outlet)}
      disabled={!outlet.isAvailable}
      className="group w-full overflow-hidden rounded-2xl border border-stone-200 bg-white text-left transition hover:-translate-y-1 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <img
          src={outlet.image}
          alt={outlet.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {!outlet.isAvailable && (
          <span className="absolute left-3 top-3 rounded-full bg-stone-800 px-3 py-1 text-xs font-medium text-white">
            Currently unavailable
          </span>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-stone-900">
              {outlet.name}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {outlet.category}
            </p>
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-sm font-medium text-emerald-700">
            <Star size={14} fill="currentColor" />
            {outlet.rating}
          </span>
        </div>

        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-stone-600">
          {outlet.description}
        </p>

        <div className="flex items-center justify-between border-t border-stone-100 pt-3 text-sm text-stone-500">
          <span className="flex items-center gap-1.5">
            <Clock3 size={15} />
            {outlet.deliveryTime}
          </span>

          <span>
            ₹{outlet.priceForOne} <span className="text-xs">for one</span>
          </span>
        </div>
      </div>
    </button>
  );
}