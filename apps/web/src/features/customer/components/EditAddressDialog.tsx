import { useState } from "react";
import { X } from "lucide-react";

import AddressForm, {
  type DeliveryAddress,
} from "../../onboarding/components/AddressForm";
import { useApi } from "../../../lib/api";

type SavedAddress = {
  id: string;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
};

type EditAddressDialogProps = {
  address: SavedAddress;
  onClose: () => void;
  onSaved: (address: SavedAddress) => void;
};

type ServiceabilityResult = {
  success: boolean;
  serviceable: boolean;
  outlets: Array<{
    id: string;
    name: string;
    distanceKm: number;
  }>;
  message?: string;
};

export default function EditAddressDialog({
  address,
  onClose,
  onSaved,
}: EditAddressDialogProps) {
  const { apiFetch } = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");

  const initialValue: Partial<DeliveryAddress> = {
    fullName: address.recipientName,
    phone: address.phone,
    houseNo: address.addressLine1,
    street: address.addressLine2 ?? "",
    landmark: address.landmark ?? "",
    area: address.area,
    city: address.city,
    state: address.state,
    pincode: address.postalCode,
    addressType:
      address.label === "WORK" || address.label === "OTHER"
        ? address.label
        : "HOME",
    latitude: address.latitude ?? null,
    longitude: address.longitude ?? null,
  };

  async function handleSubmit(updatedAddress: DeliveryAddress) {
    setIsSubmitting(true);
    setStatus("Checking delivery availability...");

    try {
      if (
        updatedAddress.latitude === null ||
        updatedAddress.longitude === null
      ) {
        throw new Error("Please pin your delivery location on the map.");
      }

      // Check the newly selected coordinates before updating the DB.
      const serviceabilityResponse = await apiFetch(
        `/api/serviceability?latitude=${updatedAddress.latitude}&longitude=${updatedAddress.longitude}`,
      );

      const serviceability =
        (await serviceabilityResponse.json()) as ServiceabilityResult;

      if (!serviceabilityResponse.ok || !serviceability.success) {
        throw new Error(
          serviceability.message ||
            "Unable to check delivery availability.",
        );
      }

      if (!serviceability.serviceable) {
        throw new Error(
          "Delivery is not available at this location. Please select another point on the map.",
        );
      }

      setStatus("Location is serviceable. Saving address...");

      const response = await apiFetch(`/api/addresses/${address.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          label: updatedAddress.addressType,
          recipientName: updatedAddress.fullName,
          phone: updatedAddress.phone,
          addressLine1: updatedAddress.houseNo,
          addressLine2: updatedAddress.street || null,
          landmark: updatedAddress.landmark || null,
          area: updatedAddress.area,
          city: updatedAddress.city,
          state: updatedAddress.state,
          postalCode: updatedAddress.pincode,
          country: address.country || "India",
          latitude: updatedAddress.latitude,
          longitude: updatedAddress.longitude,
          isDefault: address.isDefault,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.address) {
        throw new Error(result.message || "Failed to update address.");
      }

      onSaved(result.address as SavedAddress);
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "Something went wrong while updating the address.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-address-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
      >
        <header className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <h2
              id="edit-address-title"
              className="text-lg font-bold text-stone-900"
            >
              Change delivery address
            </h2>
            <p className="mt-1 text-sm text-stone-500">
              Update your address and delivery location.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </header>

        <div className="overflow-y-auto px-5 py-5">
          {status && (
            <p
              role="status"
              className={`mb-4 rounded-xl px-3 py-2 text-sm ${
                status.includes("not available") ||
                status.includes("Unable") ||
                status.includes("Failed") ||
                status.includes("Please")
                  ? "bg-red-50 text-red-600"
                  : "bg-orange-50 text-orange-700"
              }`}
            >
              {status}
            </p>
          )}

          <AddressForm
            key={address.id}
            initialValue={initialValue}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </section>
    </div>
  );
}