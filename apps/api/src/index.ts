import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

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

app.listen(env.PORT, () => {
  console.log(`KitchenFlow API running at http://localhost:${env.PORT}`);
});