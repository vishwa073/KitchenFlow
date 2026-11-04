import type { PlaceOrderInput, Order } from "../types/checkout";
import { mockPlaceOrder } from "./mockCheckoutService";

const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== "false";

export async function placeOrder(
  input: PlaceOrderInput,
): Promise<Order> {
  if (USE_MOCK_API) {
    return mockPlaceOrder(input);
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Unable to place your order.");
  }

  return result.order as Order;
}