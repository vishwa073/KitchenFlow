import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const menuRouter = Router();

menuRouter.get("/:outletId", async (req, res, next) => {
  try {
    const { outletId } = req.params;

    const outlet = await prisma.outlet.findFirst({
      where: {
        id: outletId,
        isActive: true,
      },
      select: {
        id: true,
      },
    });

    if (!outlet) {
      res.status(404).json({
        success: false,
        message: "Outlet not found.",
      });
      return;
    }

    const outletMenuItems = await prisma.outletMenuItem.findMany({
      where: {
        outletId,
        isAvailable: true,
        menuItem: {
          isActive: true,
          isPublished: true,
          category: {
            isActive: true,
          },
        },
      },
      include: {
        menuItem: {
          include: {
            category: true,
            variants: {
              where: {
                isActive: true,
              },
              orderBy: {
                sortOrder: "asc",
              },
              include: {
                outletPrices: {
                  where: {
                    isAvailable: true,
                    outletMenuItem: {
                      outletId,
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const items = outletMenuItems
      .map((outletMenuItem) => {
        const menuItem = outletMenuItem.menuItem;

        const availableVariants = menuItem.variants
          .map((variant) => {
            const price = variant.outletPrices[0];

            if (!price) return null;

            return {
              id: price.id,
              variantId: variant.id,
              name: variant.name,
              price: Number(price.price),
            };
          })
          .filter(Boolean);

        if (availableVariants.length === 0) return null;

        const lowestPrice = Math.min(
          ...availableVariants.map((variant) => variant!.price),
        );

        return {
          id: outletMenuItem.id,
          outletId,
          menuItemId: menuItem.id,
          name: menuItem.name,
          description: menuItem.description ?? "",
          image: menuItem.imageUrl ?? "",
          price: lowestPrice,
          category: menuItem.category.name,
          isAvailable: outletMenuItem.isAvailable,
          isVegetarian: menuItem.foodType === "VEG",
          isPopular: false,
          variants: availableVariants,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      success: true,
      outletId,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
});

export default menuRouter;