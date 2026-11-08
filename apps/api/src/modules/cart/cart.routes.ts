import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/require-auth.js";

const cartRouter = Router();

type AddCartItemBody = {
  outletId?: unknown;
  outletMenuItemId?: unknown;
  outletVariantPriceId?: unknown;
  quantity?: unknown;
  addons?: unknown;
};

type AddonInput = {
  outletAddonPriceId: string;
  quantity: number;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseAddons(value: unknown): AddonInput[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;

  const addons: AddonInput[] = [];

  for (const addon of value) {
    if (
      !addon ||
      typeof addon !== "object" ||
      !isNonEmptyString(addon.outletAddonPriceId) ||
      !Number.isInteger(addon.quantity) ||
      addon.quantity < 1
    ) {
      return null;
    }

    addons.push({
      outletAddonPriceId: addon.outletAddonPriceId,
      quantity: addon.quantity,
    });
  }

  // Reject duplicate add-on IDs in the same request.
  const addonIds = addons.map((addon) => addon.outletAddonPriceId);
  if (new Set(addonIds).size !== addonIds.length) return null;

  return addons;
}

/**
 * Resolves Clerk's userId to the internal database User.id.
 * Cart.userId references the database user, not the Clerk ID.
 */
async function getDatabaseUser(clerkUserId: string) {
  return prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      isActive: true,
    },
  });
}

/**
 * Shared nested include for returning a cart with item details.
 */
const cartItemsInclude = {
  items: {
    include: {
      addons: {
        include: {
          addonPrice: {
            include: {
              addon: true,
            },
          },
        },
      },
      variantPrice: {
        include: {
          variant: true,
        },
      },
      outletMenuItem: {
        include: {
          menuItem: true,
        },
      },
    },
  },
} as const;

// ============================================================
// POST /items
// Add an item to the authenticated user's active cart
// ============================================================

cartRouter.post("/items", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const body = req.body as AddCartItemBody;

    if (
      !isNonEmptyString(body.outletId) ||
      !isNonEmptyString(body.outletMenuItemId) ||
      !isNonEmptyString(body.outletVariantPriceId) ||
      !Number.isInteger(body.quantity) ||
      (body.quantity as number) < 1 ||
      (body.quantity as number) > 99
    ) {
      res.status(400).json({
        success: false,
        message:
          "Provide outletId, outletMenuItemId, outletVariantPriceId, and a quantity between 1 and 99.",
      });
      return;
    }

    const addons = parseAddons(body.addons);

    if (!addons) {
      res.status(400).json({
        success: false,
        message: "Invalid add-ons. Each add-on needs an ID and quantity.",
      });
      return;
    }
    const startedAt = performance.now();
    const user = await getDatabaseUser(clerkUserId);
    console.log(
      "[Cart POST] getDatabaseUser:",
      (performance.now() - startedAt).toFixed(0),
      "ms",
    );
    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive. Call /api/auth/me first.",
      });

      return;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        console.log(
          "[Cart POST] transaction started:",
          (performance.now() - startedAt).toFixed(0),
          "ms",
        );
        // Validate the outlet-specific menu item and selected price.
        const variantPrice = await tx.outletVariantPrice.findFirst({
          where: {
            id: body.outletVariantPriceId as string,
            isAvailable: true,
            outletMenuItemId: body.outletMenuItemId as string,
            outletMenuItem: {
              outletId: body.outletId as string,
              isAvailable: true,
              outlet: {
                isActive: true,
              },
              menuItem: {
                isActive: true,
                isPublished: true,
              },
            },
            variant: {
              isActive: true,
            },
          },
          select: {
            id: true,
            price: true,
            outletMenuItemId: true,
            outletMenuItem: {
              select: {
                outletId: true,
              },
            },
          },
        });
        console.log(
          "[Cart POST] variant lookup:",
          (performance.now() - startedAt).toFixed(0),
          "ms",
        );
        if (!variantPrice) {
          return {
            error: "The selected menu item or variant is unavailable.",
            status: 400,
          };
        }

        // Validate all selected add-ons belong to this outlet and are available.
        const addonPrices =
          addons.length > 0
            ? await tx.outletAddonPrice.findMany({
                where: {
                  id: {
                    in: addons.map((addon) => addon.outletAddonPriceId),
                  },
                  outletId: body.outletId as string,
                  isAvailable: true,
                  addon: {
                    isActive: true,
                  },
                },
                select: {
                  id: true,
                  price: true,
                },
              })
            : [];

        if (addonPrices.length !== addons.length) {
          return {
            error: "One or more selected add-ons are unavailable.",
            status: 400,
          };
        }

        // Find this user's active cart. An active cart belongs to one outlet.
        let cart = await tx.cart.findFirst({
          where: {
            userId: user.id,
            isActive: true,
          },
          include: {
            items: true,
          },
        });

        if (cart && cart.outletId !== (body.outletId as string)) {
          return {
            error:
              "Your active cart belongs to another outlet. Clear it before ordering from a different outlet.",
            status: 409,
          };
        }

        if (!cart) {
          cart = await tx.cart.create({
            data: {
              userId: user.id,
              outletId: body.outletId as string,
              isActive: true,
            },
            include: {
              items: true,
            },
          });
        }

        // Create the cart item using the price resolved from the database.
        const cartItem = await tx.cartItem.create({
          data: {
            cartId: cart.id,
            outletMenuItemId: variantPrice.outletMenuItemId,
            outletVariantPriceId: variantPrice.id,
            quantity: body.quantity as number,
            unitPrice: variantPrice.price,
            addons: {
              create: addons.map((addon) => {
                const addonPrice = addonPrices.find(
                  (price) => price.id === addon.outletAddonPriceId,
                );

                return {
                  outletAddonPriceId: addon.outletAddonPriceId,
                  quantity: addon.quantity,
                  unitPrice: addonPrice!.price,
                };
              }),
            },
          },
          include: {
            addons: {
              include: {
                addonPrice: {
                  include: {
                    addon: true,
                  },
                },
              },
            },
            variantPrice: {
              include: {
                variant: true,
              },
            },
            outletMenuItem: {
              include: {
                menuItem: true,
              },
            },
          },
        });

        return {
          cartId: cart.id,
          outletId: cart.outletId,
          item: cartItem,
        };
      },
      {
        timeout: 10000,
      },
    );

    if ("error" in result) {
      res.status(result.status ?? 400).json({
        success: false,
        message: result.error,
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Item added to cart.",
      cart: result,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// GET /
// Fetch the authenticated user's active cart
// ============================================================

cartRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const startedAt = performance.now();
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const user = await getDatabaseUser(clerkUserId);
    console.log(
      "[Cart GET] getDatabaseUser:",
      (performance.now() - startedAt).toFixed(0),
      "ms",
    );

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
      include: cartItemsInclude,
    });
    const cartQueryStartedAt = performance.now();

    console.log(
      "[Cart GET] cart query:",
      (performance.now() - cartQueryStartedAt).toFixed(0),
      "ms",
    );
    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
});
// ============================================================
// POST /coupon
// Apply a coupon to the authenticated user's active cart
// ============================================================

cartRouter.post("/coupon", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const { code } = req.body as { code?: unknown };

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!isNonEmptyString(code)) {
      res.status(400).json({
        success: false,
        message: "Enter a valid coupon code.",
      });
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    const user = await getDatabaseUser(clerkUserId);

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: {
          userId: user.id,
          isActive: true,
        },
        include: {
          ...cartItemsInclude,
          coupon: true,
        },
      });

      if (!cart || cart.items.length === 0) {
        return {
          error: "Your cart is empty.",
          status: 400,
        };
      }

      const coupon = await tx.coupon.findUnique({
        where: {
          code: normalizedCode,
        },
      });

      if (!coupon || !coupon.isActive) {
        return {
          error: "This coupon is invalid or inactive.",
          status: 400,
        };
      }

      const now = new Date();

      if (now < coupon.startsAt) {
        return {
          error: "This coupon is not active yet.",
          status: 400,
        };
      }

      if (now > coupon.expiresAt) {
        return {
          error: "This coupon has expired.",
          status: 400,
        };
      }

      // Calculate the cart amount using prices stored in the database.
      let subtotal = 0;
      let addonTotal = 0;

      for (const item of cart.items) {
        subtotal += Number(item.unitPrice) * item.quantity;

        for (const addon of item.addons) {
          addonTotal +=
            Number(addon.unitPrice) * addon.quantity * item.quantity;
        }
      }

      const eligibleAmount = Number((subtotal + addonTotal).toFixed(2));

      if (eligibleAmount < Number(coupon.minOrderAmount)) {
        return {
          error: `This coupon requires a minimum order of ₹${Number(
            coupon.minOrderAmount,
          ).toFixed(2)}.`,
          status: 400,
        };
      }

      if (coupon.usageLimit !== null) {
        const totalRedemptions = await tx.couponRedemption.count({
          where: {
            couponId: coupon.id,
          },
        });

        if (totalRedemptions >= coupon.usageLimit) {
          return {
            error: "This coupon has reached its usage limit.",
            status: 400,
          };
        }
      }

      if (coupon.perUserLimit !== null) {
        const userRedemptions = await tx.couponRedemption.count({
          where: {
            couponId: coupon.id,
            userId: user.id,
          },
        });

        if (userRedemptions >= coupon.perUserLimit) {
          return {
            error:
              "You have already used this coupon the maximum number of times.",
            status: 400,
          };
        }
      }

      let discountAmount =
        coupon.discountType === "PERCENTAGE"
          ? (eligibleAmount * Number(coupon.discountValue)) / 100
          : Number(coupon.discountValue);

      if (coupon.maxDiscount !== null) {
        discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
      }

      discountAmount = Math.min(
        Number(discountAmount.toFixed(2)),
        eligibleAmount,
      );

      const updatedCart = await tx.cart.update({
        where: {
          id: cart.id,
        },
        data: {
          couponId: coupon.id,
        },
        include: {
          ...cartItemsInclude,
          coupon: true,
        },
      });

      return {
        cart: updatedCart,
        coupon: {
          id: coupon.id,
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: Number(coupon.discountValue),
          maxDiscount:
            coupon.maxDiscount === null ? null : Number(coupon.maxDiscount),
        },
        discountAmount,
      };
    });

    if ("error" in result) {
      res.status(result.status ?? 400).json({
        success: false,
        message: result.error,
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully.",
      cart: result.cart,
      coupon: result.coupon,
      discountAmount: result.discountAmount,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// DELETE /coupon
// Remove the coupon from the authenticated user's active cart
// ============================================================

cartRouter.delete("/coupon", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const user = await getDatabaseUser(clerkUserId);

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (!cart) {
      res.status(404).json({
        success: false,
        message: "Active cart not found.",
      });
      return;
    }

    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        couponId: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Coupon removed successfully.",
    });
  } catch (error) {
    next(error);
  }
});
// ============================================================
// PATCH /items/:cartItemId
// Update the quantity of one item in the user's active cart
// ============================================================

cartRouter.patch("/items/:cartItemId", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const cartItemId = req.params.cartItemId;
    const { quantity } = req.body as { quantity?: unknown };

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }
    if (typeof cartItemId !== "string" || cartItemId.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid cart item ID.",
      });
      return;
    }
    if (
      typeof quantity !== "number" ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 99
    ) {
      res.status(400).json({
        success: false,
        message: "Quantity must be an integer between 1 and 99.",
      });
      return;
    }

    const user = await getDatabaseUser(clerkUserId);

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: user.id,
          isActive: true,
        },
      },
    });

    if (!cartItem) {
      res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
      return;
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        id: cartItem.id,
      },
      data: {
        quantity,
      },
      include: {
        addons: {
          include: {
            addonPrice: {
              include: {
                addon: true,
              },
            },
          },
        },
        variantPrice: {
          include: {
            variant: true,
          },
        },
        outletMenuItem: {
          include: {
            menuItem: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart item quantity updated.",
      item: updatedItem,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// DELETE /items/:cartItemId
// Remove one item from the user's active cart
// ============================================================

cartRouter.delete("/items/:cartItemId", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const cartItemId = req.params.cartItemId;

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }
    if (typeof cartItemId !== "string" || cartItemId.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Invalid cart item ID.",
      });
      return;
    }

    const user = await getDatabaseUser(clerkUserId);

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: {
          userId: user.id,
          isActive: true,
        },
      },
    });

    if (!cartItem) {
      res.status(404).json({
        success: false,
        message: "Cart item not found.",
      });
      return;
    }

    await prisma.cartItem.delete({
      where: {
        id: cartItem.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart.",
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// DELETE /
// Clear the user's active cart by deactivating it
// ============================================================

cartRouter.delete("/", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const user = await getDatabaseUser(clerkUserId);

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const cart = await prisma.cart.findFirst({
      where: {
        userId: user.id,
        isActive: true,
      },
    });

    if (!cart) {
      res.status(200).json({
        success: true,
        message: "Cart is already empty.",
      });
      return;
    }

    await prisma.cart.update({
      where: {
        id: cart.id,
      },
      data: {
        isActive: false,
        couponId: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully.",
    });
  } catch (error) {
    next(error);
  }
});

export default cartRouter;
