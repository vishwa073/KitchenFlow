
import { useEffect, useState } from "react";
import type {
  KitchenActionStatus,
  KitchenOrder,
} from "../types/kitchenOrder";

type KitchenOrderCardProps = {
  order: KitchenOrder;
  onUpdateStatus: (
    orderId: string,
    status: KitchenActionStatus
  ) => Promise<void>;
};

const nextAction: Partial<
  Record<
    KitchenOrder["status"],
    {
      label: string;
      status: KitchenActionStatus;
      style: string;
    }
  >
> = {
  PENDING_ACCEPTANCE: {
    label: "Accept order",
    status: "ACCEPTED",
    style: "bg-blue-600 hover:bg-blue-700",
  },
  ACCEPTED: {
    label: "Start preparing",
    status: "PREPARING",
    style: "bg-amber-600 hover:bg-amber-700",
  },
  PREPARING: {
    label: "Mark as ready",
    status: "READY",
    style: "bg-green-600 hover:bg-green-700",
  },
  READY: {
    label: "Send to delivery queue",
    status: "OUT_FOR_DELIVERY",
    style: "bg-indigo-600 hover:bg-indigo-700",
  },
  OUT_FOR_DELIVERY: {
    label: "Hand off to rider",
    status: "HANDED_OFF",
    style: "bg-gray-900 hover:bg-gray-700",
  },
};

const statusStyles: Record<string, string> = {
  PENDING_ACCEPTANCE: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-amber-50 text-amber-700",
  PREPARING: "bg-amber-50 text-amber-700",
  READY: "bg-green-50 text-green-700",
  OUT_FOR_DELIVERY: "bg-indigo-50 text-indigo-700",
};

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function KitchenOrderCard({
  order,
  onUpdateStatus,
}: KitchenOrderCardProps) {
  const [clock, setClock] = useState(Date.now());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(
      () => setClock(Date.now()),
      30_000
    );

    return () => window.clearInterval(interval);
  }, []);

  const createdAt = new Date(order.createdAt).getTime();
  const promisedAt = new Date(order.promisedAt).getTime();

  const elapsedMinutes = Math.max(
    0,
    Math.floor((clock - createdAt) / 60_000)
  );

  const overdueMinutes = Math.max(
    0,
    Math.ceil((clock - promisedAt) / 60_000)
  );

  const isLate =
    clock > promisedAt &&
    !["READY", "OUT_FOR_DELIVERY"].includes(order.status);

  const action = nextAction[order.status];

  const statusLabel =
    order.status === "PENDING_ACCEPTANCE"
      ? "Incoming"
      : order.status === "OUT_FOR_DELIVERY"
        ? "Awaiting rider"
        : order.status.replaceAll("_", " ");

  const handleAction = async () => {
    if (!action || isUpdating) return;

    setIsUpdating(true);

    try {
      await onUpdateStatus(order.id, action.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition ${
        isLate
          ? "border-red-300"
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all text-base font-bold text-gray-900">
            #{order.orderNumber || order.id}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {order.outletName}
          </p>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isLate
              ? "bg-red-100 text-red-700"
              : statusStyles[order.status] ??
                "bg-gray-100 text-gray-700"
          }`}
        >
          {isLate
            ? `${overdueMinutes}m overdue`
            : statusLabel}
        </span>
      </div>

      <div className="my-4 border-t border-gray-100" />

      <div className="space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex min-w-0 gap-3">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-amber-50 px-2 text-sm font-bold text-amber-800">
                {item.quantity}×
              </span>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {item.name}
                </p>

                {item.variantName && (
                  <p className="text-xs text-gray-500">
                    {item.variantName}
                  </p>
                )}

                {item.addons?.length > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Add-ons:{" "}
                    {item.addons
                      .map((addon) => addon.name)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>

            <span className="whitespace-nowrap text-sm text-gray-500">
              ₹{Number(item.lineTotal ?? item.price).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Special instructions
          </p>

          <p className="mt-1 text-sm text-amber-900">
            {order.specialInstructions}
          </p>
        </div>
      )}

      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Order total</span>
          <span className="font-semibold text-gray-900">
            ₹{Number(order.total).toFixed(2)}
          </span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">Elapsed</span>
          <span className="font-medium text-gray-700">
            {formatDuration(elapsedMinutes)}
          </span>
        </div>

        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-500">Promised by</span>
          <span className="font-medium text-gray-700">
            {formatTime(order.promisedAt)}
          </span>
        </div>
      </div>

      {action ? (
        <button
          type="button"
          disabled={isUpdating}
          onClick={handleAction}
          className={`mt-4 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${action.style}`}
        >
          {isUpdating ? "Updating order..." : action.label}
        </button>
      ) : (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
          Order completed
        </div>
      )}
    </article>
  );
}
