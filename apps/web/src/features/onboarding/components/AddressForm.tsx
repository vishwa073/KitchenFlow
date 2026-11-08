import { useState, type FormEvent } from "react";
import AddressField from "./address/AddressField";
import AddressTypeSelector from "./address/AddressTypeSelector";
import LocationPicker, { type Coordinates } from "./LocationPicker";

export interface DeliveryAddress {
  fullName: string;
  phone: string;
  houseNo: string;
  street: string;
  landmark: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  addressType: "HOME" | "WORK" | "OTHER";
  latitude: number | null;
  longitude: number | null;
}

interface AddressFormProps {
  initialValue?: Partial<DeliveryAddress>;
  onSubmit: (address: DeliveryAddress) => void;
  isSubmitting?: boolean;
}

const initialAddress: DeliveryAddress = {
  fullName: "",
  phone: "",
  houseNo: "",
  street: "",
  landmark: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "HOME",
  latitude: null,
  longitude: null,
};

export default function AddressForm({
  initialValue,
  onSubmit,
  isSubmitting = false,
}: AddressFormProps) {
  const [address, setAddress] = useState<DeliveryAddress>({
    ...initialAddress,
    ...initialValue,
  });

  const [error, setError] = useState("");

  function updateField<K extends keyof DeliveryAddress>(
    field: K,
    value: DeliveryAddress[K]
  ) {
    setAddress((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleLocationChange(coords: Coordinates | null) {
    setAddress((prev) => ({
      ...prev,
      latitude: coords?.latitude ?? null,
      longitude: coords?.longitude ?? null,
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(address.pincode)) {
      setError("Enter a valid 6-digit pincode.");
      return;
    }

    if (
      address.latitude === null ||
      address.longitude === null
    ) {
      setError("Please select your delivery location on the map.");
      return;
    }

    onSubmit(address);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AddressField
          label="Full name"
          value={address.fullName}
          onChange={(e) => updateField("fullName", e.target.value)}
          placeholder="Enter full name"
          required
        />

        <AddressField
          label="Phone number"
          type="tel"
          inputMode="numeric"
          value={address.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="Enter phone number"
          required
        />

        <AddressField
          label="House / Flat / Building"
          value={address.houseNo}
          onChange={(e) => updateField("houseNo", e.target.value)}
          placeholder="House or flat number"
          required
        />

        <AddressField
          label="Street"
          value={address.street}
          onChange={(e) => updateField("street", e.target.value)}
          placeholder="Street name"
          required
        />

        <AddressField
          label="Landmark (optional)"
          value={address.landmark}
          onChange={(e) => updateField("landmark", e.target.value)}
          placeholder="Nearby landmark"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Delivery location
        </label>

        <LocationPicker
          value={
            address.latitude !== null &&
            address.longitude !== null
              ? {
                  latitude: address.latitude,
                  longitude: address.longitude,
                }
              : null
          }
          onChange={handleLocationChange}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AddressField
          label="Area"
          value={address.area}
          onChange={(e) => updateField("area", e.target.value)}
          placeholder="Area / locality"
          required
        />

        <AddressField
          label="City"
          value={address.city}
          onChange={(e) => updateField("city", e.target.value)}
          placeholder="City"
          required
        />

        <AddressField
          label="State"
          value={address.state}
          onChange={(e) => updateField("state", e.target.value)}
          placeholder="State"
          required
        />

        <AddressField
          label="Pincode"
          inputMode="numeric"
          maxLength={6}
          value={address.pincode}
          onChange={(e) => updateField("pincode", e.target.value)}
          placeholder="6-digit pincode"
          required
        />
      </div>

      <AddressTypeSelector
        value={address.addressType}
        onChange={(value) => updateField("addressType", value)}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-orange-500 px-4 py-3
          font-semibold text-white transition hover:bg-orange-600
          disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving address..." : "Save address"}
      </button>
    </form>
  );
}