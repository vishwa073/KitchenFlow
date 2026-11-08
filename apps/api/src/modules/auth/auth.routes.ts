import { Router } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import { requireAuth } from "../../middleware/require-auth.js";
import { env } from "../../config/env.js";
import { sendWhatsAppMessage } from "./whatsapp.service.js";
const authRouter = Router();

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    // Get the authenticated user's profile from Clerk
    const clerkUser = await clerkClient.users.getUser(userId);

    const primaryEmail = clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;

    if (!primaryEmail) {
      res.status(400).json({
        success: false,
        message: "A verified email address is required",
      });
      return;
    }

    const fullName =
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      null;

    // Find or create the application user in PostgreSQL
    const dbUser = await prisma.user.upsert({
      where: {
        clerkUserId: userId,
      },
      update: {
        email: primaryEmail,
        fullName,
              },
      create: {
        clerkUserId: userId,
        email: primaryEmail,
        fullName,
        phone: clerkUser.primaryPhoneNumber?.phoneNumber ?? null,
      },
      include: {
        roleAssignments: true,
      },
    });

    // Assign CUSTOMER only when the user has no role assignments
    if (dbUser.roleAssignments.length === 0) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: dbUser.id,
          role: "CUSTOMER",
        },
      });
    }

    // Fetch the profile with its final role assignments
    const userWithRoles = await prisma.user.findUniqueOrThrow({
      where: {
        id: dbUser.id,
      },
      include: {
        roleAssignments: true,
      },
    });

    res.status(200).json({
      success: true,
      user: {
        id: userWithRoles.id,
        clerkUserId: userWithRoles.clerkUserId,
        email: userWithRoles.email,
        fullName: userWithRoles.fullName,
        phone: userWithRoles.phone,
        isActive: userWithRoles.isActive,
        roles: userWithRoles.roleAssignments.map(
          (assignment) => assignment.role,
        ),
      },
    });
  } catch (error) {
    next(error);
  }
});

function normalizeWhatsAppPhone(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");

  // India: accept a local 10-digit number or country code 91.
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  // Other international numbers must be explicitly entered with +.
  if (trimmed.startsWith("+") && digits.length >= 8 && digits.length <= 15) {
    return `+${digits}`;
  }

  return null;
}

function hashOtp(otpId: string, phone: string, code: string): Buffer {
  return createHmac("sha256", env.OTP_HASH_SECRET)
    .update(`${otpId}:${phone}:${code}`)
    .digest();
}

authRouter.post("/whatsapp/send-otp", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const phone = normalizeWhatsAppPhone(req.body?.phone);
    if (!phone) {
      res.status(400).json({
        success: false,
        message: "Enter a valid WhatsApp number with country code",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found. Call /api/auth/me first.",
      });
      return;
    }
    // Expire previous unverified OTPs for this user
    await prisma.whatsAppOtp.updateMany({
      where: {
        userId: user.id,
        verifiedAt: null,
      },
      data: {
        expiresAt: new Date(),
      },
    });
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const recentOtpCount = await prisma.whatsAppOtp.count({
      where: {
        userId: user.id,
        createdAt: { gte: fifteenMinutesAgo },
      },
    });

    if (recentOtpCount >= 3) {
      res.status(429).json({
        success: false,
        message: "Too many OTP requests. Please try again later.",
      });
      return;
    }

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const otpRecord = await prisma.whatsAppOtp.create({
      data: {
        userId: user.id,
        phone,
        codeHash: "",
        expiresAt,
      },
    });

    const codeHash = hashOtp(otpRecord.id, phone, code).toString("hex");

    await prisma.whatsAppOtp.update({
      where: { id: otpRecord.id },
      data: { codeHash },
    });

    try {
      await sendWhatsAppMessage(
        phone,
        `Your KitchenFlow verification code is ${code}. It expires in 5 minutes. Do not share this code.`,
      );
    } catch (error) {
      await prisma.whatsAppOtp.delete({
        where: { id: otpRecord.id },
      });
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "OTP sent to your WhatsApp number",
      expiresInSeconds: 300,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/whatsapp/verify-otp", requireAuth, async (req, res, next) => {
  try {
    const { userId: clerkUserId } = getAuth(req);
    if (!clerkUserId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const phone = normalizeWhatsAppPhone(req.body?.phone);
    const code = typeof req.body?.code === "string" ? req.body.code.trim() : "";

    if (!phone || !/^\d{6}$/.test(code)) {
      res.status(400).json({
        success: false,
        message: "Enter a valid phone number and 6-digit OTP",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found. Call /api/auth/me first.",
      });
      return;
    }

    const otpRecord = await prisma.whatsAppOtp.findFirst({
      where: {
        userId: user.id,
        phone,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      res.status(400).json({
        success: false,
        message: "OTP is invalid or expired. Request a new one.",
      });
      return;
    }

    if (otpRecord.attempts >= 5) {
      res.status(429).json({
        success: false,
        message: "Too many verification attempts. Request a new OTP.",
      });
      return;
    }

    await prisma.whatsAppOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    const submittedHash = hashOtp(otpRecord.id, phone, code);
    const storedHash = Buffer.from(otpRecord.codeHash, "hex");

    const isValid =
      storedHash.length === submittedHash.length &&
      timingSafeEqual(storedHash, submittedHash);

    if (!isValid) {
      res.status(400).json({
        success: false,
        message: "Incorrect OTP",
        attemptsRemaining: Math.max(0, 4 - otpRecord.attempts),
      });
      return;
    }

    await prisma.$transaction([
      prisma.whatsAppOtp.update({
        where: { id: otpRecord.id },
        data: { verifiedAt: new Date() },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { phone },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: "WhatsApp number verified",
      phone,
    });
  } catch (error) {
    next(error);
  }
});

export default authRouter;
