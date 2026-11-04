export type OrderStatus =
  | "PENDING_ACCEPTANCE"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  outletName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedPreparationMinutes?: number;
  deliveryAddress: string;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  message: string;
  updatedAt: string;
}