import type { Outlet } from "../types/outlet";

export interface OutletApiResponse {
  success: boolean;
  count: number;
  outlets: Outlet[];
}

type ApiFetch = (
  path: string,
  options?: RequestInit,
) => Promise<Response>;

export async function fetchOutlets(
  apiFetch: ApiFetch,
): Promise<Outlet[]> {
  const response = await apiFetch("/api/outlets");

  const data = (await response.json()) as OutletApiResponse;

  if (!response.ok || !data.success) {
    throw new Error("Failed to fetch outlets.");
  }

  return data.outlets;
}


export interface ServiceabilityOutlet {
  id: string;
  name: string;
  code: string;
  address: string;
  area: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isCloudKitchen: boolean;
  minimumPrepTimeMin: number;
  deliveryRadiusKm: number;
  distanceKm: number;
  city: string;
}

export interface ServiceabilityResponse {
  success: boolean;
  count: number;
  serviceable: boolean;
  outlets: ServiceabilityOutlet[];
  message?: string;
}

export async function checkOutletServiceability(
  apiFetch: ApiFetch,
  coordinates: {
    latitude: number;
    longitude: number;
  }
): Promise<ServiceabilityResponse> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
  });

  const response = await apiFetch(
    `/api/serviceability?${params.toString()}`
  );

  const data = (await response.json()) as ServiceabilityResponse;

  if (!response.ok || !data.success) {
    throw new Error(
      data.message ?? "Unable to check delivery availability."
    );
  }

  return data;
}
