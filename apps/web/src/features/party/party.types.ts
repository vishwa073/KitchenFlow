export type PartyRequestStatus =
  | "PENDING"
  | "REVIEWING"
  | "QUOTED"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

export interface CreatePartyRequestInput {
  outletId?: string;
  eventAt: string;
  guestCount: number;
  eventType?: string;
  addressLine1: string;
  addressLine2?: string;
  area: string;
  city?: string;
  state?: string;
  postalCode: string;
  specialRequests?: string;
  dietaryNotes?: string;
}

export interface PartyRequest {
  id: string;
  requestNumber: string;
  outletId?: string | null;
  eventAt: string;
  guestCount: number;
  eventType?: string | null;
  addressLine1: string;
  addressLine2?: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  specialRequests?: string | null;
  dietaryNotes?: string | null;
  status: PartyRequestStatus;
  quoteAmount?: number | string | null;
  managerNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}