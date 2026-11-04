
import { useMemo, useState } from "react";
import { mockKitchenOrders } from "../features/kitchen/data/mockKitchenOrders";
import type {
  KitchenActionStatus,
  KitchenOrder,
} from "../features/kitchen/types/kitchenOrder";

export function useKitchenOrders() {
  const [orders, setOrders] = useState<KitchenOrder[]>(mockKitchenOrders);
  const [selectedOutlet, setSelectedOutlet] = useState("All");

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        selectedOutlet === "All" || order.outletId === selectedOutlet
    );
  }, [orders, selectedOutlet]);

  const activeOrders = useMemo(() => {
    return filteredOrders.filter(
      (order) =>
        !["DELIVERED", "CANCELLED", "OUT_FOR_DELIVERY"].includes(order.status)
    );
  }, [filteredOrders]);

  const outlets = useMemo(() => {
    return [
      { id: "All", name: "All outlets" },
      ...Array.from(
        new Map(
          orders.map((order) => [
            order.outletId,
            { id: order.outletId, name: order.outletName },
          ])
        ).values()
      ),
    ];
  }, [orders]);

  const updateStatus = (
    orderId: string,
    status: KitchenActionStatus
  ) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === orderId
          ? { ...order, status }
          : order
      )
    );
  };

  const incomingCount = activeOrders.filter(
    (order) => order.status === "PENDING_ACCEPTANCE"
  ).length;

  const preparingCount = activeOrders.filter(
    (order) =>
      order.status === "ACCEPTED" || order.status === "PREPARING"
  ).length;

  const readyCount = activeOrders.filter(
    (order) => order.status === "READY"
  ).length;

  return {
    activeOrders,
    outlets,
    selectedOutlet,
    setSelectedOutlet,
    updateStatus,
    incomingCount,
    preparingCount,
    readyCount,
  };
}
