import KitchenFilters from "./KitchenFilters";

type Outlet = {
  id: string;
  name: string;
};

type KitchenHeaderProps = {
  outlets: Outlet[];
  selectedOutlet: string;
  onOutletChange: (outletId: string) => void;
};

export default function KitchenHeader({
  outlets,
  selectedOutlet,
  onOutletChange,
}: KitchenHeaderProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Kitchen Display System
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Manage incoming orders and kitchen preparation.
        </p>
      </div>

      <KitchenFilters
        outlets={outlets}
        selectedOutlet={selectedOutlet}
        onOutletChange={onOutletChange}
      />
    </header>
  );
}