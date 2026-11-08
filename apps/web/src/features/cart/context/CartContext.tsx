
import { useAuth } from "@clerk/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Cart, CartItem } from "../types/cart";
import type { MenuItem, MenuVariant } from "../../menu/types/menu";

import { useApi } from "../../../lib/api";
import { getCartItemCount, getCartSubtotal } from "../utils/cartUtils";

export interface AppliedCoupon {
  id: string;
  code: string;
  discountAmount: number;
  description?: string | null;
}

interface CartContextType {
  cart: Cart;
  cartCount: number;
  subtotal: number;
  loading: boolean;

  appliedCoupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string;

  refreshCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;

  addItem: (item: MenuItem, variant: MenuVariant) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

type ApiCartItem = {
  id: string;
  quantity: number;
  unitPrice: number | string;
  outletMenuItem: {
    id: string;
    outletId: string;
    menuItem: {
      id: string;
      name: string;
      description: string | null;
      imageUrl: string | null;
      categoryId: string;
      foodType: string;
      isActive: boolean;
    };
  };
  variantPrice: {
    id: string;
    price: number | string;
    variant: {
      id: string;
      name: string;
      isActive: boolean;
    };
  };
};

type ApiCoupon = {
  id: string;
  code: string;
  description?: string | null;
  discountAmount?: number | string;
};

type ApiCart = {
  id: string;
  outletId: string;
  items: ApiCartItem[];
  coupon?: ApiCoupon | null;
  couponDiscountAmount?: number | string | null;
};

function toNumber(value: number | string): number {
  return Number(value);
}

function mapApiCartItem(apiItem: ApiCartItem): CartItem {
  const dbMenuItem = apiItem.outletMenuItem.menuItem;
  const dbVariant = apiItem.variantPrice.variant;

  const menuItem: MenuItem = {
    id: apiItem.outletMenuItem.id,
    outletId: apiItem.outletMenuItem.outletId,
    menuItemId: dbMenuItem.id,
    name: dbMenuItem.name,
    description: dbMenuItem.description ?? "",
    image: dbMenuItem.imageUrl ?? "",
    price: toNumber(apiItem.variantPrice.price),
    category: dbMenuItem.categoryId,
    isAvailable: true,
    isVegetarian: dbMenuItem.foodType.toLowerCase().includes("vegetarian"),
    isPopular: false,
  };

  const selectedVariant: MenuVariant = {
    id: apiItem.variantPrice.id,
    variantId: dbVariant.id,
    name: dbVariant.name,
    price: toNumber(apiItem.variantPrice.price),
  };

  return {
    id: apiItem.id,
    menuItem,
    selectedVariant,
    quantity: apiItem.quantity,
  };
}

const emptyCart: Cart = {
  outletId: "",
  items: [],
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { apiFetch } = useApi();
  const { isLoaded, isSignedIn } = useAuth();

  const [cart, setCart] = useState<Cart>(emptyCart);
  const [loading, setLoading] = useState(true);

  const [appliedCoupon, setAppliedCoupon] =
    useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const refreshCart = useCallback(async () => {
    const response = await apiFetch("/api/cart");

    const data = (await response.json()) as {
      success?: boolean;
      message?: string;
      cart?: ApiCart | null;
    };

    if (!response.ok || data.success === false) {
      throw new Error(data.message ?? "Unable to fetch cart.");
    }

    if (!data.cart) {
      setCart(emptyCart);
      setAppliedCoupon(null);
      return;
    }

    setCart({
      id: data.cart.id,
      outletId: data.cart.outletId,
      items: data.cart.items.map(mapApiCartItem),
    });

    // If GET /api/cart returns coupon information, hydrate it.
    // Otherwise preserve the coupon state already returned by applyCoupon().
    if (data.cart.coupon) {
      setAppliedCoupon({
        id: data.cart.coupon.id,
        code: data.cart.coupon.code,
        description: data.cart.coupon.description ?? null,
        discountAmount: toNumber(
          data.cart.couponDiscountAmount ??
            data.cart.coupon.discountAmount ??
            0,
        ),
      });
    }
  }, [apiFetch]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setCart(emptyCart);
      setAppliedCoupon(null);
      setCouponError("");
      setLoading(false);
      return;
    }

    let mounted = true;

    const loadCart = async () => {
      setLoading(true);

      try {
        await refreshCart();
      } catch (error) {
        if (mounted) {
          console.error("Unable to load cart:", error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadCart();

    return () => {
      mounted = false;
    };
  }, [isLoaded, isSignedIn, refreshCart]);

  const applyCoupon = async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Please enter a coupon code.");
      return;
    }

    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await apiFetch("/api/cart/coupon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: normalizedCode }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        coupon?: ApiCoupon;
        discountAmount?: number | string;
      };

      if (!response.ok || data.success === false) {
        throw new Error(data.message ?? "Unable to apply coupon.");
      }

      if (!data.coupon) {
        throw new Error("Coupon response was missing coupon details.");
      }

      setAppliedCoupon({
        id: data.coupon.id,
        code: data.coupon.code,
        description: data.coupon.description ?? null,
        discountAmount: toNumber(
          data.discountAmount ?? data.coupon.discountAmount ?? 0,
        ),
      });

      await refreshCart();
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : "Unable to apply coupon.",
      );
      throw error;
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = async () => {
    setCouponLoading(true);
    setCouponError("");

    try {
      const response = await apiFetch("/api/cart/coupon", {
        method: "DELETE",
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || data.success === false) {
        throw new Error(data.message ?? "Unable to remove coupon.");
      }

      setAppliedCoupon(null);
      await refreshCart();
    } catch (error) {
      setCouponError(
        error instanceof Error ? error.message : "Unable to remove coupon.",
      );
      throw error;
    } finally {
      setCouponLoading(false);
    }
  };

  const addItem = async (item: MenuItem, variant: MenuVariant) => {
    if (cart.outletId && cart.outletId !== item.outletId) {
      throw new Error("Your cart already contains items from another outlet.");
    }

    const response = await apiFetch("/api/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        outletId: item.outletId,
        outletMenuItemId: item.id,
        outletVariantPriceId: variant.id,
        quantity: 1,
        addons: [],
      }),
    });

    const data = (await response.json()) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || data.success === false) {
      throw new Error(data.message ?? "Unable to add item to cart.");
    }

    await refreshCart();
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(cartItemId);
      return;
    }

    const response = await apiFetch(
      `/api/cart/items/${encodeURIComponent(cartItemId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      },
    );

    const data = (await response.json()) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || data.success === false) {
      throw new Error(data.message ?? "Unable to update quantity.");
    }

    await refreshCart();
  };

  const removeItem = async (cartItemId: string) => {
    const response = await apiFetch(
      `/api/cart/items/${encodeURIComponent(cartItemId)}`,
      {
        method: "DELETE",
      },
    );

    const data = (await response.json()) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || data.success === false) {
      throw new Error(data.message ?? "Unable to remove item.");
    }

    await refreshCart();
  };

  const clearCart = async () => {
    const response = await apiFetch("/api/cart", {
      method: "DELETE",
    });

    const data = (await response.json()) as {
      success?: boolean;
      message?: string;
    };

    if (!response.ok || data.success === false) {
      throw new Error(data.message ?? "Unable to clear cart.");
    }

    setCart(emptyCart);
    setAppliedCoupon(null);
    setCouponError("");
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount: getCartItemCount(cart),
        subtotal: getCartSubtotal(cart),
        loading,

        appliedCoupon,
        couponLoading,
        couponError,

        refreshCart,
        applyCoupon,
        removeCoupon,

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
