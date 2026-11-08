
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@clerk/react";

import OrderCard from "./components/OrderCard";
import { getOrders } from "./services/orderService";
import type { Order } from "./types/order";

export default function OrdersPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setOrders([]);
      setError("Please sign in to view your orders.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await getOrders(getToken);
      setOrders(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your orders.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link to="/outlets" className="text-sm text-orange-600">
            ← Continue shopping
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            My orders
          </h1>
          <p className="mt-1 text-gray-500">
            View your orders and track their progress.
          </p>
        </div>

        {isLoading ? (
          <div className="rounded-xl border bg-white p-8 text-center text-gray-500">
            Loading your orders...
          </div>
        ) : error ? (
          <div className="rounded-xl border bg-white p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => void loadOrders()}
              className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              No orders yet
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Your orders will appear here once you place one.
            </p>
            <Link
              to="/outlets"
              className="mt-5 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
            >
              Explore outlets
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
