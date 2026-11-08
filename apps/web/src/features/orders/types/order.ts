
export type OrderStatus =
  | "PLACED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "AWAITING_DELIVERY_PARTNER"
  | "HANDED_OFF"
  | "CANCELLED";

export interface OrderItemAddon {
  id: string;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

export interface OrderItem {
  id: string;
  name: string;
  variantName?: string;
  quantity: number;
  price: number;
  lineTotal: number;
  addons: OrderItemAddon[];
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  message: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  outletId: string;
  outletName: string;
  items: OrderItem[];
  subtotal: number;
  addonTotal: number;
  discountAmount: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "UPI" | "CARD";
  paymentStatus: string;
  createdAt: string;
  estimatedPreparationMinutes?: number;
  deliveryAddress: string;
  statusHistory: OrderStatusUpdate[];
}
