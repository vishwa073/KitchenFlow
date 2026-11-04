
import { useState } from "react";
import { MapPin, Search } from "lucide-react";

import type { CustomerLocation } from "../types/customerLocation";
import { customerLocations } from "../data/customerLocations";

interface LocationSelectorProps {
  selectedLocation: CustomerLocation | null;
  onSelect: (location: CustomerLocation) => void;
}

export default function LocationSelector({
  selectedLocation,
  onSelect,
}: LocationSelectorProps) {
  const [address, setAddress] = useState(
    selectedLocation?.address ?? ""
  );
  const [error, setError] = useState("");

  function handleCheckDelivery() {
    const normalizedAddress = address.trim().toLowerCase();

    if (!normalizedAddress) {
      setError("Please enter your delivery address.");
      return;
    }

    const matchedLocation = customerLocations.find((location) => {
      const label = location.label.toLowerCase();
      const locationAddress = location.address.toLowerCase();

      return (
        normalizedAddress.includes(label) ||
        locationAddress.includes(normalizedAddress)
      );
    });

    if (!matchedLocation) {
      setError(
        "We couldn't locate this address in our demo data. Try including an area such as Kondapur or Gachibowli."
      );
      return;
    }

    setError("");
    onSelect(matchedLocation);
  }

  return (
    <div className="w-full">
      <label
        htmlFor="customer-address"
        className="mb-2 block text-sm font-semibold text-stone-700"
      >
        Where should we deliver?
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <MapPin
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
          />

          <input
            id="customer-address"
            type="text"
            value={address}
            onChange={(event) => {
              setAddress(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleCheckDelivery();
              }
            }}
            placeholder="Enter your flat, street, and area"
            className="w-full rounded-xl border border-stone-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <button
          type="button"
          onClick={handleCheckDelivery}
          className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
        >
          <Search size={16} />
          Check delivery
        </button>
      </div>

      {selectedLocation && !error && (
        <p className="mt-2 text-sm text-stone-500">
          <span className="font-medium text-green-700">
            Location checked:
          </span>{" "}
          {selectedLocation.address}
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <p className="mt-2 text-xs text-stone-400">
        Demo version: address matching is based on sample Hyderabad areas.
      </p>
    </div>
  );
}
