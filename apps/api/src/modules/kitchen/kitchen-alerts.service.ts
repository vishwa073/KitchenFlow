import type { Server } from "socket.io";
import { prisma } from "../../lib/prisma.js";

const LATE_ORDER_THRESHOLD_MINUTES = 10;
const ALERT_CHECK_INTERVAL_MS = 30_000;

let isCheckingLateOrders = false;

export async function checkForLateOrders(io: Server): Promise<void> {
  if (isCheckingLateOrders) return;

  isCheckingLateOrders = true;

  try {
    const threshold = new Date(
      Date.now() - LATE_ORDER_THRESHOLD_MINUTES * 60 * 1000,
    );

    const overdueOrders = await prisma.order.findMany({
      where: {
        promisedAt: {
          lte: threshold,
        },
        status: {
          in: ["PLACED", "ACCEPTED", "PREPARING"],
        },
      },
      select: {
        id: true,
        orderNumber: true,
        outletId: true,
        promisedAt: true,
      },
    });

    for (const order of overdueOrders) {
      try {
        const existingAlert = await prisma.kitchenAlert.findUnique({
          where: {
            orderId_type: {
              orderId: order.id,
              type: "LATE_ORDER",
            },
          },
          select: {
            id: true,
          },
        });

        // The unique constraint also protects against duplicate alerts.
        if (existingAlert) continue;

        const alert = await prisma.kitchenAlert.create({
          data: {
            orderId: order.id,
            type: "LATE_ORDER",
            message: `Order ${order.orderNumber} is more than ${LATE_ORDER_THRESHOLD_MINUTES} minutes past its promised preparation time.`,
          },
        });

        io.to(`outlet:${order.outletId}`).emit("kitchen.alert.created", {
          alert,
          orderId: order.id,
          orderNumber: order.orderNumber,
          outletId: order.outletId,
        });

        console.log("Late-order alert created:", order.orderNumber);
      } catch (error) {
        // A parallel check may have created the same alert.
        // The database unique constraint prevents duplication.
        console.error(
          `Could not create late-order alert for ${order.orderNumber}:`,
          error,
        );
      }
    }
  } catch (error) {
    console.error("Late-order detection failed:", error);
  } finally {
    isCheckingLateOrders = false;
  }
}

export function startLateOrderDetection(io: Server): void {
  // Run once during startup.
  void checkForLateOrders(io);

  // Continue checking every 30 seconds.
  setInterval(() => {
    void checkForLateOrders(io);
  }, ALERT_CHECK_INTERVAL_MS);

  console.log("Late-order detection started.");
}