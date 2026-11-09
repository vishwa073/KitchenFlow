
import type { Order, OrderStatus } from "../../orders/types/order";

type ApiFetch = (
  path: string,
  options?: RequestInit
) => Promise<Response>;

type KitchenApiOrder = Record<string, any>;

export interface KitchenOutlet {
  id: string;
  name: string;
}

export interface KitchenOrdersResponse {
  success: boolean;
  outlets: KitchenOutlet[];
  orders: KitchenApiOrder[];
}

const toUiStatus = (status: string): OrderStatus => {
  if (status === "PLACED") return "PLACED";
  if (status === "OUT_FOR_DELIVERY") {
    return "AWAITING_DELIVERY_PARTNER";
  }

  return status as OrderStatus;
};

const toUiOrder = (raw: KitchenApiOrder): Order => ({
  id: raw.id,
  orderNumber: raw.orderNumber,
  outletId: raw.outletId ?? raw.outlet?.id,
  outletName: raw.outletName ?? raw.outlet?.name ?? "Outlet",
  items: (raw.items ?? []).map((item: KitchenApiOrder) => ({
    id: item.id,
    name: item.name ?? item.menuItem?.name ?? "Item",
    variantName: item.variantName ?? item.variant?.name ?? undefined,
    quantity: item.quantity,
    price: Number(item.price ?? 0),
    lineTotal: Number(item.lineTotal ?? item.total ?? 0),
    addons: (item.addons ?? []).map((addon: KitchenApiOrder) => ({
      id: addon.id,
      name: addon.name,
      quantity: addon.quantity,
      price: Number(addon.price ?? 0),
      lineTotal: Number(addon.lineTotal ?? addon.total ?? 0),
    })),
  })),
  subtotal: Number(raw.subtotal ?? 0),
  addonTotal: Number(raw.addonTotal ?? 0),
  discountAmount: Number(raw.discountAmount ?? 0),
  deliveryFee: Number(raw.deliveryFee ?? 0),
  taxes: Number(raw.taxes ?? 0),
  total: Number(raw.total ?? 0),
  status: toUiStatus(raw.status),
  paymentMethod: raw.paymentMethod,
  paymentStatus: raw.paymentStatus ?? "PENDING",
  createdAt: raw.createdAt ?? raw.placedAt,
  estimatedPreparationMinutes:
    raw.prepTimeEstimates?.[0]?.estimatedMinutes ??
    raw.estimatedPreparationMinutes ??
    raw.outlet?.minimumPrepTimeMin,
  deliveryAddress:
    typeof raw.deliveryAddress === "string"
      ? raw.deliveryAddress
      : raw.deliveryAddress?.formattedAddress ?? "",
  statusHistory: (raw.statusHistory ?? []).map(
    (history: KitchenApiOrder) => ({
      status: toUiStatus(history.toStatus ?? history.status),
      message: history.note ?? history.message ?? "",
      updatedAt: history.createdAt ?? history.updatedAt,
    })
  ),
});

async function parseResponse<T>(response: Response): Promise<T> {
  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message ?? "Kitchen API request failed.");
  }

  return result as T;
}

export async function fetchKitchenOrders(
  apiFetch: ApiFetch
): Promise<{ orders: Order[]; outlets: KitchenOutlet[] }> {
  const response = await apiFetch("/api/kitchen/orders");
  const result = await parseResponse<KitchenOrdersResponse>(response);

  return {
    orders: result.orders.map(toUiOrder),
    outlets: result.outlets ?? [],
  };
}

export async function updateKitchenOrderStatus(
  apiFetch: ApiFetch,
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<Order> {
  const response = await apiFetch(
    `/api/kitchen/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, note }),
    }
  );

  const result = await parseResponse<{ order: KitchenApiOrder }>(response);
  return toUiOrder(result.order);
}

export async function addKitchenOrderNote(
  apiFetch: ApiFetch,
  orderId: string,
  note: string
): Promise<void> {
  const response = await apiFetch(
    `/api/kitchen/orders/${orderId}/notes`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    }
  );

  await parseResponse(response);
}
