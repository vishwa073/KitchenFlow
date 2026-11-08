
import { MapPin } from "lucide-react";

import LocationPicker, {
  type Coordinates,
} from "../../onboarding/components/LocationPicker";

interface LocationSelectorProps {
  value: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
  onCheck: () => void;
  isChecking: boolean;
}

export default function LocationSelector({
  value,
  onChange,
  onCheck,
  isChecking,
}: LocationSelectorProps) {
  return (
    <div className="w-full">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-stone-700">
          Where should we deliver?
        </h3>

        <p className="mt-1 text-sm text-stone-500">
          Select a point on the map or use your current location to check
          delivery availability.
        </p>
      </div>

      <LocationPicker value={value} onChange={onChange} />

      {value && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-50 p-3 text-sm text-stone-700">
          <MapPin size={17} className="shrink-0 text-orange-600" />

          <span>
            {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
          </span>
        </div>
      )}

      <button
        type="button"
        disabled={!value || isChecking}
        onClick={onCheck}
        className="mt-4 flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isChecking ? "Checking delivery..." : "Check delivery"}
      </button>
    </div>
  );
}
