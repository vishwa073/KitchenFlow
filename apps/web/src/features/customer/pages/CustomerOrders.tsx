
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import {
  ArrowRight,
  ClipboardList,
  Clock3,
} from "lucide-react";

import CustomerSection from "../components/CustomerSection";
import { getOrders } from "../../orders/services/orderService";
import type {
  Order,
  OrderStatus,
} from "../../orders/types/order";

const statusStyles: Record<OrderStatus, string> = {
  PLACED: "bg-gray-100 text-gray-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READY: "bg-purple-100 text-purple-700",
  AWAITING_DELIVERY_PARTNER: "bg-indigo-100 text-indigo-700",
  HANDED_OFF: "bg-blue-100 text-blue-700",
  CANCELLED: "bg-red-100 text-red-700",
};

function formatStatus(status: OrderStatus): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatOrderDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function CustomerOrders() {
  const navigate = useNavigate();
  const { outletId } = useParams<{ outletId: string }>();

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
      // Use the same existing service as OrdersPage.tsx.
      const result = await getOrders(getToken);

      setOrders(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load your orders.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [getToken, isLoaded, isSignedIn]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
      <CustomerSection
        title="Your orders"
        description="Track your current order and revisit your past orders."
      >
        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <Clock3
              size={32}
              className="mx-auto animate-pulse text-orange-500"
            />

            <p className="mt-4 text-sm text-stone-500">
              Loading your orders...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => void loadOrders()}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Try again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <ClipboardList
              size={40}
              className="mx-auto text-stone-300"
            />

            <h3 className="mt-4 text-lg font-semibold text-stone-900">
              No orders yet
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Your orders will appear here after you place one.
            </p>

            <button
              type="button"
              onClick={() => navigate(`/customer/${outletId}`)}
              className="mt-5 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
            >
              Explore menu
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-stone-500">
                      Order #{order.orderNumber}
                    </p>

                    <h3 className="mt-1 font-bold text-stone-900">
                      {order.outletName}
                    </h3>

                    <p className="mt-1 flex items-center gap-2 text-sm text-stone-500">
                      <Clock3 size={15} />
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      statusStyles[order.status]
                    }`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>

                <div className="mt-4 border-t border-stone-100 pt-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id}>
                        <div className="flex flex-wrap justify-between gap-2">
                          <p className="text-sm text-stone-600">
                            {item.quantity} × {item.name}
                            {item.variantName
                              ? ` (${item.variantName})`
                              : ""}
                          </p>

                          <p className="text-sm font-medium text-stone-700">
                            ₹{item.lineTotal.toFixed(2)}
                          </p>
                        </div>

                        {item.addons.length > 0 && (
                          <div className="ml-4 mt-1 space-y-1">
                            {item.addons.map((addon) => (
                              <p
                                key={addon.id}
                                className="text-xs text-stone-500"
                              >
                                + {addon.quantity} × {addon.name}
                                {" — "}
                                ₹{addon.lineTotal.toFixed(2)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
                    <div>
                      <p className="text-xs text-stone-500">
                        Total amount
                      </p>

                      <p className="font-bold text-stone-900">
                        ₹{order.total.toFixed(2)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/orders/${order.id}`, {
                          state: {
                            returnTo: `/customer/${outletId}`,
                          },
                        })
                      }
                      className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      View order
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </CustomerSection>
    </div>
  );
}
