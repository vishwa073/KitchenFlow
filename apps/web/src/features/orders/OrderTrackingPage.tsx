import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import OrderStatusTimeline from "./components/OrderStatusTimeline";
import { getOrderById } from "./services/orderService";
import type { Order } from "./types/order";

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOrder() {
      if (!orderId) {
        setError("Order ID is missing.");
        setIsLoading(false);
        return;
      }

      try {
        const result = await getOrderById(orderId);

        if (!result) {
          setError("Order not found.");
        } else {
          setOrder(result);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load order."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadOrder();
  }, [orderId]);

  if (isLoading) {
    return <p className="p-8 text-gray-500">Loading order...</p>;
  }

  if (error || !order) {
    return (
      <main className="p-8">
        <p className="text-red-600">{error || "Order not found."}</p>
        <Link to="/orders" className="mt-3 inline-block text-orange-600">
          Back to orders
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/orders" className="text-sm text-orange-600">
          ← My orders
        </Link>

        <section className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-gray-500">Order #{order.id}</p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {order.status === "DELIVERED"
              ? "Order delivered"
              : order.status === "CANCELLED"
                ? "Order cancelled"
                : "Track your order"}
          </h1>

          <p className="mt-2 text-gray-600">{order.outletName}</p>

          {order.estimatedPreparationMinutes && (
            <p className="mt-3 text-sm text-gray-500">
              Estimated preparation time:{" "}
              {order.estimatedPreparationMinutes} minutes
            </p>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Order progress</h2>
          <OrderStatusTimeline status={order.status} />
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Order details</h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-4">
                <span className="text-gray-600">
                  {item.quantity} × {item.name}
                </span>
                <span>₹{(item.quantity * item.price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}