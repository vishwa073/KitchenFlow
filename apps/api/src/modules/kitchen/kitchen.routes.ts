import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/require-auth.js";
import type { Server } from "socket.io";
import { sendWhatsAppMessage } from "../auth/whatsapp.service.js";
async function getKitchenAlertAuth(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      isActive: true,
      outletStaff: {
        where: {
          isActive: true,
          role: {
            in: ["MANAGER", "KITCHEN_STAFF"],
          },
        },
        select: {
          outletId: true,
          role: true,
        },
      },
    },
  });

  if (!user || !user.isActive) return null;

  return {
    userId: user.id,
    outletStaff: user.outletStaff,
    outletIds: user.outletStaff.map((assignment) => assignment.outletId),
    managerOutletIds: user.outletStaff
      .filter((assignment) => assignment.role === "MANAGER")
      .map((assignment) => assignment.outletId),
  };
}
const kitchenRouter = Router();

const ACTIVE_KITCHEN_STATUSES = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "AWAITING_DELIVERY_PARTNER",
] as const;
const ALLOWED_STATUS_TRANSITIONS: Record<string, readonly string[]> = {
  PLACED: ["ACCEPTED", "CANCELLED"],
  ACCEPTED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["AWAITING_DELIVERY_PARTNER", "HANDED_OFF", "CANCELLED"],
  AWAITING_DELIVERY_PARTNER: ["HANDED_OFF", "CANCELLED"],
  HANDED_OFF: [],
  CANCELLED: [],
};

function getWhatsAppStatusMessage(orderNumber: string, status: string): string {
  const order = `*${orderNumber}*`;

  switch (status) {
    case "ACCEPTED":
      return `🍽️ *KitchenFlow — Order Update*

Your order ${order} has been accepted by the restaurant! 🎉

👨‍🍳 Our kitchen is getting ready to prepare your delicious meal.

Thank you for ordering with us!`;

    case "PREPARING":
      return `🍽️ *KitchenFlow — Order Update*

Good news! Your order ${order} is now being freshly prepared by our kitchen team. 👨‍🍳

We're making it with care. Thank you for your patience!`;

    case "READY":
      return `🍽️ *KitchenFlow — Order Update*

Your order ${order} is ready! 🎉

Your delicious meal has been prepared and is waiting for the next step.

Thank you for ordering with us!`;

    case "AWAITING_DELIVERY_PARTNER":
      return `🍽️ *KitchenFlow — Order Update*

Your order ${order} is ready and waiting for a delivery partner. 🛵

We'll notify you once it's on its way!`;

    case "HANDED_OFF":
      return `🍽️ *KitchenFlow — Order Update*

Your order ${order} has been handed over to the delivery partner. 🚀

Your meal is on its way. Enjoy every bite! ❤️`;

    case "CANCELLED":
      return `🍽️ *KitchenFlow — Order Update*

We're sorry! Your order ${order} has been cancelled. ❌

If you have any questions, please contact the restaurant.`;

    default:
      return `🍽️ *KitchenFlow — Order Update*

The status of your order ${order} has been updated to *${status}*.

Thank you for ordering with us!`;
  }
}

// GET /api/kitchen/orders
// Fetch real customer orders for the staff member's assigned outlet(s).
kitchenRouter.get("/orders", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    // Resolve Clerk identity to the internal database user.
    const user = await prisma.user.findUnique({
      where: {
        clerkUserId,
      },
      select: {
        id: true,
        isActive: true,
        outletStaff: {
          where: {
            isActive: true,
            role: {
              in: ["MANAGER", "KITCHEN_STAFF"],
            },
          },
          select: {
            outletId: true,
            role: true,
            outlet: {
              select: {
                id: true,
                name: true,
                code: true,
                minimumPrepTimeMin: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: "Active staff profile required.",
      });
      return;
    }

    const staffOutlets = user.outletStaff;

    if (staffOutlets.length === 0) {
      res.status(403).json({
        success: false,
        message: "No active kitchen outlet assignment found.",
      });
      return;
    }

    const outletIds = staffOutlets.map((assignment) => assignment.outletId);

    // Read the same Order records created by POST /api/orders.
    // Scope them to outlets assigned to this staff member.
    const orders = await prisma.order.findMany({
      where: {
        outletId: {
          in: outletIds,
        },
        status: {
          in: [...ACTIVE_KITCHEN_STATUSES],
        },
      },
      orderBy: {
        placedAt: "asc",
      },
      include: {
        outlet: {
          select: {
            id: true,
            name: true,
            code: true,
            minimumPrepTimeMin: true,
          },
        },
        items: {
          include: {
            addons: true,
          },
        },
        statusHistory: {
          orderBy: {
            createdAt: "asc",
          },
        },
        prepTimeEstimates: {
          orderBy: {
            estimatedAt: "desc",
          },
          take: 1,
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
// PATCH /api/kitchen/orders/:orderId/status
// Update order status and record the change in status history.
kitchenRouter.patch(
  "/orders/:orderId/status",
  requireAuth,
  async (req, res, next) => {
    try {
      const { userId: clerkUserId } = getAuth(req);

      if (!clerkUserId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      const orderId = req.params.orderId;

      if (typeof orderId !== "string" || orderId.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
        return;
      }
      const { status: nextStatus, note } = req.body as {
        status?: string;
        note?: string;
      };

      if (!nextStatus || typeof nextStatus !== "string") {
        res.status(400).json({
          success: false,
          message: "A valid status is required.",
        });
        return;
      }
      const validStatuses = [
        "ACCEPTED",
        "PREPARING",
        "READY",
        "AWAITING_DELIVERY_PARTNER",
        "HANDED_OFF",
        "CANCELLED",
      ];

      if (!validStatuses.includes(nextStatus)) {
        res.status(400).json({
          success: false,
          message: "Invalid order status.",
        });
        return;
      }

      if (
        note !== undefined &&
        (typeof note !== "string" || note.trim().length > 500)
      ) {
        res.status(400).json({
          success: false,
          message: "Note must be a string with at most 500 characters.",
        });
        return;
      }

      // Resolve the Clerk account to the internal user.
      const user = await prisma.user.findUnique({
        where: {
          clerkUserId,
        },
        select: {
          id: true,
          isActive: true,
          outletStaff: {
            where: {
              isActive: true,
              role: {
                in: ["MANAGER", "KITCHEN_STAFF"],
              },
            },
            select: {
              outletId: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: "Active staff profile required.",
        });
        return;
      }

      const outletIds = user.outletStaff.map(
        (assignment) => assignment.outletId,
      );

      if (outletIds.length === 0) {
        res.status(403).json({
          success: false,
          message: "No active kitchen outlet assignment found.",
        });
        return;
      }

      // Only allow updating orders from the staff member's assigned outlets.
      const updatedOrder = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({
          where: {
            id: orderId,
            outletId: {
              in: outletIds,
            },
          },
          select: {
            id: true,
            orderNumber: true,
            outletId: true,
            status: true,
          },
        });

        if (!order) {
          return {
            error: "ORDER_NOT_FOUND",
          } as const;
        }

        const allowedTransitions =
          ALLOWED_STATUS_TRANSITIONS[order.status] ?? [];

        if (!allowedTransitions.includes(nextStatus)) {
          return {
            error: "INVALID_STATUS_TRANSITION",
            currentStatus: order.status,
          } as const;
        }

        const updated = await tx.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: nextStatus as
              | "ACCEPTED"
              | "PREPARING"
              | "READY"
              | "AWAITING_DELIVERY_PARTNER"
              | "HANDED_OFF"
              | "CANCELLED",

            ...(nextStatus === "ACCEPTED" && {
              acceptedAt: new Date(),
            }),

            ...(nextStatus === "READY" && {
              readyAt: new Date(),
            }),

            ...(nextStatus === "HANDED_OFF" && {
              handedOffAt: new Date(),
            }),

            ...(nextStatus === "CANCELLED" && {
              cancelledAt: new Date(),
            }),
          },
          include: {
            outlet: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            items: {
              include: {
                addons: true,
              },
            },
            statusHistory: {
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            fromStatus: order.status,
            toStatus: nextStatus as
              | "ACCEPTED"
              | "PREPARING"
              | "READY"
              | "AWAITING_DELIVERY_PARTNER"
              | "HANDED_OFF"
              | "CANCELLED",
            changedByUserId: user.id,
            note: typeof note === "string" ? note.trim() || null : null,
          },
        });

        return {
          order: updated,
        } as const;
      });

      if ("error" in updatedOrder) {
        if (updatedOrder.error === "ORDER_NOT_FOUND") {
          res.status(404).json({
            success: false,
            message: "Order not found for your assigned outlet.",
          });
          return;
        }

        res.status(400).json({
          success: false,
          message: `Cannot transition order from ${updatedOrder.currentStatus} to ${nextStatus}.`,
        });
        return;
      }

      const io = req.app.get("io") as Server | undefined;

      io?.to(`customer:${updatedOrder.order.userId}`).emit(
        "order.status.updated",
        {
          orderId: updatedOrder.order.id,
          status: updatedOrder.order.status,
          updatedAt: new Date().toISOString(),
        },
      );
      const whatsappMessage = getWhatsAppStatusMessage(
        updatedOrder.order.orderNumber,
        updatedOrder.order.status,
      );

      void sendWhatsAppMessage(
        updatedOrder.order.customerPhone,
        whatsappMessage,
      ).catch((error) => {
        console.error("WhatsApp notification failed:", error);
      });

      res.status(200).json({
        success: true,
        message: "Order status updated successfully.",
        order: updatedOrder.order,
      });
    } catch (error) {
      next(error);
    }
  },
);
// POST /api/kitchen/orders/:orderId/notes
// Add a kitchen note to an order belonging to the staff member's assigned outlet.
kitchenRouter.post(
  "/orders/:orderId/notes",
  requireAuth,
  async (req, res, next) => {
    try {
      const { userId: clerkUserId } = getAuth(req);

      if (!clerkUserId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      const orderId = req.params.orderId;
      if (typeof orderId !== "string" || orderId.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid order ID.",
        });
        return;
      }

      const { note } = req.body as { note?: unknown };

      if (typeof note !== "string" || note.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "A kitchen note is required.",
        });
        return;
      }

      if (note.trim().length > 500) {
        res.status(400).json({
          success: false,
          message: "Kitchen note must be at most 500 characters.",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { clerkUserId },
        select: {
          id: true,
          isActive: true,
          outletStaff: {
            where: {
              isActive: true,
              role: { in: ["MANAGER", "KITCHEN_STAFF"] },
            },
            select: { outletId: true },
          },
        },
      });

      if (!user || !user.isActive) {
        res.status(403).json({
          success: false,
          message: "Active staff profile required.",
        });
        return;
      }

      const outletIds = user.outletStaff.map(
        (assignment) => assignment.outletId,
      );

      if (outletIds.length === 0) {
        res.status(403).json({
          success: false,
          message: "No active kitchen outlet assignment found.",
        });
        return;
      }

      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          outletId: { in: outletIds },
        },
        select: { id: true },
      });

      if (!order) {
        res.status(404).json({
          success: false,
          message: "Order not found for your assigned outlet.",
        });
        return;
      }

      const kitchenNote = await prisma.kitchenOrderNote.create({
        data: {
          orderId: order.id,
          note: note.trim(),
          createdByUserId: user.id,
        },
      });

      res.status(201).json({
        success: true,
        message: "Kitchen note added successfully.",
        note: kitchenNote,
      });
    } catch (error) {
      next(error);
    }
  },
  
);
// GET /api/kitchen/alerts
// View alerts belonging to the staff member's assigned outlets.
kitchenRouter.get("/alerts", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const auth = await getKitchenAlertAuth(clerkUserId);

    if (!auth || auth.outletIds.length === 0) {
      res.status(403).json({
        success: false,
        message: "Active kitchen outlet assignment required.",
      });
      return;
    }

    const alerts = await prisma.kitchenAlert.findMany({
      where: {
        order: {
          outletId: {
            in: auth.outletIds,
          },
        },
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
            promisedAt: true,
            outletId: true,
            outlet: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
        acknowledgedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        triggeredAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/kitchen/alerts/:alertId/acknowledge
// Only the assigned outlet manager can acknowledge an alert.
kitchenRouter.patch(
  "/alerts/:alertId/acknowledge",
  requireAuth,
  async (req, res, next) => {
    try {
      const { userId: clerkUserId } = getAuth(req);
      const alertId = req.params.alertId;

      if (!clerkUserId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (typeof alertId !== "string" || !alertId.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid alert ID.",
        });
        return;
      }

      const auth = await getKitchenAlertAuth(clerkUserId);

      if (!auth || auth.managerOutletIds.length === 0) {
        res.status(403).json({
          success: false,
          message: "Outlet manager access required.",
        });
        return;
      }

      const alert = await prisma.kitchenAlert.findFirst({
        where: {
          id: alertId,
          order: {
            outletId: {
              in: auth.managerOutletIds,
            },
          },
        },
        select: {
          id: true,
          status: true,
          order: {
            select: {
              outletId: true,
            },
          },
        },
      });

      if (!alert) {
        res.status(404).json({
          success: false,
          message: "Alert not found for your assigned outlet.",
        });
        return;
      }

      if (alert.status !== "OPEN") {
        res.status(400).json({
          success: false,
          message: "Only open alerts can be acknowledged.",
        });
        return;
      }

      const updatedAlert = await prisma.kitchenAlert.update({
        where: { id: alert.id },
        data: {
          status: "ACKNOWLEDGED",
          acknowledgedAt: new Date(),
          acknowledgedByUserId: auth.userId,
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              outletId: true,
            },
          },
          acknowledgedBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      const io = req.app.get("io") as Server | undefined;

      io?.to(`outlet:${updatedAlert.order.outletId}`).emit(
        "kitchen.alert.updated",
        {
          alert: updatedAlert,
        },
      );

      res.status(200).json({
        success: true,
        message: "Alert acknowledged.",
        alert: updatedAlert,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/kitchen/alerts/:alertId/resolve
// Only the assigned outlet manager can resolve an alert.
kitchenRouter.patch(
  "/alerts/:alertId/resolve",
  requireAuth,
  async (req, res, next) => {
    try {
      const { userId: clerkUserId } = getAuth(req);
      const alertId = req.params.alertId;

      if (!clerkUserId) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
        return;
      }

      if (typeof alertId !== "string" || !alertId.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid alert ID.",
        });
        return;
      }

      const auth = await getKitchenAlertAuth(clerkUserId);

      if (!auth || auth.managerOutletIds.length === 0) {
        res.status(403).json({
          success: false,
          message: "Outlet manager access required.",
        });
        return;
      }

      const alert = await prisma.kitchenAlert.findFirst({
        where: {
          id: alertId,
          order: {
            outletId: {
              in: auth.managerOutletIds,
            },
          },
        },
        select: {
          id: true,
          status: true,
          order: {
            select: {
              outletId: true,
            },
          },
        },
      });

      if (!alert) {
        res.status(404).json({
          success: false,
          message: "Alert not found for your assigned outlet.",
        });
        return;
      }

      if (
        alert.status !== "OPEN" &&
        alert.status !== "ACKNOWLEDGED"
      ) {
        res.status(400).json({
          success: false,
          message: "Alert is already resolved.",
        });
        return;
      }

      const updatedAlert = await prisma.kitchenAlert.update({
        where: { id: alert.id },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
        },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              outletId: true,
            },
          },
          acknowledgedBy: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      });

      const io = req.app.get("io") as Server | undefined;

      io?.to(`outlet:${updatedAlert.order.outletId}`).emit(
        "kitchen.alert.updated",
        {
          alert: updatedAlert,
        },
      );

      res.status(200).json({
        success: true,
        message: "Alert resolved.",
        alert: updatedAlert,
      });
    } catch (error) {
      next(error);
    }
  },
);
export default kitchenRouter;
