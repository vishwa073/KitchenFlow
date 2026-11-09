import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useApi } from "../lib/api";
import { useCart } from "../features/cart/context/CartContext";
import { placeOrder } from "../features/checkout/services/checkoutService";
import type { PaymentMethod } from "../features/checkout/types/checkout";

interface SavedAddress {
  id: string;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressesResponse {
  success: boolean;
  addresses?: SavedAddress[];
  message?: string;
}

export function useCheckout() {
  const navigate = useNavigate();

  const {
    cart,
    subtotal,
    clearCart,
    appliedCoupon,
    couponLoading,
    couponError,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { apiFetch } = useApi();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");

  // Loyalty redemption is optional. The backend validates the balance
  // and calculates the final redeemed amount when the order is placed.
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [availableLoyaltyPoints, setAvailableLoyaltyPoints] = useState(0);
  const [isLoadingLoyalty, setIsLoadingLoyalty] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAddresses([]);
      setSelectedAddressId("");
      setError("Please sign in to continue checkout.");
      setIsLoadingAddresses(false);
      return;
    }

    let cancelled = false;

    async function loadAddresses() {
      setIsLoadingAddresses(true);
      setError("");

      try {
        const response = await apiFetch("/api/addresses");
        const result = (await response.json()) as AddressesResponse;

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load saved addresses.");
        }

        const loadedAddresses = result.addresses ?? [];

        if (cancelled) return;

        setAddresses(loadedAddresses);

        setSelectedAddressId((currentId) => {
          const currentAddressExists = loadedAddresses.some(
            (address) => address.id === currentId,
          );

          if (currentAddressExists) {
            return currentId;
          }

          const defaultAddress = loadedAddresses.find(
            (address) => address.isDefault,
          );

          return defaultAddress?.id ?? loadedAddresses[0]?.id ?? "";
        });
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load saved addresses.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAddresses(false);
        }
      }
    }

    void loadAddresses();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, isLoaded, isSignedIn]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAvailableLoyaltyPoints(0);
      setIsLoadingLoyalty(false);
      return;
    }

    let cancelled = false;

    async function loadLoyaltyBalance() {
      setIsLoadingLoyalty(true);

      try {
        const response = await apiFetch("/api/loyalty/balance");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load loyalty balance.");
        }

        if (!cancelled) {
          setAvailableLoyaltyPoints(Number(result.points) || 0);
        }
      } catch (error) {
        console.error("Failed to load loyalty balance:", error);

        if (!cancelled) {
          setAvailableLoyaltyPoints(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingLoyalty(false);
        }
      }
    }

    void loadLoyaltyBalance();

    return () => {
      cancelled = true;
    };
  }, [apiFetch, isLoaded, isSignedIn]);
  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? null;

  // Coupon discount is provided by the backend.
  const couponDiscount = Math.min(
    Math.max(0, appliedCoupon?.discountAmount ?? 0),
    subtotal,
  );

  const discountedSubtotal = Number(
    Math.max(0, subtotal - couponDiscount).toFixed(2),
  );

  // Preserve the existing delivery rule, applied to the discounted subtotal.
  const deliveryFee =
    discountedSubtotal === 0 || discountedSubtotal >= 499 ? 0 : 40;

  // Tax is calculated on the discounted subtotal.
  // Menu prices are GST-inclusive.
  // Extract the included 5% GST instead of adding it on top.
  const taxes = Number(((discountedSubtotal * 5) / 105).toFixed(2));

  // Delivery fee is separate from the GST-inclusive menu amount.
  const totalBeforeLoyalty = Number(
    (discountedSubtotal + deliveryFee).toFixed(2),
  );

  // Backend rule: 1 loyalty point = ₹1.
  // Redeem whole points only, and never discount more than the order total.
  const effectiveRedeemPoints = Math.min(
    Math.max(0, Math.floor(redeemPoints)),
    availableLoyaltyPoints,
    Math.floor(totalBeforeLoyalty),
  );

  const loyaltyDiscount = effectiveRedeemPoints;

  const total = Number(
    Math.max(0, totalBeforeLoyalty - loyaltyDiscount).toFixed(2),
  );

  const handleUseAllLoyaltyPoints = () => {
    setRedeemPoints(
      Math.min(availableLoyaltyPoints, Math.floor(totalBeforeLoyalty)),
    );
  };

  const handleApplyCoupon = async (code: string) => {
    setError("");

    try {
      await applyCoupon(code);
    } catch (err) {
      // CartContext exposes couponError for the coupon input UI.
      // Keep checkout-level errors reserved for checkout actions.
      console.error("Coupon application failed:", err);
    }
  };

  const handleRemoveCoupon = async () => {
    setError("");

    try {
      await removeCoupon();
    } catch (err) {
      console.error("Coupon removal failed:", err);
    }
  };

  const handlePlaceOrder = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError("");

    if (!isLoaded || !isSignedIn) {
      setError("Please sign in to continue checkout.");
      return;
    }

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (isLoadingAddresses) {
      setError("Please wait while your saved addresses load.");
      return;
    }

    if (!selectedAddressId || !selectedAddress) {
      setError("Please select a saved address.");
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const order = await placeOrder(
        {
          addressId: selectedAddressId,
          paymentMethod,
          redeemPoints: effectiveRedeemPoints,
        },
        getToken,
      );

      await clearCart();

      navigate("/order-confirmation", {
        state: { order },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place your order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    cart,
    subtotal,
    couponDiscount,
    discountedSubtotal,
    appliedCoupon,
    couponLoading,
    couponError,
    handleApplyCoupon,
    handleRemoveCoupon,

    deliveryFee,
    taxes,

    totalBeforeLoyalty,
    loyaltyDiscount,
    redeemPoints,
    setRedeemPoints,
    effectiveRedeemPoints,
    total,

    addresses,
    selectedAddress,
    selectedAddressId,
    setSelectedAddressId,
    isLoadingAddresses,

    paymentMethod,
    setPaymentMethod,

    isSubmitting,
    error,
    handlePlaceOrder,
    availableLoyaltyPoints,
    isLoadingLoyalty,
    handleUseAllLoyaltyPoints,
  };
}
