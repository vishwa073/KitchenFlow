
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

export interface PartyRequestListQuery {
  page?: number;
  limit?: number;
}
