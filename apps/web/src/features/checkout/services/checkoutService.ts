import type { Order, PlaceOrderInput } from "../types/checkout";


export async function placeOrder(
  input: PlaceOrderInput,
  getToken: () => Promise<string | null>,
): Promise<Order> {
  const token = await getToken();

  if (!token) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error("VITE_API_URL is not configured.");
  }

  const response = await fetch(`${apiUrl}/api/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      addressId: input.addressId,
      paymentMethod: input.paymentMethod,
      redeemPoints: input.redeemPoints ?? 0,
    }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to place your order.");
  }

  return result.order as Order;
}
