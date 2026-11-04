import KitchenHeader from "./component/KitchenHeader";
import KitchenStats from "./component/KitchenStats";
import KitchenOrderBoard from "./component/KitchenOrderBoard";
import { useKitchenOrders } from "../../hooks/useKitchenOrders";

export default function KitchenDisplayPage() {
  const kitchen = useKitchenOrders();

  return (
    <main className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6">
      <KitchenHeader
        outlets={kitchen.outlets}
        selectedOutlet={kitchen.selectedOutlet}
        onOutletChange={kitchen.setSelectedOutlet}
      />

      <KitchenStats
        incoming={kitchen.incomingCount}
        preparing={kitchen.preparingCount}
        ready={kitchen.readyCount}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Orders
          </h2>

          <span className="text-sm text-gray-500">
            {kitchen.activeOrders.length} orders
          </span>
        </div>

        <KitchenOrderBoard
          orders={kitchen.activeOrders}
          onUpdateStatus={kitchen.updateStatus}
        />
      </div>
    </main>
  );
}