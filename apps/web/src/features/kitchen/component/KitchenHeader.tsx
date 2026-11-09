import KitchenFilters from "./KitchenFilters";

type Outlet = {
  id: string;
  name: string;
};

type KitchenHeaderProps = {
  outlets: Outlet[];
  selectedOutlet: string;
  onOutletChange: (outletId: string) => void;
  onSignOut: () => void;
};

export default function KitchenHeader({
  outlets,
  selectedOutlet,
  onOutletChange,
  onSignOut,
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
      <button
        type="button"
        onClick={onSignOut}
        className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
      >
        Sign out
      </button>
    </header>
  );
}
