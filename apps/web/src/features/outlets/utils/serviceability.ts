
import type { Outlet } from "../types/outlet";
import { calculateDistanceKm } from "../../../lib/distance";

export interface CustomerLocation {
  latitude: number;
  longitude: number;
}

export interface ServiceableOutlet extends Outlet {
  distanceKm: number;
}

export function getServiceableOutlets(
  outlets: Outlet[],
  customerLocation: CustomerLocation
): ServiceableOutlet[] {
  return outlets
    .filter((outlet) => outlet.isAvailable)
    .map((outlet) => {
      const distanceKm = calculateDistanceKm(
        customerLocation.latitude,
        customerLocation.longitude,
        outlet.latitude,
        outlet.longitude
      );

      return {
        ...outlet,
        distanceKm,
      };
    })
    .filter((outlet) => outlet.distanceKm <= outlet.deliveryRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}