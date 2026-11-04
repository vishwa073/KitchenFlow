import type { CustomerLocation } from "../types/customerLocation";
import { customerLocations } from "../data/customerLocations";

export function resolveCustomerAddress(
  address: string
): CustomerLocation | null {
  const normalizedAddress = address.trim().toLowerCase();

  if (!normalizedAddress) {
    return null;
  }

  return (
    customerLocations.find((location) =>
      location.label.toLowerCase() === normalizedAddress
    ) ?? null
  );
}