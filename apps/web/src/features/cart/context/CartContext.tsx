
import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { Cart } from "../types/cart";
import type { MenuItem } from "../../menu/types/menu";

import {
  addToCart as addItemToCart,
  getCartItemCount,
  getCartSubtotal,
  removeFromCart,
  updateCartQuantity,
} from "../utils/cartUtils";

interface CartContextType {
  cart: Cart;
  cartCount: number;
  subtotal: number;
  addItem: (item: MenuItem) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    outletId: "",
    items: [],
  });

  const addItem = (item: MenuItem) => {
    setCart((currentCart) => addItemToCart(currentCart, item));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCart((currentCart) =>
      updateCartQuantity(currentCart, itemId, quantity)
    );
  };

  const removeItem = (itemId: string) => {
    setCart((currentCart) => removeFromCart(currentCart, itemId));
  };

  const clearCart = () => {
    setCart({ outletId: "", items: [] });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: getCartItemCount(cart),
        subtotal: getCartSubtotal(cart),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
