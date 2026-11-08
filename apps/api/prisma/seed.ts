// apps/api/prisma/seed.ts

import "dotenv/config";

import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hyderabadOutlets } from "./seed-data/oultets.ts";
import { demoMenu } from "./seed-data/menu.ts";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from .env");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function seedMenu(outletIds: string[]) {
  console.log("Seeding shared demo menu...");

  for (const [categoryIndex, categoryData] of demoMenu.entries()) {
    const category = await prisma.menuCategory.upsert({
      where: {
        name: categoryData.category,
      },
      update: {
        isActive: true,
        sortOrder: categoryIndex,
      },
      create: {
        name: categoryData.category,
        isActive: true,
        sortOrder: categoryIndex,
      },
    });

    for (const [itemIndex, itemData] of categoryData.items.entries()) {
      // Find existing catalog item so repeated seed runs don't duplicate it.
      let menuItem = await prisma.menuItem.findFirst({
        where: {
          name: itemData.name,
          categoryId: category.id,
        },
      });

      if (!menuItem) {
        menuItem = await prisma.menuItem.create({
          data: {
            name: itemData.name,
            description: itemData.description,
            categoryId: category.id,
            foodType: itemData.foodType,
            spiceLevel: itemData.spiceLevel,
            allergens: [],
            imageUrl: itemData.imageUrl,
            prepTimeMin: itemData.prepTimeMin,
            isPublished: true,
            isActive: true,
          },
        });
      } else {
        menuItem = await prisma.menuItem.update({
          where: {
            id: menuItem.id,
          },
          data: {
            description: itemData.description,
            foodType: itemData.foodType,
            spiceLevel: itemData.spiceLevel,
            imageUrl: itemData.imageUrl,
            prepTimeMin: itemData.prepTimeMin,
            isPublished: true,
            isActive: true,
          },
        });
      }

      for (const [variantIndex, variantData] of itemData.variants.entries()) {
        const variant = await prisma.menuVariant.upsert({
          where: {
            menuItemId_name: {
              menuItemId: menuItem.id,
              name: variantData.name,
            },
          },
          update: {
            isActive: true,
            sortOrder: variantIndex,
          },
          create: {
            menuItemId: menuItem.id,
            name: variantData.name,
            isActive: true,
            sortOrder: variantIndex,
          },
        });

        // Attach the common catalog item to each outlet.
        for (const outletId of outletIds) {
          const outletMenuItem = await prisma.outletMenuItem.upsert({
            where: {
              outletId_menuItemId: {
                outletId,
                menuItemId: menuItem.id,
              },
            },
            update: {
              isAvailable: true,
            },
            create: {
              outletId,
              menuItemId: menuItem.id,
              isAvailable: true,
            },
          });

          // Outlet-level price allows each outlet to customize later.
          await prisma.outletVariantPrice.upsert({
            where: {
              outletMenuItemId_variantId: {
                outletMenuItemId: outletMenuItem.id,
                variantId: variant.id,
              },
            },
            update: {
              price: variantData.price,
              isAvailable: true,
            },
            create: {
              outletMenuItemId: outletMenuItem.id,
              variantId: variant.id,
              price: variantData.price,
              isAvailable: true,
            },
          });
        }
      }

      console.log(
        `  Seeded menu item: ${itemData.name} (${itemIndex + 1})`,
      );
    }
  }

  console.log(
    `Shared demo menu seeded for ${outletIds.length} outlets.`,
  );
}

async function main() {
  // 1. Create or update Hyderabad.
  const city = await prisma.city.upsert({
    where: {
      name_state: {
        name: "Hyderabad",
        state: "Telangana",
      },
    },
    update: {
      isActive: true,
    },
    create: {
      name: "Hyderabad",
      state: "Telangana",
      code: "HYD",
      isActive: true,
    },
  });

  // 2. Create or update outlets.
  for (const outlet of hyderabadOutlets) {
    await prisma.outlet.upsert({
      where: {
        code: outlet.code,
      },
      update: {
        ...outlet,
        cityId: city.id,
        isActive: true,
      },
      create: {
        ...outlet,
        cityId: city.id,
        isActive: true,
      },
    });
  }

  console.log(
    `Seeded ${hyderabadOutlets.length} outlets for ${city.name}.`,
  );

  // 3. Get all active outlets in Hyderabad.
  const seededOutlets = await prisma.outlet.findMany({
    where: {
      cityId: city.id,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  // 4. Seed one shared menu and link it to every active outlet.
  await seedMenu(seededOutlets.map((outlet) => outlet.id));
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });