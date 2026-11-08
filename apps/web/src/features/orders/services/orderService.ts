import type { Order, OrderStatus, OrderStatusUpdate } from "../types/order";
// import { useApi } from "../lib/api";
type GetToken = () => Promise<string | null>;

type RawObject = Record<string, unknown>;

function asObject(value: unknown): RawObject {
  return value && typeof value === "object" ? (value as RawObject) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function asStatus(value: unknown): OrderStatus {
  const status = asString(value, "PLACED");

  const supportedStatuses: OrderStatus[] = [
    "PLACED",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "AWAITING_DELIVERY_PARTNER",
    "HANDED_OFF",
    "CANCELLED",
  ];

  return supportedStatuses.includes(status as OrderStatus)
    ? (status as OrderStatus)
    : "PLACED";
}

function formatDeliveryAddress(value: unknown): string {
  if (typeof value === "string") return value;

  const address = asObject(value);

  return [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
    address.area,
    address.city,
    address.state,
    address.postalCode,
  ]
    .filter((part) => typeof part === "string" && part.trim())
    .join(", ");
}

function normalizeStatusHistory(value: unknown): OrderStatusUpdate[] {
  return asArray(value).map((entry) => {
    const history = asObject(entry);
    const status = asStatus(history.toStatus);

    return {
      status,
      message:
        asString(history.note) ||
        `Order status updated to ${status.replaceAll("_", " ").toLowerCase()}.`,
      updatedAt: asString(history.createdAt),
    };
  });
}

function normalizeOrder(value: unknown): Order {
  const raw = asObject(value);
  const outlet = asObject(raw.outlet);
  const address = raw.deliveryAddressSnapshot;
  const prepTimeEstimates = asArray(raw.prepTimeEstimates);
  const latestEstimate = asObject(prepTimeEstimates[0]);

  const items = asArray(raw.items).map((entry) => {
    const item = asObject(entry);

    const addons = asArray(item.addons).map((addonEntry) => {
      const addon = asObject(addonEntry);

      return {
        id: asString(addon.id),
        name: asString(addon.addonName),
        quantity: asNumber(addon.quantity),
        price: asNumber(addon.unitPrice),
        lineTotal: asNumber(addon.lineTotal),
      };
    });

    return {
      id: asString(item.id),
      name: asString(item.menuItemName, "Menu item"),
      variantName: asString(item.variantName),
      quantity: asNumber(item.quantity),
      price: asNumber(item.unitPrice),
      lineTotal: asNumber(item.lineTotal),
      addons,
    };
  });

  return {
    id: asString(raw.id),
    orderNumber: asString(raw.orderNumber, asString(raw.id)),
    outletId: asString(raw.outletId, asString(outlet.id)),
    outletName: asString(outlet.name, "KitchenFlow outlet"),
    items,
    subtotal: asNumber(raw.subtotal),
    addonTotal: asNumber(raw.addonTotal),
    discountAmount: asNumber(raw.discountAmount),
    deliveryFee: asNumber(raw.deliveryFee),
    taxes: asNumber(raw.taxAmount),
    total: asNumber(raw.totalAmount),
    status: asStatus(raw.status),
    paymentMethod: raw.paymentMethod === "CARD" ? "CARD" : "UPI",
    paymentStatus: asString(raw.paymentStatus, "PENDING"),
    createdAt: asString(raw.placedAt, asString(raw.createdAt)),
    estimatedPreparationMinutes:
      typeof latestEstimate.estimatedMinutes === "number"
        ? latestEstimate.estimatedMinutes
        : undefined,
    deliveryAddress: formatDeliveryAddress(address),
    statusHistory: normalizeStatusHistory(raw.statusHistory),
  };
}

async function authenticatedFetch(
  path: string,
  getToken: GetToken,
): Promise<unknown> {
  const token = await getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }

  const response = await fetch(`${apiUrl}/api${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const result = (await response.json()) as RawObject;

  if (!response.ok) {
    throw new Error(asString(result.message, "Unable to fetch your orders."));
  }

  return result;
}

export async function getOrders(getToken: GetToken): Promise<Order[]> {
  const result = asObject(await authenticatedFetch("/orders", getToken));

  return asArray(result.orders).map(normalizeOrder);
}

export async function getOrderById(
  id: string,
  getToken: GetToken,
): Promise<Order | null> {
  const result = asObject(
    await authenticatedFetch(`/orders/${encodeURIComponent(id)}`, getToken),
  );

  return result.order ? normalizeOrder(result.order) : null;
}

export async function getOrderStatusHistory(
  order: Order,
): Promise<OrderStatusUpdate[]> {
  // The backend returns status history inside GET /api/orders/:orderId.
  return order.statusHistory;
}
