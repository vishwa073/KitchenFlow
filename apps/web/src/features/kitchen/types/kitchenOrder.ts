
import type { Order, OrderStatus } from "../../orders/types/order";

export type KitchenOrder = Order & {
  outletId: string;
  paymentMethod: "UPI" | "CARD";
  promisedAt: string;
  specialInstructions?: string;
};

export type KitchenActionStatus =
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY";

export const kitchenStatusLabels: Record<OrderStatus, string> = {
  PENDING_ACCEPTANCE: "Incoming",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  OUT_FOR_DELIVERY: "Rider handoff",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};
