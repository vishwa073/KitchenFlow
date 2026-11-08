import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";
import {
  saveAddress,
  getDefaultAddress,
  updateAddress,
  selectOutletForAddress,
} from "./address.service.js";
import type { CreateAddressInput } from "./address.types.js";
import {  type Request, type Response } from "express";
const router = Router();

router.patch("/:addressId/select-outlet", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const addressId = req.params.addressId;
  if (typeof addressId !== "string" || !addressId.trim()) {
  return res.status(400).json({
    success: false,
    message: "Invalid address ID",
  });
}

  const { outletId } = req.body as { outletId?: string };

  if (typeof outletId !== "string" || !outletId.trim()) {
    return res.status(400).json({
      success: false,
      message: "outletId is required",
    });
  }

  try {
    const address = await selectOutletForAddress(
      userId,
      addressId,
      outletId,
    );

    return res.status(200).json({
      success: true,
      message: "Outlet selected successfully",
      address,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (error.message === "ADDRESS_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Address not found",
        });
      }

      if (error.message === "OUTLET_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Outlet not found",
        });
      }
    }

    console.error("Error selecting outlet:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to select outlet",
    });
  }
});
router.get("/default", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const address = await getDefaultAddress(userId);

    return res.status(200).json({
      success: true,
      address,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Error fetching default address:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch address",
    });
  }
});

router.patch("/:addressId", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const addressId = req.params.addressId;
  if (typeof addressId !== "string" || !addressId.trim()) {
  return res.status(400).json({
    success: false,
    message: "Invalid address ID",
  });
}
  const body = req.body as Partial<CreateAddressInput>;

  const requiredFields = [
    "recipientName",
    "phone",
    "addressLine1",
    "area",
    "postalCode",
  ] as const;

  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return typeof value !== "string" || value.trim() === "";
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Required address fields are missing",
      missingFields,
    });
  }

  try {
    const address = await updateAddress(
      userId,
      addressId,
      body as CreateAddressInput,
    );

    return res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (error instanceof Error && error.message === "ADDRESS_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    console.error("Error updating address:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update address",
    });
  }
});

router.post("/", async (req, res) => {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const body = req.body as Partial<CreateAddressInput>;

  const requiredFields = [
    "recipientName",
    "phone",
    "addressLine1",
    "area",
    "postalCode",
  ] as const;

  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return typeof value !== "string" || value.trim() === "";
  });

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Required address fields are missing",
      missingFields,
    });
  }

  const { latitude, longitude } = body;

  if (
    latitude !== undefined &&
    latitude !== null &&
    (typeof latitude !== "number" ||
      latitude < -90 ||
      latitude > 90)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid latitude",
    });
  }

  if (
    longitude !== undefined &&
    longitude !== null &&
    (typeof longitude !== "number" ||
      longitude < -180 ||
      longitude > 180)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid longitude",
    });
  }

  if (
    body.isDefault !== undefined &&
    typeof body.isDefault !== "boolean"
  ) {
    return res.status(400).json({
      success: false,
      message: "isDefault must be a boolean",
    });
  }

  try {
    const address = await saveAddress(
      userId,
      body as CreateAddressInput,
    );

    return res.status(201).json({
      success: true,
      message: "Address saved successfully",
      address,
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.error("Error saving address:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to save address",
    });
  }
});
router.get("/", async (req, res) => {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [
        { isDefault: "desc" },
        { createdAt: "desc" },
      ],
    });

    return res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Error fetching addresses:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch addresses",
    });
  }
});
export async function selectOutletForAddress(
  clerkUserId: string,
  addressId: string,
  outletId: string,
) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
    select: {
      id: true,
      latitude: true,
      longitude: true,
    },
  });

  if (!address) {
    throw new Error("ADDRESS_NOT_FOUND");
  }

  const outlet = await prisma.outlet.findUnique({
    where: { id: outletId },
    select: { id: true },
  });

  if (!outlet) {
    throw new Error("OUTLET_NOT_FOUND");
  }

  return prisma.address.update({
    where: { id: address.id },
    data: {
      selectedOutletId: outlet.id,
    },
  });
}

export default router;