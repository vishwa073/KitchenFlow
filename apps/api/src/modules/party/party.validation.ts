
import type { CreatePartyRequestInput } from "./party.types.js";

export interface ValidationResult {
  success: boolean;
  data?: CreatePartyRequestInput;
  errors?: string[];
}

function isOptionalString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "string";
}

export function validateCreatePartyRequest(
  body: unknown,
): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      success: false,
      errors: ["Request body must be an object."],
    };
  }

  const input = body as Record<string, unknown>;
  const errors: string[] = [];

  if (
    typeof input.eventAt !== "string" ||
    input.eventAt.trim().length === 0 ||
    Number.isNaN(new Date(input.eventAt).getTime())
  ) {
    errors.push("A valid event date and time is required.");
  }

  if (
    typeof input.guestCount !== "number" ||
    !Number.isInteger(input.guestCount) ||
    input.guestCount < 2 ||
    input.guestCount > 30
  ) {
    errors.push("Guest count must be an integer between 2 and 30.");
  }

  if (
    input.outletId !== undefined &&
    input.outletId !== null &&
    (typeof input.outletId !== "string" || !input.outletId.trim())
  ) {
    errors.push("Outlet ID must be a valid string.");
  }

  if (
    typeof input.addressLine1 !== "string" ||
    !input.addressLine1.trim()
  ) {
    errors.push("Address line 1 is required.");
  }

  if (typeof input.area !== "string" || !input.area.trim()) {
    errors.push("Area is required.");
  }

  if (
    typeof input.postalCode !== "string" ||
    !input.postalCode.trim()
  ) {
    errors.push("Postal code is required.");
  }

  const optionalStringFields = [
    "eventType",
    "addressLine2",
    "city",
    "state",
    "specialRequests",
    "dietaryNotes",
  ] as const;

  for (const field of optionalStringFields) {
    if (!isOptionalString(input[field])) {
      errors.push(`${field} must be a string.`);
    }
  }

  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      outletId:
        typeof input.outletId === "string"
          ? input.outletId.trim()
          : undefined,
      eventAt: input.eventAt as string,
      guestCount: input.guestCount as number,
      eventType:
        typeof input.eventType === "string"
          ? input.eventType
          : undefined,
      addressLine1: input.addressLine1 as string,
      addressLine2:
        typeof input.addressLine2 === "string"
          ? input.addressLine2
          : undefined,
      area: input.area as string,
      city: typeof input.city === "string" ? input.city : undefined,
      state: typeof input.state === "string" ? input.state : undefined,
      postalCode: input.postalCode as string,
      specialRequests:
        typeof input.specialRequests === "string"
          ? input.specialRequests
          : undefined,
      dietaryNotes:
        typeof input.dietaryNotes === "string"
          ? input.dietaryNotes
          : undefined,
    },
  };
}
