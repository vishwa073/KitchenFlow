export type OutletCategory =
  | "All"
  | "South Indian"
  | "North Indian"
  | "Fast Food"
  | "Cafe";

export type OutletDataSource = "assignment" | "sample";

export interface Outlet {
  // Database fields
  id: string;
  name: string;
  code: string;
  address: string;
  area: string;
  postalCode: string | null;
  phone: string | null;

  latitude: number | null;
  longitude: number | null;

  isCloudKitchen: boolean;
  isActive: boolean;
  minimumPrepTimeMin: number;
  deliveryRadiusKm: number;

  city: {
    name: string;
    state: string;
    code: string;
  };

  // Display fields — we'll add these to Prisma and seed later
  description?: string;
  image?: string;
  category?: Exclude<OutletCategory, "All">;
  rating?: number;
  deliveryTime?: string;
  priceForOne?: number;
  tags?: string[];
  servingArea?: string;
  dataSource?: OutletDataSource;

  // UI compatibility; availability will come from backend active status
  isAvailable?: boolean;
}

export interface ServiceableOutlet extends Outlet {
  distanceKm: number;
}