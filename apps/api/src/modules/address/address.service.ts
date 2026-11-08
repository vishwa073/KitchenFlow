import { prisma } from "../../lib/prisma.js";
import type { CreateAddressInput } from "./address.types.js";

export async function saveAddress(
  clerkUserId: string,
  input: CreateAddressInput,
) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.$transaction(async (tx) => {
    const addressCount = await tx.address.count({
      where: { userId: user.id },
    });

    const shouldBeDefault =
      input.isDefault === true || addressCount === 0;

    if (shouldBeDefault) {
      await tx.address.updateMany({
        where: {
          userId: user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    return tx.address.create({
      data: {
        userId: user.id,
        label: input.label ?? null,
        recipientName: input.recipientName,
        phone: input.phone,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 ?? null,
        landmark: input.landmark ?? null,
        area: input.area,
        city: input.city ?? "Hyderabad",
        state: input.state ?? "Telangana",
        postalCode: input.postalCode,
        country: input.country ?? "India",
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        isDefault: shouldBeDefault,
      },
    });
  });
}
export async function getDefaultAddress(clerkUserId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return prisma.address.findFirst({
    where: {
      userId: user.id,
      isDefault: true,
    },
  });
}

export async function updateAddress(
  clerkUserId: string,
  addressId: string,
  input: CreateAddressInput,
) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!existingAddress) {
    throw new Error("ADDRESS_NOT_FOUND");
  }

  return prisma.address.update({
    where: {
      id: existingAddress.id,
    },
    data: {
      label: input.label ?? null,
      recipientName: input.recipientName,
      phone: input.phone,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2 ?? null,
      landmark: input.landmark ?? null,
      area: input.area,
      city: input.city ?? "Hyderabad",
      state: input.state ?? "Telangana",
      postalCode: input.postalCode,
      country: input.country ?? "India",
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    },
  });
}
function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const earthRadiusKm = 6371;

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusKm * c;
}
export async function selectOutletForAddress(
  clerkUserId: string,
  addressId: string,
  outletId: string,
) {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!address) {
    throw new Error("ADDRESS_NOT_FOUND");
  }

  return prisma.address.update({
    where: {
      id: address.id,
    },
    data: {
      selectedOutletId: outletId,
    },
  });
}