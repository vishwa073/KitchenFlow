import { useCallback, useEffect, useState } from "react";
import { getOrders } from "../features/orders/services/orderService";
import type { Order } from "../features/orders/types/order";

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return {
    orders,
    isLoading,
    error,
    refreshOrders: loadOrders,
  };
}