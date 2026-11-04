import type { Cart } from "../../cart/types/cart";

export type PaymentMethod = "upi" | "card" | "cod";

export interface PlaceOrderInput {
  customerName: string;
  phone: string;
  address: string;
  landmark: string;
  paymentMethod: PaymentMethod;
  cart: Cart;
}

export type OrderStatus =
  | "PLACED"
  | "PENDING_ACCEPTANCE"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "DELIVERED"
  | "CANCELLED";

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  landmark: string;
  paymentMethod: PaymentMethod;
  items: Cart["items"];
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
}