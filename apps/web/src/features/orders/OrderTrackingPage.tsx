
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";

import OrderStatusTimeline from "./components/OrderStatusTimeline";
import { getOrderById } from "./services/orderService";
import type { Order } from "./types/order";

export default function OrderTrackingPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      if (!isLoaded) return;

      if (!isSignedIn) {
        setError("Please sign in to view this order.");
        setIsLoading(false);
        return;
      }

      if (!orderId) {
        setError("Order ID is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const result = await getOrderById(orderId, getToken);

        if (cancelled) return;

        if (!result) {
          setError("Order not found.");
        } else {
          setOrder(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Unable to load order.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, isSignedIn, orderId]);

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

  const isFinished =
    order.status === "HANDED_OFF" || order.status === "CANCELLED";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <Link to="/orders" className="text-sm text-orange-600">
          ← My orders
        </Link>

        <section className="rounded-2xl border bg-white p-6">
          <p className="text-sm text-gray-500">
            Order #{order.orderNumber}
          </p>

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {order.status === "HANDED_OFF"
              ? "Order handed off"
              : order.status === "CANCELLED"
                ? "Order cancelled"
                : "Track your order"}
          </h1>

          <p className="mt-2 text-gray-600">{order.outletName}</p>

          {order.estimatedPreparationMinutes && !isFinished && (
            <p className="mt-3 text-sm text-gray-500">
              Estimated preparation time:{" "}
              {order.estimatedPreparationMinutes} minutes
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            Payment: {order.paymentMethod} · {order.paymentStatus}
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Order progress</h2>
          <OrderStatusTimeline status={order.status} />
        </section>

        {order.statusHistory.length > 0 && (
          <section className="rounded-2xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold">Status updates</h2>
            <ol className="space-y-4">
              {[...order.statusHistory]
                .sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime(),
                )
                .map((entry, index) => (
                  <li key={`${entry.updatedAt}-${index}`}>
                    <p className="text-sm font-medium text-gray-800">
                      {entry.message}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {entry.updatedAt
                        ? new Date(entry.updatedAt).toLocaleString("en-IN")
                        : "Time unavailable"}
                    </p>
                  </li>
                ))}
            </ol>
          </section>
        )}

        <section className="rounded-2xl border bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Order details</h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id}>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">
                    {item.quantity} × {item.name}
                    {item.variantName ? ` (${item.variantName})` : ""}
                  </span>
                  <span>₹{item.lineTotal.toFixed(2)}</span>
                </div>

                {item.addons.length > 0 && (
                  <div className="ml-5 mt-1 space-y-1 text-sm text-gray-500">
                    {item.addons.map((addon) => (
                      <p key={addon.id}>
                        + {addon.quantity} × {addon.name} — ₹
                        {addon.lineTotal.toFixed(2)}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 border-t pt-4 text-sm">
            <div className="flex justify-between">
              <span>Items subtotal</span>
              <span>₹{order.subtotal.toFixed(2)}</span>
            </div>

            {order.addonTotal > 0 && (
              <div className="flex justify-between">
                <span>Add-ons</span>
                <span>₹{order.addonTotal.toFixed(2)}</span>
              </div>
            )}

            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount</span>
                <span>-₹{order.discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Delivery fee</span>
              <span>₹{order.deliveryFee.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span>Taxes</span>
              <span>₹{order.taxes.toFixed(2)}</span>
            </div>

            <div className="flex justify-between border-t pt-3 text-base font-semibold">
              <span>Total</span>
              <span>₹{order.total.toFixed(2)}</span>
            </div>
          </div>

          {order.deliveryAddress && (
            <div className="mt-5 border-t pt-4">
              <p className="text-sm text-gray-500">Delivery address</p>
              <p className="mt-1 text-sm text-gray-800">
                {order.deliveryAddress}
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
