import type { Outlet } from "../types/outlet";
import OutletCard from "./OutletCard";

interface OutletGridProps {
  outlets: Outlet[];
  onSelectOutlet: (outlet: Outlet) => void;
}

export default function OutletGrid({
  outlets,
  onSelectOutlet,
}: OutletGridProps) {
  if (outlets.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 py-16 text-center">
        <h3 className="text-lg font-semibold text-stone-800">
          No outlets found
        </h3>
        <p className="mt-2 text-sm text-stone-500">
          Try another search term or category.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {outlets.map((outlet) => (
        <OutletCard
          key={outlet.id}
          outlet={outlet}
          onSelect={onSelectOutlet}
        />
      ))}
    </div>
  );
}