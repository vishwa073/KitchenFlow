
import { prisma } from "../../lib/prisma.js";
import type { CreatePartyRequestInput } from "./party.types.js";

const MINIMUM_NOTICE_HOURS = 24;
const MIN_GUEST_COUNT = 2;
const MAX_GUEST_COUNT = 30;

export class PartyServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "PartyServiceError";
  }
}

function generateRequestNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `PTY-${timestamp}-${random}`;
}

function validatePartyRequest(input: CreatePartyRequestInput): Date {
  const eventAt = new Date(input.eventAt);

  if (Number.isNaN(eventAt.getTime())) {
    throw new PartyServiceError("Please provide a valid event date and time.", 400);
  }

  const minimumEventTime =
    Date.now() + MINIMUM_NOTICE_HOURS * 60 * 60 * 1000;

  if (eventAt.getTime() < minimumEventTime) {
    throw new PartyServiceError(
      `Party requests must be submitted at least ${MINIMUM_NOTICE_HOURS} hours in advance.`,
      400,
    );
  }

  if (
    !Number.isInteger(input.guestCount) ||
    input.guestCount < MIN_GUEST_COUNT ||
    input.guestCount > MAX_GUEST_COUNT
  ) {
    throw new PartyServiceError(
      `Guest count must be between ${MIN_GUEST_COUNT} and ${MAX_GUEST_COUNT}.`,
      400,
    );
  }

  if (
    !input.addressLine1.trim() ||
    !input.area.trim() ||
    !input.postalCode.trim()
  ) {
    throw new PartyServiceError(
      "Address line, area, and postal code are required.",
      400,
    );
  }

  return eventAt;
}

export async function createPartyRequest(
  customerId: string,
  input: CreatePartyRequestInput,
) {
  const eventAt = validatePartyRequest(input);

  if (input.outletId) {
    const outlet = await prisma.outlet.findUnique({
      where: { id: input.outletId },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!outlet || !outlet.isActive) {
      throw new PartyServiceError(
        "The selected outlet is unavailable.",
        404,
      );
    }
  }

  return prisma.partyOrderRequest.create({
    data: {
      requestNumber: generateRequestNumber(),
      customerId,
      outletId: input.outletId || null,
      eventAt,
      guestCount: input.guestCount,
      eventType: input.eventType?.trim() || null,
      addressLine1: input.addressLine1.trim(),
      addressLine2: input.addressLine2?.trim() || null,
      area: input.area.trim(),
      city: input.city?.trim() || "Hyderabad",
      state: input.state?.trim() || "Telangana",
      postalCode: input.postalCode.trim(),
      specialRequests: input.specialRequests?.trim() || null,
      dietaryNotes: input.dietaryNotes?.trim() || null,
      status: "PENDING",
    },
  });
}

export async function getCustomerPartyRequests(customerId: string) {
  return prisma.partyOrderRequest.findMany({
    where: {
      customerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getCustomerPartyRequestById(
  customerId: string,
  requestId: string,
) {
  const request = await prisma.partyOrderRequest.findFirst({
    where: {
      id: requestId,
      customerId,
    },
  });

  if (!request) {
    throw new PartyServiceError("Party request not found.", 404);
  }

  return request;
}
