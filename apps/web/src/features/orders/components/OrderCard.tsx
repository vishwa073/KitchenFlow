import { Link } from "react-router-dom";
import type { Order } from "../types/order";

interface OrderCardProps {
  order: Order;
}

const formatPrice = (price: number) => `₹${price.toFixed(2)}`;

export default function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">
            {order.outletName}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Order #{order.id}
          </p>
        </div>

        <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="my-4 space-y-1 text-sm text-gray-600">
        {order.items.map((item) => (
          <p key={item.id}>
            {item.quantity} × {item.name}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between border-t pt-4">
        <p className="font-semibold text-gray-900">
          {formatPrice(order.total)}
        </p>

        <Link
          to={`/orders/${order.id}`}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
        >
          Track order
        </Link>
      </div>
    </article>
  );
}