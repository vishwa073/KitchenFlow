import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

const allowedStatuses = [
  "PLACED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "AWAITING_DELIVERY_PARTNER",
  "HANDED_OFF",
  "CANCELLED",
] as const;

async function getManager(req: Request) {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      isActive: true,
      roleAssignments: { select: { role: true } },
      outletStaff: {
        where: { isActive: true },
        select: { outletId: true, role: true },
      },
    },
  });

  if (!user?.isActive) return null;

  const isAdmin = user.roleAssignments.some((r) => r.role === "CENTRAL_ADMIN");

  const outletIds = user.outletStaff
    .filter((s) => s.role === "MANAGER")
    .map((s) => s.outletId);

  if (!isAdmin && !outletIds.length) return null;

  return { userId: user.id, isAdmin, outletIds };
}

function authRequired(req: Request, res: Response, next: NextFunction) {
  void getManager(req)
    .then((auth) => {
      if (!auth) {
        return res.status(403).json({
          success: false,
          message: "Manager access required.",
        });
      }
      res.locals.manager = auth;
      next();
    })
    .catch(next);
}

// GET /api/management/manager/orders
router.get("/", authRequired, async (_req, res, next) => {
  try {
    const auth = res.locals.manager as Awaited<ReturnType<typeof getManager>>;

    const orders = await prisma.order.findMany({
      where: auth!.isAdmin ? {} : { outletId: { in: auth!.outletIds } },
      include: {
        items: { include: { addons: true } },
        outlet: { select: { id: true, name: true } },
      },
      orderBy: { placedAt: "desc" },
    });

    res.json({ success: true, orders });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/management/manager/orders/:id/status
router.patch("/:id/status", authRequired, async (req, res, next) => {
  try {
    const auth = res.locals.manager as Awaited<ReturnType<typeof getManager>>;
    const orderId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const { status } = req.body as { status?: string };

    if (!status || !allowedStatuses.includes(status as any)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status.",
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        ...(auth!.isAdmin ? {} : { outletId: { in: auth!.outletIds } }),
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for your outlet.",
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: order.id },
        data: {
          status: status as (typeof allowedStatuses)[number],
          ...(status === "ACCEPTED" ? { acceptedAt: new Date() } : {}),
          ...(status === "READY" ? { readyAt: new Date() } : {}),
          ...(status === "HANDED_OFF" ? { handedOffAt: new Date() } : {}),
          ...(status === "CANCELLED" ? { cancelledAt: new Date() } : {}),
        },
        include: {
          items: { include: { addons: true } },
          outlet: { select: { id: true, name: true } },
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: status as (typeof allowedStatuses)[number],
          changedByUserId: auth!.userId,
        },
      });

      return result;
    });

    // Notify KDS / other connected clients
    const io = req.app.get("io");
    io?.to(`outlet:${order.outletId}`).emit("order.updated", updated);

    res.json({ success: true, order: updated });
  } catch (error) {
    next(error);
  }
});

export default router;
