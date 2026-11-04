
import type { Cart, CartItem } from "../types/cart";
import type { MenuItem } from "../../menu/types/menu";

export function addToCart(cart: Cart, menuItem: MenuItem): Cart {
  if (cart.outletId && cart.outletId !== menuItem.outletId) {
    return cart;
  }

  const existingItem = cart.items.find(
    (item) => item.menuItem.id === menuItem.id
  );

  let updatedItems: CartItem[];

  if (existingItem) {
    updatedItems = cart.items.map((item) =>
      item.menuItem.id === menuItem.id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  } else {
    updatedItems = [...cart.items, { menuItem, quantity: 1 }];
  }

  return {
    outletId: menuItem.outletId,
    items: updatedItems,
  };
}

export function updateCartQuantity(
  cart: Cart,
  menuItemId: string,
  quantity: number
): Cart {
  if (quantity <= 0) {
    return removeFromCart(cart, menuItemId);
  }

  return {
    ...cart,
    items: cart.items.map((item) =>
      item.menuItem.id === menuItemId ? { ...item, quantity } : item
    ),
  };
}

export function removeFromCart(cart: Cart, menuItemId: string): Cart {
  const items = cart.items.filter(
    (item) => item.menuItem.id !== menuItemId
  );

  return {
    outletId: items.length === 0 ? "" : cart.outletId,
    items,
  };
}

export function getCartItemCount(cart: Cart): number {
  return cart.items.reduce((total, item) => total + item.quantity, 0);
}

export function getCartSubtotal(cart: Cart): number {
  return cart.items.reduce(
    (total, item) => total + item.menuItem.price * item.quantity,
    0
  );
}
