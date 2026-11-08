export interface CreateAddressInput {
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  area: string;
  city?: string;
  state?: string;
  postalCode: string;
  country?: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault?: boolean;
}