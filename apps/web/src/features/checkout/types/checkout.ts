import type { Cart } from "../../cart/types/cart";

export type PaymentMethod = "UPI" | "CARD";

export interface PlaceOrderInput {
  addressId: string;
  paymentMethod: PaymentMethod;
  redeemPoints?: number;
}

export type OrderStatus =
  | "PLACED"
  | "PENDING_ACCEPTANCE"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

// Added for OrderConfirmationPage
export interface OrderAddon {
  id?: string;
  addonName: string;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
}

export interface OrderItem {
  id?: string;
  menuItemName: string;
  variantName?: string | null;
  quantity: number;
  unitPrice?: number;
  lineTotal?: number;
  addons?: OrderAddon[];
}

export interface Order {
  // Your original fields — preserved
  id: string;
  customerName: string;
  phone: string;
  address: string;
  landmark: string;
  paymentMethod: PaymentMethod;

  // Changed to OrderItem[] because confirmation page uses
  // menuItemName, lineTotal, variantName, and addons.
  items: OrderItem[];

  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  createdAt: string;

  // Added fields used by OrderConfirmationPage
  orderNumber?: string;
  paymentStatus?: string;

  payments?: {
    method?: PaymentMethod;
    status?: string;
  }[];

  totalAmount?: number;
  grandTotal?: number;
  finalAmount?: number;

  user?: {
    name?: string;
  };

  deliveryAddressSnapshot?: {
    recipientName?: string;
    formattedAddress?: string;
    addressLine1?: string;
    addressLine2?: string;
    landmark?: string;
    area?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  } | null;

  outletId?: string;
  outlet?: {
    id?: string;
  };

  estimatedTime?: string;

  // Added for loyalty points display
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
}