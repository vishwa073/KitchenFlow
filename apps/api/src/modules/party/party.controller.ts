import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "../../lib/prisma.js";
import {
  createPartyRequest,
  getCustomerPartyRequests,
  getCustomerPartyRequestById,
  PartyServiceError,
} from "./party.service.js";
import { validateCreatePartyRequest } from "./party.validation.js";

export async function createPartyRequestController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found. Call /api/auth/me first.",
      });
      return;
    }

    const validation = validateCreatePartyRequest(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: validation.errors?.join(", ") ?? "Invalid party request data",
      });
      return;
    }

    if (!validation.data) {
      res.status(400).json({
        success: false,
        message: "Invalid party request data",
      });
      return;
    }

    const partyRequest = await createPartyRequest(user.id, validation.data);

    res.status(201).json({
      success: true,
      message: "Party request submitted successfully",
      partyRequest,
    });
  } catch (error) {
    if (error instanceof PartyServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
}

export async function getMyPartyRequestsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found. Call /api/auth/me first.",
      });
      return;
    }

    const requests = await getCustomerPartyRequests(user.id);

    res.status(200).json({
      success: true,
      partyRequests: requests,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyPartyRequestByIdController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
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
      select: { id: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User profile not found. Call /api/auth/me first.",
      });
      return;
    }

    const requestId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!requestId) {
      res.status(400).json({
        success: false,
        message: "Party request ID is required",
      });
      return;
    }

    const partyRequest = await getCustomerPartyRequestById(user.id, requestId);

    res.status(200).json({
      success: true,
      partyRequest,
    });
  } catch (error) {
    if (error instanceof PartyServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    next(error);
  }
}
