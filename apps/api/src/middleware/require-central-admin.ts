
import type { RequestHandler } from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../lib/prisma.js";

export const requireCentralAdmin: RequestHandler = async (
  req,
  res,
  next,
) => {
  try {
    const { userId: clerkUserId } = getAuth(req);

    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: {
        isActive: true,
        roleAssignments: {
          select: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      res.status(403).json({
        success: false,
        message: "User account is inactive or not found",
      });
      return;
    }

    const isCentralAdmin = user.roleAssignments.some(
      (assignment) => assignment.role === "CENTRAL_ADMIN",
    );

    if (!isCentralAdmin) {
      res.status(403).json({
        success: false,
        message: "Central admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
