
import { createServer } from "node:http";
import { Server } from "socket.io";
import { verifyToken } from "@clerk/backend";
import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { startLateOrderDetection } from "./modules/kitchen/kitchen-alerts.service.js";
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: env.WEB_URL,
    credentials: true,
  },
});

// Authenticate the Socket.IO connection and resolve authorized rooms.
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (typeof token !== "string" || !token) {
      return next(new Error("Authentication required"));
    }

    const verifiedToken = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });

    const clerkUserId = verifiedToken.sub;

    if (!clerkUserId) {
      return next(new Error("Invalid authentication token"));
    }

    // Map the verified Clerk ID to KitchenFlow's internal user.
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
            outlet: {
              isActive: true,
            },
          },
          select: {
            outletId: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return next(new Error("Active KitchenFlow user not found"));
    }

    // Store only server-resolved identity and authorization.
    socket.data.clerkUserId = clerkUserId;
    socket.data.internalUserId = user.id;
    socket.data.outletIds = user.outletStaff.map(
      (assignment) => assignment.outletId,
    );

    next();
  } catch (error) {
    console.error("Socket authentication failed:", error);
    next(new Error("Authentication failed"));
  }
});

app.set("io", io);

startLateOrderDetection(io);
io.on("connection", async (socket) => {
  const internalUserId = socket.data.internalUserId as string;
  const outletIds = socket.data.outletIds as string[];

  // Customer room: internal DB user ID, not the Clerk ID.
  await socket.join(`customer:${internalUserId}`);

  // Outlet rooms: only outlets with active authorized staff assignments.
  for (const outletId of outletIds) {
    await socket.join(`outlet:${outletId}`);
  }

  console.log("Authenticated socket connected:", {
    socketId: socket.id,
    internalUserId,
    outletIds,
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`KitchenFlow API running at http://localhost:${env.PORT}`);
  console.log("Socket.IO authentication and room authorization are ready");
});
