import type { KitchenActionStatus, KitchenOrder } from "../types/kitchenOrder";
import KitchenEmptyState from "./KitchenEmptyState";
import KitchenOrderCard from "./KitchenOrderCard";

type KitchenOrderBoardProps = {
  orders: KitchenOrder[];
  onUpdateStatus: (
    orderId: string,
    status: KitchenActionStatus,
  ) => Promise<void>;
};

export default function KitchenOrderBoard({
  orders,
  onUpdateStatus,
}: KitchenOrderBoardProps) {
  if (orders.length === 0) {
    return <KitchenEmptyState />;
  }

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <KitchenOrderCard
          key={order.id}
          order={order}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </section>
  );
}
