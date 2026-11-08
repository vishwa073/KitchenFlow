import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { PaymentMethod } from "../../../generated/prisma/client.js";
import { sendWhatsAppMessage } from "../auth/whatsapp.service.js";
const ordersRouter = Router();

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

// Resolve Clerk ID to the internal database User ID.
async function getDatabaseUser(clerkUserId: string) {
  return prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      isActive: true,
    },
  });
}

// GET /api/orders
// Return the logged-in user's orders.
ordersRouter.get("/", requireAuth, async (req, res, next) => {
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

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { placedAt: "desc" },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            addons: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/orders/:orderId
// Fetch one order owned by the logged-in user.
ordersRouter.get("/:orderId", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    const { orderId } = req.params;

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!isNonEmptyString(orderId)) {
      res.status(400).json({
        success: false,
        message: "Invalid order ID.",
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

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          include: {
            addons: true,
          },
        },
        payments: true,
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
        prepTimeEstimates: {
          orderBy: { estimatedAt: "desc" },
          take: 1,
        },
      },
    });

    if (!order) {
      res.status(404).json({
        success: false,
        message: "Order not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/orders
// Create an order from the authenticated user's active cart.
ordersRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const { addressId, paymentMethod, redeemPoints } = req.body as {
      addressId?: unknown;
      paymentMethod?: unknown;
      redeemPoints?: unknown;
    };

    if (
      redeemPoints !== undefined &&
      (typeof redeemPoints !== "number" ||
        !Number.isInteger(redeemPoints) ||
        redeemPoints < 0)
    ) {
      res.status(400).json({
        success: false,
        message: "Redeemed loyalty points must be a non-negative whole number.",
      });
      return;
    }

    const requestedRedeemPoints = (redeemPoints as number | undefined) ?? 0;

    if (
      typeof paymentMethod !== "string" ||
      !["UPI", "CARD"].includes(paymentMethod)
    ) {
      res.status(400).json({
        success: false,
        message: "Payment method must be UPI or CARD.",
      });
      return;
    }

    if (typeof addressId !== "string" || addressId.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "A saved address ID is required.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      res.status(404).json({
        success: false,
        message: "User profile not found or inactive.",
      });
      return;
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Fetch the authenticated user's active cart.
        const cart = await tx.cart.findFirst({
          where: {
            userId: user.id,
            isActive: true,
          },
          include: {
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
          },
        });

        if (!cart || cart.items.length === 0) {
          return {
            error: "Your cart is empty.",
            status: 400,
          };
        }

        // Validate that the saved address belongs to this user.
        const address = await tx.address.findFirst({
          where: {
            id: addressId,
            userId: user.id,
          },
        });

        if (!address) {
          return {
            error: "Selected address was not found.",
            status: 404,
          };
        }

        // DELIVERY orders include an address snapshot.
        // PICKUP orders do not include an address snapshot.
        const deliveryAddressSnapshot =
          cart.fulfillmentType === "DELIVERY"
            ? {
                id: address.id,
                label: address.label,
                recipientName: address.recipientName,
                phone: address.phone,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                landmark: address.landmark,
                area: address.area,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                latitude: address.latitude?.toString() ?? null,
                longitude: address.longitude?.toString() ?? null,
              }
            : undefined;

        let subtotal = 0;
        let addonTotal = 0;

        // Prepare order items and calculate totals.
        const orderItems = cart.items.map((cartItem) => {
          const itemQuantity = cartItem.quantity;
          const unitPrice = Number(cartItem.unitPrice);

          const itemSubtotal = unitPrice * itemQuantity;
          subtotal += itemSubtotal;

          const orderAddons = cartItem.addons.map((cartAddon) => {
            const addonUnitPrice = Number(cartAddon.unitPrice);

            const addonLineTotal =
              addonUnitPrice * cartAddon.quantity * itemQuantity;

            addonTotal += addonLineTotal;

            return {
              addonName: cartAddon.addonPrice.addon.name,
              quantity: cartAddon.quantity * itemQuantity,
              unitPrice: addonUnitPrice,
              lineTotal: addonLineTotal,
            };
          });

          const lineTotal =
            itemSubtotal +
            orderAddons.reduce((sum, addon) => sum + addon.lineTotal, 0);

          return {
            menuItemName: cartItem.outletMenuItem.menuItem.name,
            variantName: cartItem.variantPrice.variant.name,
            foodType: cartItem.outletMenuItem.menuItem.foodType,
            quantity: itemQuantity,
            unitPrice,
            lineTotal,
            addons: orderAddons,
          };
        });

        // Current initial implementation: no coupon, tax, or delivery fee.
        // These values can be wired to the relevant configuration later.
        // Coupon is applied through the active cart.
        let couponId: string | null = null;
        let couponCode: string | null = null;
        let couponDiscount = 0;

        if (cart.couponId) {
          const coupon = await tx.coupon.findUnique({
            where: { id: cart.couponId },
          });

          const now = new Date();
          const eligibleAmount = subtotal + addonTotal;

          if (
            !coupon ||
            !coupon.isActive ||
            now < coupon.startsAt ||
            now > coupon.expiresAt
          ) {
            return {
              error:
                "The applied coupon is no longer valid. Please remove it and try again.",
              status: 400,
            };
          }

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
              where: { couponId: coupon.id },
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

          if (coupon.discountType === "PERCENTAGE") {
            couponDiscount =
              (eligibleAmount * Number(coupon.discountValue)) / 100;
          } else {
            couponDiscount = Number(coupon.discountValue);
          }

          if (coupon.maxDiscount !== null) {
            couponDiscount = Math.min(
              couponDiscount,
              Number(coupon.maxDiscount),
            );
          }

          couponDiscount = Math.min(
            Number(couponDiscount.toFixed(2)),
            eligibleAmount,
          );

          couponId = coupon.id;
          couponCode = coupon.code;
        }

        // Loyalty redemption is validated and applied below.
        const taxAmount = 0;
        const deliveryFee = 0;

        let totalAmount = Math.max(
          0,
          Number(
            (
              subtotal +
              addonTotal -
              couponDiscount +
              taxAmount +
              deliveryFee
            ).toFixed(2),
          ),
        );

        let loyaltyPointsRedeemed = 0;
        let loyaltyDiscount = 0;

        if (requestedRedeemPoints > 0) {
          const loyaltyAccount = await tx.loyaltyAccount.findUnique({
            where: { userId: user.id },
          });

          if (!loyaltyAccount) {
            return {
              error: "Loyalty account not found.",
              status: 400,
            };
          }

          if (requestedRedeemPoints > loyaltyAccount.points) {
            return {
              error: "Insufficient loyalty points.",
              status: 400,
            };
          }

          // 1 point = ₹1. Redeem only whole points.
          loyaltyPointsRedeemed = Math.min(
            requestedRedeemPoints,
            Math.floor(totalAmount),
          );

          loyaltyDiscount = loyaltyPointsRedeemed;

          totalAmount = Math.max(
            0,
            Number((totalAmount - loyaltyDiscount).toFixed(2)),
          );
        }

        // The Order.discountAmount stores the combined discount.
        const discountAmount = Number(
          (couponDiscount + loyaltyDiscount).toFixed(2),
        );

        const orderNumber = `KF-${Date.now()}-${Math.floor(
          Math.random() * 10000,
        )}`;

        // 1. Create the parent Order first.
        // OrderItems are intentionally created separately below.
        const validatedPaymentMethod = paymentMethod as PaymentMethod;
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            outletId: cart.outletId,
            status: "PLACED",
            fulfillmentType: cart.fulfillmentType,
            paymentMethod: validatedPaymentMethod,
            paymentStatus: "PENDING",

            customerName: address.recipientName,
            customerEmail: user.email,
            customerPhone: address.phone,

            deliveryAddressSnapshot,

            subtotal,
            addonTotal,
            discountAmount,
            taxAmount,
            deliveryFee,
            totalAmount,
            couponId,
            couponCode,
            loyaltyPointsRedeemed,
            loyaltyPointsEarned: 0,

            payments: {
              create: {
                method: paymentMethod as PaymentMethod,
                status: "PENDING",
                amount: totalAmount,
                currency: "INR",
                provider: "MOCK",
              },
            },

            statusHistory: {
              create: {
                fromStatus: null,
                toStatus: "PLACED",
                note: "Order placed by customer.",
                changedByUserId: user.id,
              },
            },
          },
        });

        if (couponId) {
          await tx.couponRedemption.create({
            data: {
              couponId,
              userId: user.id,
              orderId: order.id,
              discountAmount: couponDiscount,
            },
          });
        }

        // Deduct redeemed loyalty points and record the transaction.
        if (loyaltyPointsRedeemed > 0) {
          const loyaltyAccount = await tx.loyaltyAccount.findUnique({
            where: { userId: user.id },
          });

          if (!loyaltyAccount) {
            // Throwing rolls back the Order and any related writes.
            throw new Error("LOYALTY_ACCOUNT_NOT_FOUND");
          }

          // Atomic conditional deduction prevents the balance going below zero.
          const deduction = await tx.loyaltyAccount.updateMany({
            where: {
              userId: user.id,
              points: {
                gte: loyaltyPointsRedeemed,
              },
            },
            data: {
              points: {
                decrement: loyaltyPointsRedeemed,
              },
            },
          });

          if (deduction.count !== 1) {
            // Throwing rolls back the Order, coupon redemption, and cart changes.
            throw new Error("INSUFFICIENT_LOYALTY_POINTS");
          }

          await tx.loyaltyTransaction.create({
            data: {
              accountId: loyaltyAccount.id,
              userId: user.id,
              orderId: order.id,
              type: "REDEEMED",
              points: loyaltyPointsRedeemed,
              note: `Redeemed for order ${order.id}`,
            },
          });
        }

        if (!order) {
          throw new Error("Order creation returned null.");
        }

        console.log("Created order:", order);

        // 2. Create OrderItems using the actual parent order ID.
        // This replaces the failing nested Order.items.create operation.
        for (const item of orderItems) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              menuItemName: item.menuItemName,
              variantName: item.variantName,
              foodType: item.foodType,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,

              addons: {
                create: item.addons.map((addon) => ({
                  addonName: addon.addonName,
                  quantity: addon.quantity,
                  unitPrice: addon.unitPrice,
                  lineTotal: addon.lineTotal,
                })),
              },
            },
          });
        }

        // 3. Fetch the complete order with its items and related records.
        const createdOrder = await tx.order.findUniqueOrThrow({
          where: {
            id: order.id,
          },
          include: {
            items: {
              include: {
                addons: true,
              },
            },
            payments: true,
            statusHistory: true,
          },
        });

        // 4. Deactivate the cart only after all order records are created.
        // If any preceding operation fails, the transaction rolls back.
        await tx.cart.update({
          where: {
            id: cart.id,
          },
          data: {
            isActive: false,
            couponId: null,
          },
        });

        return {
          order: createdOrder,
        };
      },
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    if ("error" in result) {
      res.status(result.status ?? 400).json({
        success: false,
        message: result.error,
      });
      return;
    }
    // Send WhatsApp order confirmation.
    // Order creation must remain successful even if WhatsApp sending fails.
    try {
      const whatsappMessage = [
        "🍽️ *KitchenFlow — Order Confirmation*",
        "",
        `Your order *${result.order.orderNumber}* has been placed successfully!`,
        "",
        `💰 Total: ₹${Number(result.order.totalAmount).toFixed(2)}`,
        `💳 Payment Method: ${result.order.paymentMethod}`,
        "",
        "Thank you for ordering with us!",
      ].join("\n");

      await sendWhatsAppMessage(result.order.customerPhone, whatsappMessage);
    } catch (error) {
      console.error("Failed to send WhatsApp order confirmation:", error);
    }
    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: result.order,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "INSUFFICIENT_LOYALTY_POINTS") {
        res.status(400).json({
          success: false,
          message: "Insufficient loyalty points.",
        });
        return;
      }

      if (error.message === "LOYALTY_ACCOUNT_NOT_FOUND") {
        res.status(400).json({
          success: false,
          message: "Loyalty account not found.",
        });
        return;
      }
    }

    console.error("POST /api/orders failed:");
    console.dir(error, { depth: 10 });
    next(error);
  }
});

export default ordersRouter;
