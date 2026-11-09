import type { Cart } from "../types/cart";

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce(
    (total, item) => total + item.quantity,
    0,
  );
}

export function getCartSubtotal(cart: Cart): number {
  return cart.items.reduce((total, item) => {
    const basePrice = Number(item.selectedVariant.price);

    const addonsPrice = item.selectedAddons.reduce(
      (addonTotal, addon) =>
        addonTotal + Number(addon.price) * addon.quantity,
      0,
    );

    return total + (basePrice + addonsPrice) * item.quantity;
  }, 0);
}