import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";

const managementRouter = Router();

type PartyStatus = "REVIEWING" | "QUOTED" | "CONFIRMED" | "REJECTED";

type AuthContext = {
  userId: string;
  isCentralAdmin: boolean;
  outletAssignments: {
    outletId: string;
    role: "MANAGER" | "KITCHEN_STAFF" | "CATERING_MANAGER";
  }[];
};

async function getAuthContext(req: Request): Promise<AuthContext | null> {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
      id: true,
      isActive: true,
      roleAssignments: {
        select: { role: true },
      },
      outletStaff: {
        where: { isActive: true },
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
    isCentralAdmin: user.roleAssignments.some(
      (assignment) => assignment.role === "CENTRAL_ADMIN",
    ),
    outletAssignments: user.outletStaff,
  };
}

function requireCentralAdmin(req: Request, res: Response, next: NextFunction) {
  void getAuthContext(req)
    .then((auth) => {
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      if (!auth.isCentralAdmin) {
        return res.status(403).json({
          success: false,
          message: "Central admin access required.",
        });
      }

      res.locals.auth = auth;
      next();
    })
    .catch(next);
}

function requirePartyManager(req: Request, res: Response, next: NextFunction) {
  void getAuthContext(req)
    .then((auth) => {
      if (!auth) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const canManagePartyRequests =
        auth.isCentralAdmin ||
        auth.outletAssignments.some(
          (assignment) =>
            assignment.role === "MANAGER" ||
            assignment.role === "CATERING_MANAGER",
        );

      if (!canManagePartyRequests) {
        return res.status(403).json({
          success: false,
          message: "Party manager access required.",
        });
      }

      res.locals.auth = auth;
      next();
    })
    .catch(next);
}

// GET /api/management/party-requests
// Admin sees all requests. Managers see requests for assigned outlets.
managementRouter.get(
  "/party-requests",
  requirePartyManager,
  async (_req, res, next) => {
    try {
      const auth = res.locals.auth as AuthContext;

      const requests = await prisma.partyOrderRequest.findMany({
        where: auth.isCentralAdmin
          ? {}
          : {
              outletId: {
                in: auth.outletAssignments
                  .filter(
                    (assignment) =>
                      assignment.role === "MANAGER" ||
                      assignment.role === "CATERING_MANAGER",
                  )
                  .map((assignment) => assignment.outletId),
              },
            },
        include: {
          customer: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          manager: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: [{ status: "asc" }, { eventAt: "asc" }],
      });

      res.status(200).json({
        success: true,
        count: requests.length,
        requests,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/management/party-requests/:id
// Body: { status, quoteAmount?, managerNotes? }
managementRouter.patch(
  "/party-requests/:id",
  requirePartyManager,
  async (req, res, next) => {
    try {
      const auth = res.locals.auth as AuthContext;
      const requestId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      if (!requestId) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required.",
        });
      }

      const { status, quoteAmount, managerNotes } = req.body as {
        status?: string;
        quoteAmount?: number;
        managerNotes?: string;
      };

      const allowedStatuses: PartyStatus[] = [
        "REVIEWING",
        "QUOTED",
        "CONFIRMED",
        "REJECTED",
      ];

      if (!status || !allowedStatuses.includes(status as PartyStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid party request status.",
        });
      }

      if (
        status === "QUOTED" &&
        (typeof quoteAmount !== "number" ||
          !Number.isFinite(quoteAmount) ||
          quoteAmount <= 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "A positive quoteAmount is required when quoting.",
        });
      }

      const existingRequest = await prisma.partyOrderRequest.findUnique({
        where: { id: requestId },
      });

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: "Party request not found.",
        });
      }

      if (
        !auth.isCentralAdmin &&
        (!existingRequest.outletId ||
          !auth.outletAssignments.some(
            (assignment) =>
              assignment.outletId === existingRequest.outletId &&
              (assignment.role === "MANAGER" ||
                assignment.role === "CATERING_MANAGER"),
          ))
      ) {
        return res.status(403).json({
          success: false,
          message: "This request is outside your assigned outlet.",
        });
      }

      const updatedRequest = await prisma.partyOrderRequest.update({
        where: { id: requestId },
        data: {
          status: status as PartyStatus,
          managerId: auth.userId,
          ...(typeof managerNotes === "string"
            ? { managerNotes: managerNotes.trim() }
            : {}),
          ...(status === "QUOTED"
            ? {
                quoteAmount,
                quotedAt: new Date(),
              }
            : {}),
        },
        include: {
          customer: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
          outlet: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      res.status(200).json({
        success: true,
        request: updatedRequest,
      });
    } catch (error) {
      next(error);
    }
  },
);

// PATCH /api/management/outlets/:outletId/menu-items/:menuItemId/availability
// Body: { isAvailable: boolean }
managementRouter.patch(
  "/outlets/:outletId/menu-items/:menuItemId/availability",
  async (req, res, next) => {
    try {
      const auth = await getAuthContext(req);

      if (!auth) {
        return res.status(401).json({
          success: false,
          message: "Authentication required.",
        });
      }

      const { outletId, menuItemId } = req.params;

      const isAssignedManager = auth.outletAssignments.some(
        (assignment) =>
          assignment.outletId === outletId && assignment.role === "MANAGER",
      );

      if (!auth.isCentralAdmin && !isAssignedManager) {
        return res.status(403).json({
          success: false,
          message: "Outlet manager access required.",
        });
      }

      if (typeof req.body.isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isAvailable must be a boolean.",
        });
      }

      const outletMenuItem = await prisma.outletMenuItem.findUnique({
        where: {
          outletId_menuItemId: {
            outletId,
            menuItemId,
          },
        },
      });

      if (!outletMenuItem) {
        return res.status(404).json({
          success: false,
          message: "Menu item is not linked to this outlet.",
        });
      }

      const updatedItem = await prisma.outletMenuItem.update({
        where: { id: outletMenuItem.id },
        data: { isAvailable: req.body.isAvailable },
      });

      res.status(200).json({
        success: true,
        item: updatedItem,
      });
    } catch (error) {
      next(error);
    }
  },
);

// GET /api/management/admin/outlets
managementRouter.get(
  "/admin/outlets",
  requireCentralAdmin,
  async (_req, res, next) => {
    try {
      const outlets = await prisma.outlet.findMany({
        include: {
          city: {
            select: {
              name: true,
              state: true,
            },
          },
          _count: {
            select: {
              orders: true,
              staff: true,
              menuItems: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      res.status(200).json({
        success: true,
        count: outlets.length,
        outlets,
      });
    } catch (error) {
      next(error);
    }
  },
);

// POST /api/management/admin/outlets
managementRouter.post(
  "/admin/outlets",
  requireCentralAdmin,
  async (req, res, next) => {
    try {
      const {
        name,
        code,
        cityId,
        address,
        area,
        postalCode,
        phone,
        isCloudKitchen,
      } = req.body as {
        name?: string;
        code?: string;
        cityId?: string;
        address?: string;
        area?: string;
        postalCode?: string;
        phone?: string;
        isCloudKitchen?: boolean;
      };

      const requiredFields = [name, code, cityId, address, area, postalCode];

      if (
        !requiredFields.every(
          (value) => typeof value === "string" && value.trim().length > 0,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "name, code, cityId, address, area and postalCode are required.",
        });
      }

      const city = await prisma.city.findUnique({
        where: { id: cityId! },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!city || !city.isActive) {
        return res.status(400).json({
          success: false,
          message: "The selected city is not active.",
        });
      }

      const outlet = await prisma.outlet.create({
        data: {
          name: name!.trim(),
          code: code!.trim().toUpperCase(),
          cityId: city.id,
          address: address!.trim(),
          area: area!.trim(),
          postalCode: postalCode!.trim(),
          phone: phone?.trim() || null,
          isCloudKitchen: Boolean(isCloudKitchen),
        },
        include: {
          city: {
            select: {
              name: true,
              state: true,
            },
          },
        },
      });

      res.status(201).json({
        success: true,
        outlet,
      });
    } catch (error) {
      next(error);
    }
  },
);

export default managementRouter;
