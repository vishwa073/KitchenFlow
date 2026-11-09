import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { getAuth } from "@clerk/express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

async function getManager(req: Request) {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: {
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
    .map((s) => s.outletId)
    .slice(0, 1);

  if (!isAdmin && !outletIds.length) return null;

  return { isAdmin, outletIds };
}

function requireManager(req: Request, res: Response, next: NextFunction) {
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

async function formatItems(outletIds: string[], isAdmin: boolean) {
  const records = await prisma.outletMenuItem.findMany({
    where: isAdmin ? {} : { outletId: { in: outletIds } },
    include: {
      outlet: { select: { id: true, name: true } },
      menuItem: {
        include: {
          category: true,
          variants: {
            where: { isActive: true },
            include: { outletPrices: true },
          },
        },
      },
    },
    orderBy: { menuItem: { name: "asc" } },
  });

  return records.map((record) => {
    const variant = record.menuItem.variants[0];
    const price = record.menuItem.variants[0]?.outletPrices?.[0]?.price;

    return {
      id: record.id,
      menuItemId: record.menuItemId,
      outletId: record.outletId,
      outletName: record.outlet.name,
      name: record.menuItem.name,
      description: record.menuItem.description ?? "",
      category: record.menuItem.category.name,
      price: Number(price ?? 0),
      image: record.menuItem.imageUrl ?? "",
      isVegetarian: record.menuItem.foodType === "VEG",
      isPopular: false,
      isAvailable: record.isAvailable,
      variants: record.menuItem.variants,
      addons: [],
    };
  });
}

// GET /api/management/manager/menu-items
router.get("/", requireManager, async (_req, res, next) => {
  try {
    const auth = res.locals.manager;
    const items = await formatItems(auth.outletIds, auth.isAdmin);
    res.json({ success: true, items });
  } catch (error) {
    next(error);
  }
});

// POST /api/management/manager/menu-items
router.post("/", requireManager, async (req, res, next) => {
  try {
    const auth = res.locals.manager;
    const { name, description, price, category, isVegetarian, image } =
      req.body;

    const outletId = auth.isAdmin ? req.body.outletId : auth.outletIds[0];

    if (
      !name?.trim() ||
      !category?.trim() ||
      !outletId ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid name, category, outletId and price are required.",
      });
    }

    if (!auth.isAdmin && !auth.outletIds.includes(outletId)) {
      return res.status(403).json({
        success: false,
        message: "This outlet is not assigned to you.",
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const categoryRecord = await tx.menuCategory.upsert({
        where: { name: category.trim() },
        update: {},
        create: { name: category.trim() },
      });

      const menuItem = await tx.menuItem.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          categoryId: categoryRecord.id,
          foodType: isVegetarian ? "VEG" : "NON_VEG",
          imageUrl: image || null,
          isPublished: true,
        },
      });

      const variant = await tx.menuVariant.create({
        data: {
          menuItemId: menuItem.id,
          name: "Regular",
        },
      });

      const outletMenuItem = await tx.outletMenuItem.create({
        data: {
          outletId,
          menuItemId: menuItem.id,
          isAvailable: true,
          variantPrices: {
            create: {
              variantId: variant.id,
              price: Number(price),
            },
          },
        },
      });

      return outletMenuItem;
    });

    const items = await formatItems([outletId], false);
    const item = items.find((i) => i.id === result.id);

    res.status(201).json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/management/manager/menu-items/:id
router.patch("/:id", requireManager, async (req, res, next) => {
  try {
    const auth = res.locals.manager;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const existing = await prisma.outletMenuItem.findFirst({
      where: {
        id,
        ...(auth.isAdmin ? {} : { outletId: { in: auth.outletIds } }),
      },
      include: { menuItem: { include: { variants: true } } },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found for your outlet.",
      });
    }

    const { name, description, price, category, isVegetarian, image } =
      req.body;

    await prisma.$transaction(async (tx) => {
      let categoryId = existing.menuItem.categoryId;

      if (typeof category === "string" && category.trim()) {
        const categoryRecord = await tx.menuCategory.upsert({
          where: { name: category.trim() },
          update: {},
          create: { name: category.trim() },
        });
        categoryId = categoryRecord.id;
      }

      await tx.menuItem.update({
        where: { id: existing.menuItemId },
        data: {
          ...(typeof name === "string" ? { name: name.trim() } : {}),
          ...(typeof description === "string"
            ? { description: description.trim() }
            : {}),
          ...(typeof category === "string" ? { categoryId } : {}),
          ...(typeof isVegetarian === "boolean"
            ? { foodType: isVegetarian ? "VEG" : "NON_VEG" }
            : {}),
          ...(typeof image === "string" ? { imageUrl: image } : {}),
        },
      });

      if (Number.isFinite(Number(price)) && Number(price) > 0) {
        const variant =
          existing.menuItem.variants[0] ??
          (await tx.menuVariant.create({
            data: {
              menuItemId: existing.menuItemId,
              name: "Regular",
            },
          }));

        await tx.outletVariantPrice.upsert({
          where: {
            outletMenuItemId_variantId: {
              outletMenuItemId: existing.id,
              variantId: variant.id,
            },
          },
          update: { price: Number(price) },
          create: {
            outletMenuItemId: existing.id,
            variantId: variant.id,
            price: Number(price),
          },
        });
      }
    });

    const items = await formatItems([existing.outletId], false);
    const item = items.find((i) => i.id === existing.id);

    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/management/manager/menu-items/:id
// Removes this item from the manager's outlet only.
router.delete("/:id", requireManager, async (req, res, next) => {
  try {
    const auth = res.locals.manager;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const record = await prisma.outletMenuItem.findFirst({
      where: {
        id,
        ...(auth.isAdmin ? {} : { outletId: { in: auth.outletIds } }),
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found for your outlet.",
      });
    }

    await prisma.outletMenuItem.delete({ where: { id: record.id } });
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
