import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusKm = 6371;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (
      req.query.latitude === undefined ||
      req.query.longitude === undefined ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required.",
      });
    }

    const outlets = await prisma.outlet.findMany({
      where: {
        isActive: true,
        latitude: { not: null },
        longitude: { not: null },
        city: {
          name: "Hyderabad",
          state: "Telangana",
          isActive: true,
        },
      },
      include: {
        city: true,
      },
    });

    const serviceableOutlets = outlets
      .map((outlet) => {
        const outletLatitude = Number(outlet.latitude);
        const outletLongitude = Number(outlet.longitude);
        const deliveryRadiusKm = Number(outlet.deliveryRadiusKm);

        const distanceKm = calculateDistanceKm(
          latitude,
          longitude,
          outletLatitude,
          outletLongitude,
        );

        return {
          id: outlet.id,
          name: outlet.name,
          code: outlet.code,
          address: outlet.address,
          area: outlet.area,
          postalCode: outlet.postalCode,
          latitude: outletLatitude,
          longitude: outletLongitude,
          isCloudKitchen: outlet.isCloudKitchen,
          minimumPrepTimeMin: outlet.minimumPrepTimeMin,
          deliveryRadiusKm,
          distanceKm: Number(distanceKm.toFixed(2)),
          city: outlet.city.name,
        };
      })
      .filter((outlet) => outlet.distanceKm <= outlet.deliveryRadiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return res.status(200).json({
      success: true,
      count: serviceableOutlets.length,
      serviceable: serviceableOutlets.length > 0,
      outlets: serviceableOutlets,
    });
  } catch (error) {
    console.error("Serviceability check failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to check delivery serviceability.",
    });
  }
});

export default router;