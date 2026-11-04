import { describe, expect, it } from "vitest";
import { getServiceableOutlets } from "./serviceability";
import type { Outlet } from "../types/outlet";

const mockOutlets: Outlet[] = [
  {
    id: "outlet-1",
    name: "Nearby Outlet",
    description: "Nearby test outlet",
    image: "",
    category: "South Indian",
    rating: 4.5,
    deliveryTime: "25-30 min",
    priceForOne: 200,
    isAvailable: true,
    tags: [],
    servingArea: "Test Area",
    latitude: 17.4697,
    longitude: 78.3568,
    deliveryRadiusKm: 3,
    dataSource: "sample",
  },
  {
    id: "outlet-2",
    name: "Far Outlet",
    description: "Far test outlet",
    image: "",
    category: "North Indian",
    rating: 4.2,
    deliveryTime: "35-40 min",
    priceForOne: 250,
    isAvailable: true,
    tags: [],
    servingArea: "Far Area",
    latitude: 17.55,
    longitude: 78.5,
    deliveryRadiusKm: 2,
    dataSource: "sample",
  },
];

describe("getServiceableOutlets", () => {
  it("returns only outlets within their delivery radius", () => {
    const result = getServiceableOutlets(mockOutlets, {
      latitude: 17.47,
      longitude: 78.357,
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("outlet-1");
  });

  it("returns no outlets when none can deliver", () => {
    const result = getServiceableOutlets(mockOutlets, {
      latitude: 17.6,
      longitude: 78.6,
    });

    expect(result).toHaveLength(0);
  });
});