
import type { Cart } from "../types/cart";

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
}

export function getCartSubtotal(cart: Cart): number {
  return cart.items.reduce(
    (total, item) =>
      total + Number(item.selectedVariant.price) * item.quantity,
    0,
  );
}
