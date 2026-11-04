type Outlet = {
  id: string;
  name: string;
};

type KitchenFiltersProps = {
  outlets: Outlet[];
  selectedOutlet: string;
  onOutletChange: (outletId: string) => void;
};

export default function KitchenFilters({
  outlets,
  selectedOutlet,
  onOutletChange,
}: KitchenFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor="kitchen-outlet"
        className="text-sm font-medium text-gray-600"
      >
        Outlet
      </label>

      <select
        id="kitchen-outlet"
        value={selectedOutlet}
        onChange={(event) => onOutletChange(event.target.value)}
        className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
      >
        {outlets.map((outlet) => (
          <option key={outlet.id} value={outlet.id}>
            {outlet.name}
          </option>
        ))}
      </select>
    </div>
  );
}