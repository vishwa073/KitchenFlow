
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { getOrders } from "../features/orders/services/orderService";
import type { Order } from "../features/orders/types/order";

export function useOrders() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
const ORDERS_API_URL = `${import.meta.env.VITE_API_URL}/api`;
  const loadOrders = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setOrders([]);
      setError("Please sign in to view your orders.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await getOrders(getToken);
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading: !isLoaded || isLoading,
    error,
    refreshOrders: loadOrders,
  };
}
