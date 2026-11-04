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
  ) => void;
};

const nextAction: Partial<
  Record<
    KitchenOrder["status"],
    {
      label: string;
      status: KitchenActionStatus;
    }
  >
> = {
  PENDING_ACCEPTANCE: {
    label: "Accept Order",
    status: "ACCEPTED",
  },
  ACCEPTED: {
    label: "Start Preparing",
    status: "PREPARING",
  },
  PREPARING: {
    label: "Mark Ready",
    status: "READY",
  },
  READY: {
    label: "Hand off to rider",
    status: "OUT_FOR_DELIVERY",
  },
};

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

export default function KitchenOrderCard({
  order,
  onUpdateStatus,
}: KitchenOrderCardProps) {
  const [, setClock] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(
      () => setClock(Date.now()),
      30_000
    );

    return () => window.clearInterval(interval);
  }, []);

  const createdAt = new Date(order.createdAt).getTime();
  const promisedAt = new Date(order.promisedAt).getTime();
  const now = Date.now();

  const elapsedMinutes = Math.max(
    0,
    Math.floor((now - createdAt) / 60_000)
  );

  const overdueMinutes = Math.max(
    0,
    Math.ceil((now - promisedAt) / 60_000)
  );

  const isLate =
    now > promisedAt &&
    order.status !== "READY" &&
    order.status !== "OUT_FOR_DELIVERY";

  const action = nextAction[order.status];

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        isLate
          ? "border-red-300"
          : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-gray-900">
            #{order.id}
          </p>

          <p className="mt-1 text-sm text-gray-500">
            {order.outletName}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isLate
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isLate
            ? `${overdueMinutes}m overdue`
            : order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="my-4 border-t border-gray-100" />

      <div className="space-y-3">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between gap-3"
          >
            <div className="flex gap-3">
              <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-amber-50 px-2 text-sm font-bold text-amber-800">
                {item.quantity}×
              </span>

              <span className="text-sm font-medium text-gray-800">
                {item.name}
              </span>
            </div>

            <span className="whitespace-nowrap text-sm text-gray-500">
              ₹{item.price}
            </span>
          </div>
        ))}
      </div>

      {order.specialInstructions && (
        <div className="mt-4 rounded-lg bg-amber-50 p-3">
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
            ₹{order.total.toFixed(2)}
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
            {new Date(order.promisedAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {action ? (
        <button
          type="button"
          onClick={() =>
            onUpdateStatus(order.id, action.status)
          }
          className="mt-4 w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-700"
        >
          {action.label}
        </button>
      ) : (
        <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-center text-sm font-semibold text-green-700">
          Handed off to rider
        </div>
      )}
    </article>
  );
}