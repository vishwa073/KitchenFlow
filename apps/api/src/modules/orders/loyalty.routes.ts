import { Router } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/require-auth.js";

const loyaltyRouter = Router();

// GET /api/loyalty/balance
// Return the logged-in customer's current loyalty points.
loyaltyRouter.get("/balance", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
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

    const loyaltyAccount = await prisma.loyaltyAccount.findUnique({
      where: { userId: user.id },
      select: {
        points: true,
      },
    });

    res.status(200).json({
      success: true,
      points: loyaltyAccount?.points ?? 0,
    });
  } catch (error) {
    next(error);
  }
});

export default loyaltyRouter;