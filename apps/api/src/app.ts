
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import serviceabilityRoutes from "./routes/serviceability.routes.js";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/error-handler.js";
import { prisma } from "./lib/prisma.js";
import authRouter from "./modules/auth/auth.routes.js";
import addressRoutes from "./modules/address/address.routes.js";
import outletRoutes from "./modules/outlets/outlet.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import cartRouter from "./modules/cart/cart.routes.js";
import ordersRouter from "./modules/orders/orders.routes.js";
import partyRouter from "./modules/party/party.routes.js";

const app = express();

// Clerk middleware must run before other middleware
app.use(clerkMiddleware({ debug: true }));

// CORS configuration
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
  }),
);

// Parse JSON request bodies
app.use(express.json({ limit: "1mb" }));
app.use("/api/serviceability", serviceabilityRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/party", partyRouter);

app.use("/api/outlets", outletRoutes);
// Authentication routes
app.use("/api/auth", authRouter);
// Address routes
app.use("/api/addresses", addressRoutes);

// API health check
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "KitchenFlow API is running",
    timestamp: new Date().toISOString(),
  });
});

// Database health check
app.get("/api/health/db", async (_req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: "Neon database connection is healthy",
    });
  } catch (error) {
    next(error);
  }
});

// Global error handler (keep this last)
app.use(errorHandler);

export default app;
