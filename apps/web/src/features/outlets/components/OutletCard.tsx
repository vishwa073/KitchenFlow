
import { useState } from "react";
import { Clock3, Star, ArrowRight } from "lucide-react";
import type { Outlet } from "../types/outlet";

interface OutletCardProps {
  outlet: Outlet;
  onSelect: (outlet: Outlet) => void;
}

export default function OutletCard({ outlet, onSelect }: OutletCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const isOutletAvailable = outlet.isAvailable ?? outlet.isActive;

  function handleViewMenu() {
    if (!isOutletAvailable) return;

    onSelect(outlet);
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-52 overflow-hidden bg-orange-50">
        {outlet.image && !imageFailed ? (
          <img
            src={outlet.image}
            alt={outlet.name}
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-orange-50 via-amber-50 to-stone-100">
            <span className="text-6xl">🍽️</span>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold text-white ${
              isOutletAvailable ? "bg-emerald-600" : "bg-stone-700"
            }`}
          >
            {isOutletAvailable ? "Available for delivery" : "Currently closed"}
          </span>
        </div>

        {outlet.category && (
          <div className="absolute bottom-3 left-3">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-stone-800 backdrop-blur">
              {outlet.category}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-stone-900">
              {outlet.name}
            </h3>

            {outlet.description && (
              <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-500">
                {outlet.description}
              </p>
            )}
          </div>

          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700">
            <Star size={14} fill="currentColor" />
            {outlet.rating}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="flex items-center gap-2 text-sm text-stone-500">
            <Clock3 size={16} />
            {outlet.deliveryTime || "Delivery time varies"}
          </span>

          <span className="text-sm font-medium text-stone-700">
            ₹{outlet.priceForOne || "—"}
            <span className="ml-1 text-xs font-normal text-stone-400">
              for one
            </span>
          </span>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-[#f0f0ed] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-emerald-700">
            ✓ Available for your delivery location
          </p>

          <button
            type="button"
            onClick={handleViewMenu}
            disabled={!isOutletAvailable}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            View menu
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
