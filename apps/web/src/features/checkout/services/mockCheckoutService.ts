import type { PlaceOrderInput, Order } from "../types/checkout";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function mockPlaceOrder(
  input: PlaceOrderInput,
): Promise<Order> {
  await delay(700);

  if (!input.cart.items.length) {
    throw new Error("Your cart is empty.");
  }

  const subtotal = input.cart.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0,
  );

  const deliveryFee = subtotal >= 499 ? 0 : 40;
  const taxes = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + deliveryFee + taxes).toFixed(2));

  return {
    id: `KF-${Date.now()}`,
    customerName: input.customerName.trim(),
    phone: input.phone.trim(),
    address: input.address.trim(),
    landmark: input.landmark.trim(),
    paymentMethod: input.paymentMethod,
    items: input.cart.items,
    subtotal,
    deliveryFee,
    taxes,
    total,
    status: "PENDING_ACCEPTANCE",
    createdAt: new Date().toISOString(),
  };
}