import { useCallback, useEffect, useMemo, useState } from "react";
import { useApi } from "../lib/api";
import type {
  KitchenActionStatus,
  KitchenOrder,
} from "../features/kitchen/types/kitchenOrder";
import {
  addKitchenOrderNote,
  fetchKitchenOrders,
  updateKitchenOrderStatus,
} from "../features/kitchen/services/kitchenService";
import type { OrderStatus } from "../features/orders/types/order";
import { socket } from "../lib/socket";
const toBackendStatus = (status: KitchenActionStatus): OrderStatus => {
  if (status === "OUT_FOR_DELIVERY") {
    return "AWAITING_DELIVERY_PARTNER";
  }

  return status;
};

const toKitchenOrder = (order: any): KitchenOrder => {
  let status = order.status;

  // Map backend statuses to the statuses used by the KDS UI.
  if (status === "PLACED") {
    status = "PENDING_ACCEPTANCE";
  } else if (status === "AWAITING_DELIVERY_PARTNER") {
    status = "OUT_FOR_DELIVERY";
  }

  return {
    ...order,
    status,
    outletId: order.outletId,
    paymentMethod: order.paymentMethod,
    promisedAt: order.promisedAt ?? order.createdAt,
    specialInstructions: order.specialInstructions,
  };
};

export function useKitchenOrders() {
  const { apiFetch } = useApi();

  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [outlets, setOutlets] = useState<{ id: string; name: string }[]>([
    { id: "All", name: "All outlets" },
  ]);
  const [selectedOutlet, setSelectedOutlet] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setError(null);

      const result = await fetchKitchenOrders(apiFetch);

      setOrders(result.orders.map(toKitchenOrder));
      setOutlets([{ id: "All", name: "All outlets" }, ...result.outlets]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load kitchen orders.",
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);
  useEffect(() => {
    const handleOrderCreated = () => {
      void loadOrders();
    };

    socket.on("order.created", handleOrderCreated);

    return () => {
      socket.off("order.created", handleOrderCreated);
    };
  }, [loadOrders]);
  const filteredOrders = useMemo(
    () =>
      orders.filter(
        (order) =>
          selectedOutlet === "All" || order.outletId === selectedOutlet,
      ),
    [orders, selectedOutlet],
  );

  const activeOrders = useMemo(
    () =>
      filteredOrders.filter(
        (order) =>
          !["HANDED_OFF", "DELIVERED", "CANCELLED"].includes(order.status),
      ),
    [filteredOrders],
  );

  const updateStatus = useCallback(
    async (orderId: string, status: KitchenActionStatus) => {
      try {
        setError(null);

        const updatedOrder = await updateKitchenOrderStatus(
          apiFetch,
          orderId,
          toBackendStatus(status),
        );

        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? toKitchenOrder(updatedOrder) : order,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to update order status.",
        );

        // Refresh to restore the server's authoritative state.
        await loadOrders();
      }
    },
    [apiFetch, loadOrders],
  );

  const addNote = useCallback(
    async (orderId: string, note: string) => {
      await addKitchenOrderNote(apiFetch, orderId, note);
    },
    [apiFetch],
  );

  const incomingCount = activeOrders.filter(
    (order) => order.status === "PENDING_ACCEPTANCE",
  ).length;

  const preparingCount = activeOrders.filter(
    (order) => order.status === "ACCEPTED" || order.status === "PREPARING",
  ).length;

  const readyCount = activeOrders.filter(
    (order) => order.status === "READY",
  ).length;

  return {
    activeOrders,
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    updateStatus,
    addNote,
    incomingCount,
    preparingCount,
    readyCount,
    loading,
    error,
    refreshOrders: loadOrders,
  };
}
