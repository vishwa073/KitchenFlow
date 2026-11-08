import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const outlets = await prisma.outlet.findMany({
      where: {
        isActive: true,
        city: {
          isActive: true,
        },
      },
      include: {
        city: {
          select: {
            name: true,
            state: true,
            code: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formattedOutlets = outlets.map((outlet) => ({
      id: outlet.id,
      name: outlet.name,
      code: outlet.code,
      address: outlet.address,
      area: outlet.area,
      postalCode: outlet.postalCode,
      phone: outlet.phone,
      latitude:
        outlet.latitude === null ? null : Number(outlet.latitude),
      longitude:
        outlet.longitude === null ? null : Number(outlet.longitude),
      isCloudKitchen: outlet.isCloudKitchen,
      isActive: outlet.isActive,
      minimumPrepTimeMin: outlet.minimumPrepTimeMin,
      deliveryRadiusKm: Number(outlet.deliveryRadiusKm),
      city: outlet.city,
    }));

    return res.status(200).json({
      success: true,
      count: formattedOutlets.length,
      outlets: formattedOutlets,
    });
  } catch (error) {
    console.error("Fetching outlets failed:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch outlets.",
    });
  }
});

export default router;