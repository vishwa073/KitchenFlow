import { Router } from "express";
import { CouponDiscountType } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { requireCentralAdmin } from "../../middleware/require-central-admin.js";

const adminCouponsRouter = Router();

function parseOptionalNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error("Invalid number");
  }

  return parsed;
}

function parseOptionalInteger(value: unknown): number | null {
  const parsed = parseOptionalNumber(value);

  if (parsed === null) {
    return null;
  }

  if (!Number.isInteger(parsed)) {
    throw new Error("Invalid integer");
  }

  return parsed;
}

function isValidDate(value: unknown): value is string {
  if (typeof value !== "string" || value.trim() === "") {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

// GET /api/management/admin/coupons
adminCouponsRouter.get("/", requireCentralAdmin, async (_req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      coupons,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/management/admin/coupons
adminCouponsRouter.post("/", requireCentralAdmin, async (req, res, next) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      minOrderAmount,
      startsAt,
      expiresAt,
      usageLimit,
      perUserLimit,
    } = req.body as {
      code?: unknown;
      description?: unknown;
      discountType?: unknown;
      discountValue?: unknown;
      maxDiscount?: unknown;
      minOrderAmount?: unknown;
      startsAt?: unknown;
      expiresAt?: unknown;
      usageLimit?: unknown;
      perUserLimit?: unknown;
    };

    // Validate required fields
    if (
      typeof code !== "string" ||
      code.trim() === "" ||
      (discountType !== "PERCENTAGE" && discountType !== "FIXED") ||
      typeof discountValue !== "number" ||
      !Number.isFinite(discountValue) ||
      discountValue <= 0 ||
      !isValidDate(startsAt) ||
      !isValidDate(expiresAt)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid coupon details.",
      });
      return;
    }

    // Parse optional amount and limit fields
    let parsedMaxDiscount: number | null;
    let parsedMinOrderAmount: number;
    let parsedUsageLimit: number | null;
    let parsedPerUserLimit: number | null;

    try {
      parsedMaxDiscount = parseOptionalNumber(maxDiscount);
      parsedMinOrderAmount = parseOptionalNumber(minOrderAmount) ?? 0;
      parsedUsageLimit = parseOptionalInteger(usageLimit);
      parsedPerUserLimit = parseOptionalInteger(perUserLimit);
    } catch {
      res.status(400).json({
        success: false,
        message: "Invalid coupon limit or amount.",
      });
      return;
    }

    // Validate parsed amounts and limits
    if (
      (parsedMaxDiscount !== null && parsedMaxDiscount < 0) ||
      parsedMinOrderAmount < 0 ||
      (parsedUsageLimit !== null && parsedUsageLimit < 1) ||
      (parsedPerUserLimit !== null && parsedPerUserLimit < 1)
    ) {
      res.status(400).json({
        success: false,
        message: "Coupon limits and amounts must be valid positive values.",
      });
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    const startDate = new Date(startsAt);
    const expiryDate = new Date(expiresAt);

    if (expiryDate <= startDate) {
      res.status(400).json({
        success: false,
        message: "Expiry date must be after the start date.",
      });
      return;
    }

    if (discountType === "PERCENTAGE" && discountValue > 100) {
      res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100.",
      });
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        description:
          typeof description === "string" && description.trim() !== ""
            ? description.trim()
            : null,
        discountType: discountType as CouponDiscountType,
        discountValue,
        maxDiscount: parsedMaxDiscount,
        minOrderAmount: parsedMinOrderAmount,
        startsAt: startDate,
        expiresAt: expiryDate,
        usageLimit: parsedUsageLimit,
        perUserLimit: parsedPerUserLimit,
        isActive: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({
        success: false,
        message: "A coupon with this code already exists.",
      });
      return;
    }

    next(error);
  }
});

// DELETE /api/management/admin/coupons/:id
adminCouponsRouter.delete("/:id", requireCentralAdmin, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      res.status(400).json({
        success: false,
        message: "Invalid coupon ID.",
      });
      return;
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
      return;
    }

    await prisma.coupon.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      res.status(409).json({
        success: false,
        message: "This coupon has redemption history and cannot be deleted.",
      });
      return;
    }

    next(error);
  }
});

export default adminCouponsRouter;
