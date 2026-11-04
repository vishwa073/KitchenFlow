import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useCart } from "../features/cart/context/CartContext";
import { placeOrder } from "../features/checkout/services/checkoutService";
import type { PaymentMethod } from "../features/checkout/types/checkout";

export function useCheckout() {
  const navigate = useNavigate();
  const { cart, subtotal, clearCart } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("upi");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const deliveryFee =
    subtotal === 0 || subtotal >= 499 ? 0 : 40;

  const taxes = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + deliveryFee + taxes).toFixed(2));

  const handlePlaceOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!cart || cart.items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError("Please fill in your name, phone number, and address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await placeOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        landmark: landmark.trim(),
        paymentMethod,
        cart,
      });

      clearCart();

      navigate("/order-confirmation", {
        state: { order },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to place your order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    cart,
    subtotal,
    deliveryFee,
    taxes,
    total,

    customerName,
    setCustomerName,
    phone,
    setPhone,
    address,
    setAddress,
    landmark,
    setLandmark,
    paymentMethod,
    setPaymentMethod,

    isSubmitting,
    error,
    handlePlaceOrder,
  };
}
