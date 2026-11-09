
import type { Order } from "../../orders/types/order";

export type KitchenUiStatus =
  | "PENDING_ACCEPTANCE"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "HANDED_OFF"
  | "CANCELLED";

export type KitchenOrder = Omit<Order, "status"> & {
  status: KitchenUiStatus;
  outletId: string;
  paymentMethod: "UPI" | "CARD";
  promisedAt: string;
  specialInstructions?: string;
};

export type KitchenActionStatus =
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "HANDED_OFF"
  | "OUT_FOR_DELIVERY";

export const kitchenStatusLabels: Record<KitchenUiStatus, string> = {
  PENDING_ACCEPTANCE: "Incoming",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready for pickup",
  OUT_FOR_DELIVERY: "Rider handoff",
  HANDED_OFF: "Handed off",
  CANCELLED: "Cancelled",
};
