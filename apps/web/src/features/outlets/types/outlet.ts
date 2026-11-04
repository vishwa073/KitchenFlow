
export type OutletCategory =
  | "All"
  | "South Indian"
  | "North Indian"
  | "Fast Food"
  | "Cafe";

export type OutletDataSource = "assignment" | "sample";

export interface Outlet {
  id: string;
  name: string;
  description: string;
  image: string;
  category: Exclude<OutletCategory, "All">;
  rating: number;
  deliveryTime: string;
  priceForOne: number;
  isAvailable: boolean;
  tags: string[];

  // Delivery serviceability
  servingArea: string;
  latitude: number;
  longitude: number;
  deliveryRadiusKm: number;

  // Identifies whether the outlet name comes from the brief
  dataSource: OutletDataSource;
}
