
import { useCallback, useEffect, useRef, useState } from "react";
import {
  RefreshCw,
  Clock,
  ShoppingBag,
  AlertCircle,
} from "lucide-react";

import { useApi } from "../../../lib/api";
import type { Order, OrderStatus } from "../../orders/types/order";
import { normalizeOrder } from "../../orders/services/orderService";

interface OrdersResponse {
  success: boolean;
  orders: unknown[];
  message?: string;
}

const statusLabels: Record<OrderStatus, string> = {
  PLACED: "New",
  ACCEPTED: "Accepted",
  PREPARING: "Preparing",
  READY: "Ready",
  AWAITING_DELIVERY_PARTNER: "Awaiting delivery",
  HANDED_OFF: "Handed off",
  CANCELLED: "Cancelled",
};

const statusStyles: Record<OrderStatus, string> = {
  PLACED: "bg-blue-50 text-blue-700",
  ACCEPTED: "bg-indigo-50 text-indigo-700",
  PREPARING: "bg-orange-50 text-orange-700",
  READY: "bg-emerald-50 text-emerald-700",
  AWAITING_DELIVERY_PARTNER: "bg-purple-50 text-purple-700",
  HANDED_OFF: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-50 text-red-700",
};

function getNextStatus(status: OrderStatus): OrderStatus | null {
  switch (status) {
    case "PLACED":
      return "ACCEPTED";
    case "ACCEPTED":
      return "PREPARING";
    case "PREPARING":
      return "READY";
    case "READY":
      return "AWAITING_DELIVERY_PARTNER";
    case "AWAITING_DELIVERY_PARTNER":
      return "HANDED_OFF";
    default:
      return null;
  }
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

export default function ManagerOrdersPage() {
  const { apiFetch } = useApi();

  const apiFetchRef = useRef(apiFetch);
  apiFetchRef.current = apiFetch;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");

  const loadOrders = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await apiFetchRef.current(
        "/api/management/manager/orders",
      );

      const data = (await response.json()) as OrdersResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Unable to load outlet orders.");
      }

      if (!Array.isArray(data.orders)) {
        throw new Error("Invalid orders response from API.");
      }

      setOrders(data.orders.map(normalizeOrder));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load outlet orders.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const handleStatusUpdate = async (order: Order) => {
    const nextStatus = getNextStatus(order.status);

    if (!nextStatus) return;

    setUpdatingOrderId(order.id);
    setError("");
    setNotice("");

    try {
      const response = await apiFetchRef.current(
        `/api/management/manager/orders/${encodeURIComponent(order.id)}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        },
      );

      const data = (await response.json()) as {
        success: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message ?? "Could not update order status.");
      }

      setNotice(
        `Order ${order.orderNumber} updated to ${statusLabels[nextStatus]}.`,
      );

      await loadOrders(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not update order status.",
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  const activeOrders = orders.filter(
    (order) =>
      order.status !== "HANDED_OFF" &&
      order.status !== "CANCELLED",
  ).length;

  if (loading) {
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
          Loading outlet orders...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Outlet Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage orders received by your outlet.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Total orders</p>
            <ShoppingBag className="text-orange-600" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {orders.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Active orders</p>
            <Clock className="text-orange-600" size={20} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {activeOrders}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Completed orders</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {orders.filter((order) => order.status === "HANDED_OFF").length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "PLACED", "ACCEPTED", "PREPARING", "READY"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                filter === status
                  ? "bg-orange-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "ALL" ? "All orders" : statusLabels[status]}
            </button>
          ),
        )}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-200">
          <ShoppingBag className="mx-auto text-slate-300" size={36} />
          <h3 className="mt-4 font-semibold text-slate-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Orders matching this filter will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const nextStatus = getNextStatus(order.status);

            return (
              <article
                key={order.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-bold text-slate-900">
                        #{order.orderNumber}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-600">
                      {order.outletName}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Placed {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-lg font-bold text-slate-900">
                      ₹{order.total.toFixed(2)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.paymentMethod} · {order.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="my-4 border-t border-slate-100" />

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <div>
                        <p className="font-medium text-slate-800">
                          {item.quantity} × {item.name}
                          {item.variantName ? ` (${item.variantName})` : ""}
                        </p>

                        {item.addons.length > 0 && (
                          <p className="text-xs text-slate-500">
                            Add-ons:{" "}
                            {item.addons.map((addon) => addon.name).join(", ")}
                          </p>
                        )}
                      </div>

                      <p className="font-medium text-slate-700">
                        ₹{item.lineTotal.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {nextStatus && (
                  <div className="mt-5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => void handleStatusUpdate(order)}
                      disabled={updatingOrderId === order.id}
                      className="rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                    >
                      {updatingOrderId === order.id
                        ? "Updating..."
                        : `Move to ${statusLabels[nextStatus]}`}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
