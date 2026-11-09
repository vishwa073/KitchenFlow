import { prisma } from "../src/lib/prisma.js";

const ADMIN = {
  clerkUserId: "user_3LrKoTbOCOckV07D4843VfvOnyA",
  email: "vishwa+clerk_test@example.com",
  fullName: "KitchenFlowAdmin",
};

async function main() {
  // Create or update the Prisma user linked to the Clerk account.
  const user = await prisma.user.upsert({
    where: {
      clerkUserId: ADMIN.clerkUserId,
    },
    update: {
      email: ADMIN.email,
      fullName: ADMIN.fullName,
      isActive: true,
    },
    create: {
      clerkUserId: ADMIN.clerkUserId,
      email: ADMIN.email,
      fullName: ADMIN.fullName,
      isActive: true,
    },
  });

  // Assign the global CENTRAL_ADMIN role.
  await prisma.userRoleAssignment.upsert({
    where: {
      userId_role: {
        userId: user.id,
        role: "CENTRAL_ADMIN",
      },
    },
    update: {},
    create: {
      userId: user.id,
      role: "CENTRAL_ADMIN",
    },
  });

  console.log("KitchenFlow admin seeded successfully.");
  console.log({
    userId: user.id,
    clerkUserId: user.clerkUserId,
    email: user.email,
    role: "CENTRAL_ADMIN",
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed KitchenFlow admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });