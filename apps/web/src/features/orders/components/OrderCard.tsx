
import { Link } from "react-router-dom";
import type { Order } from "../types/order";

interface Props {
  order: Order;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function statusLabel(status: Order["status"]) {
  return status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function OrderCard({ order }: Props) {
  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{order.outletName}</p>
          <p className="mt-1 text-sm text-gray-500">
            Order #{order.orderNumber}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {formatDate(order.createdAt)}
          </p>
        </div>

        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          {statusLabel(order.status)}
        </span>
      </div>

      <div className="my-4 space-y-1">
        {order.items.slice(0, 3).map((item) => (
          <p key={item.id} className="text-sm text-gray-600">
            {item.quantity} × {item.name}
            {item.variantName ? ` (${item.variantName})` : ""}
          </p>
        ))}

        {order.items.length > 3 && (
          <p className="text-sm text-gray-400">
            +{order.items.length - 3} more item(s)
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-semibold text-gray-900">
            ₹{order.total.toFixed(2)}
          </p>
        </div>

        <Link
          to={`/orders/${order.id}`}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          View order
        </Link>
      </div>
    </article>
  );
}
