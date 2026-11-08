// apps/web/src/features/outlets/components/OutletGrid.tsx
// Replace the complete file with this:

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
  if (outlets.length === 0) return null;

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