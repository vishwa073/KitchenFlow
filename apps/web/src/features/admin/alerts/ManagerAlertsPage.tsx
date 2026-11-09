
import { useCallback, useEffect, useState } from "react";
import {
  BellRing,
  Check,
  Clock3,
  LoaderCircle,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useApi } from "../../../lib/api";
import { socket } from "../../../lib/socket";

type AlertStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

type KitchenAlert = {
  id: string;
  orderId: string;
  type: string;
  message: string;
  status: AlertStatus;
  triggeredAt: string;
  acknowledgedAt?: string | null;
  resolvedAt?: string | null;
  acknowledgedBy?: {
    id: string;
    fullName: string;
  } | null;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    promisedAt: string;
    outletId: string;
    outlet: {
      id: string;
      name: string;
      code: string;
    };
  };
};

type AlertsResponse = {
  success: boolean;
  message?: string;
  alerts: KitchenAlert[];
};

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusClasses(status: AlertStatus) {
  switch (status) {
    case "OPEN":
      return "bg-rose-100 text-rose-700";
    case "ACKNOWLEDGED":
      return "bg-amber-100 text-amber-700";
    case "RESOLVED":
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function ManagerAlertsPage() {
  const { apiFetch } = useApi();

  const [alerts, setAlerts] = useState<KitchenAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadAlerts = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await apiFetch("/api/kitchen/alerts");
      const data = (await response.json()) as AlertsResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not load kitchen alerts.");
      }

      setAlerts(data.alerts ?? []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load kitchen alerts.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    void loadAlerts();

    const handleCreated = (payload: {
      alert?: KitchenAlert;
    }) => {
      if (!payload?.alert?.id) return;

      setAlerts((current) => {
        const exists = current.some((item) => item.id === payload.alert!.id);

        if (exists) {
          return current.map((item) =>
            item.id === payload.alert!.id ? payload.alert! : item,
          );
        }

        return [payload.alert!, ...current];
      });
    };

    const handleUpdated = (payload: {
      alert?: KitchenAlert;
    }) => {
      if (!payload?.alert?.id) return;

      setAlerts((current) =>
        current.map((item) =>
          item.id === payload.alert!.id ? payload.alert! : item,
        ),
      );
    };

    socket.on("kitchen.alert.created", handleCreated);
    socket.on("kitchen.alert.updated", handleUpdated);

    return () => {
      socket.off("kitchen.alert.created", handleCreated);
      socket.off("kitchen.alert.updated", handleUpdated);
    };
  }, [loadAlerts]);

  const updateAlert = async (
    alertId: string,
    action: "acknowledge" | "resolve",
  ) => {
    setActionId(alertId);
    setError("");

    try {
      const response = await apiFetch(
        `/api/kitchen/alerts/${alertId}/${action}`,
        { method: "PATCH" },
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        alert?: KitchenAlert;
      };

      if (!response.ok || !data.success) {
        throw new Error(data.message || `Could not ${action} alert.`);
      }

      if (data.alert) {
        setAlerts((current) =>
          current.map((item) =>
            item.id === data.alert!.id ? data.alert! : item,
          ),
        );
      } else {
        // Reload to reflect the updated alert returned by the backend.
        await loadAlerts(false);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Could not ${action} alert.`,
      );
    } finally {
      setActionId(null);
    }
  };

  const openCount = alerts.filter((item) => item.status === "OPEN").length;
  const acknowledgedCount = alerts.filter(
    (item) => item.status === "ACKNOWLEDGED",
  ).length;
  const resolvedCount = alerts.filter(
    (item) => item.status === "RESOLVED",
  ).length;

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
            <BellRing size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Manager Alerts
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor delayed orders and manage kitchen alerts.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadAlerts(false)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            type="button"
            onClick={() => void loadAlerts()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Open alerts",
            count: openCount,
            color: "text-rose-600",
          },
          {
            label: "Acknowledged",
            count: acknowledgedCount,
            color: "text-amber-600",
          },
          {
            label: "Resolved",
            count: resolvedCount,
            color: "text-emerald-600",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
          >
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-3 text-3xl font-bold ${item.color}`}>
              {loading ? "—" : item.count}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Alert feed</h2>
            <p className="mt-1 text-sm text-slate-500">
              Late-order alerts across your assigned outlets.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {alerts.length} total
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin" />
            Loading alerts...
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Clock3 size={26} />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              No kitchen alerts
            </h3>
            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              New late-order alerts will appear here automatically when orders
              pass their promised preparation time.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      Order #{alert.order.orderNumber}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(alert.status)}`}
                    >
                      {alert.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-slate-500">
                      {alert.order.outlet.name}
                    </span>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {alert.message}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>Triggered: {formatDate(alert.triggeredAt)}</span>
                    <span>
                      Promised: {formatDate(alert.order.promisedAt)}
                    </span>
                    {alert.acknowledgedBy && (
                      <span>
                        Acknowledged by {alert.acknowledgedBy.fullName}
                      </span>
                    )}
                  </div>
                </div>

                {alert.status !== "RESOLVED" && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                    {alert.status === "OPEN" && (
                      <button
                        type="button"
                        onClick={() =>
                          void updateAlert(alert.id, "acknowledge")
                        }
                        disabled={actionId === alert.id}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-60"
                      >
                        {actionId === alert.id ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Check size={16} />
                        )}
                        Acknowledge
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => void updateAlert(alert.id, "resolve")}
                      disabled={actionId === alert.id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {actionId === alert.id ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
