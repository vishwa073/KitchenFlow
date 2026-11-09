import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { CheckCircle2, Clock, MessageCircle, ShoppingBag } from "lucide-react";

type OrderData = Record<string, any>;

function getText(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function getAmount(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
}

function formatCurrency(amount: number | undefined) {
  if (amount === undefined) return "—";

  return amount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  });
}

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export default function OrderConfirmationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();

  const initialOrder = location.state?.order as OrderData | undefined;

  const orderIdFromUrl = searchParams.get("orderId");

  const [order, setOrder] = useState<OrderData | undefined>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Use the database order ID, not the displayed KF order number.
  const databaseOrderId = getText(orderIdFromUrl, initialOrder?.id);

  useEffect(() => {
    if (!databaseOrderId) {
      setError("Order ID is missing. Please open this page from checkout.");
      return;
    }

    let cancelled = false;

    async function loadOrder() {
      try {
        setLoading(true);
        setError("");

        const token = await getToken();

        if (!token) {
          throw new Error("Please sign in again to view your order.");
        }

        const response = await fetch(
          `${API_BASE}/api/orders/${encodeURIComponent(databaseOrderId!)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success || !data.order) {
          throw new Error(data.message || "Unable to load order details.");
        }

        if (!cancelled) {
          setOrder(data.order);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load order details.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [databaseOrderId, getToken]);

  const orderNumber = getText(order?.orderNumber, order?.id);

  const customerName = getText(
    order?.customerName,
    order?.user?.name,
    order?.deliveryAddressSnapshot?.recipientName,
  );

  const paymentMethod = getText(
    order?.paymentMethod,
    order?.payments?.[0]?.method,
  );

  const paymentStatus = getText(
    order?.paymentStatus,
    order?.payments?.[0]?.status,
  );

  const total = getAmount(
    order?.totalAmount,
    order?.total,
    order?.grandTotal,
    order?.finalAmount,
  );

  const outletId = getText(order?.outletId, order?.outlet?.id);

  const addressSnapshot = order?.deliveryAddressSnapshot;

  const deliveryAddress = getText(
    addressSnapshot?.formattedAddress,
    [
      addressSnapshot?.addressLine1,
      addressSnapshot?.addressLine2,
      addressSnapshot?.landmark,
      addressSnapshot?.area,
      addressSnapshot?.city,
      addressSnapshot?.state,
      addressSnapshot?.postalCode,
    ]
      .filter(Boolean)
      .join(", "),
  );

  const latestPrepEstimate = order?.prepTimeEstimates?.[0];

  const estimatedPrepMinutes = getAmount(latestPrepEstimate?.estimatedMinutes);

  const promisedAt = getText(order?.promisedAt);

  const promisedTimeLabel = promisedAt
    ? new Date(promisedAt).toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })
    : undefined;

  const prepTimeSource = getText(latestPrepEstimate?.source);

  const prepTimeReason = getText(latestPrepEstimate?.reason);

  const prepTimeMessage =
    prepTimeSource === "AI"
      ? "AI-based preparation-time estimate."
      : prepTimeSource === "FALLBACK"
        ? "Estimated using the kitchen's fallback calculation."
        : "Your preparation time will be available shortly.";

  if (loading && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <p className="text-gray-600">Loading your order...</p>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">
            Could not load order
          </h1>

          <p className="mt-3 text-gray-600">{error}</p>

          <Link
            to="/outlets"
            className="mt-6 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={44} />
        </div>

        <p className="mt-6 text-sm font-semibold tracking-widest text-orange-600">
          KITCHENFLOW
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Order received!
        </h1>

        <p className="mt-3 leading-6 text-gray-500">
          {customerName
            ? `Thank you, ${customerName}. `
            : "Thank you for ordering with us. "}
          Your order has been received by KitchenFlow.
        </p>

        {order && (
          <div className="mt-7 rounded-2xl bg-gray-50 p-5 text-left">
            {orderNumber && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Order ID</span>

                <span className="break-all text-right font-semibold text-gray-900">
                  {orderNumber}
                </span>
              </div>
            )}

            {paymentMethod && (
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Payment method</span>

                <span className="text-right font-semibold text-gray-900">
                  {paymentMethod}
                </span>
              </div>
            )}

            {paymentStatus && (
              <div className="mt-3 flex items-center justify-between gap-4">
                <span className="text-sm text-gray-500">Payment status</span>

                <span className="text-right font-semibold capitalize text-orange-700">
                  {paymentStatus.toLowerCase()}
                </span>
              </div>
            )}

            <div className="mt-3 flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500">Order total</span>

              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(total)}
              </span>
            </div>

            {deliveryAddress && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500">Delivering to</p>

                <p className="mt-1 text-sm font-medium text-gray-800">
                  {deliveryAddress}
                </p>
              </div>
            )}
          </div>
        )}
        {order && (order.loyaltyPointsEarned ?? 0) > 0 && (
          <div className="mt-4 rounded-2xl border border-green-100 bg-green-50 p-5 text-left">
            <p className="text-lg font-bold text-green-800">
              🎉 You earned {order.loyaltyPointsEarned} loyalty points!
            </p>

            <p className="mt-1 text-sm text-green-700">
              These points have been added to your loyalty account.
            </p>
          </div>
        )}

        {order && order?.items?.length > 0 && (
          <div className="mt-4 rounded-2xl bg-gray-50 p-5 text-left">
            <h2 className="font-semibold text-gray-900">Your items</h2>

            <div className="mt-3 space-y-3">
              {order.items.map((item: OrderData, index: number) => (
                <div
                  key={item.id ?? index}
                  className="flex justify-between gap-4 text-sm"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.quantity} × {item.menuItemName}
                    </p>

                    {item.variantName && (
                      <p className="text-gray-500">{item.variantName}</p>
                    )}

                    {item.addons?.map(
                      (addon: OrderData, addonIndex: number) => (
                        <p
                          key={addon.id ?? addonIndex}
                          className="text-gray-500"
                        >
                          + {addon.quantity} × {addon.addonName}
                        </p>
                      ),
                    )}
                  </div>

                  <span className="shrink-0 font-medium text-gray-900">
                    {formatCurrency(getAmount(item.lineTotal))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-xl bg-orange-50 p-4 text-left text-orange-700">
          <Clock size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">
              {estimatedPrepMinutes !== undefined
                ? `Estimated preparation: ~${estimatedPrepMinutes} minutes`
                : "Preparation time is being calculated"}
            </p>

            {promisedTimeLabel && (
              <p className="mt-1 text-sm">
                Estimated ready around {promisedTimeLabel}
              </p>
            )}

            <p className="mt-1 text-sm">{prepTimeMessage}</p>

            {prepTimeReason && <p className="mt-1 text-sm">{prepTimeReason}</p>}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-xl bg-green-50 p-4 text-left text-green-800">
          <MessageCircle size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">WhatsApp order updates</p>

            <p className="mt-1 text-sm">
              WhatsApp order confirmation and updates are at you registered
              number.
            </p>
          </div>
        </div>

        <Link
          to={outletId ? `/customer/${outletId}` : "/outlets"}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600"
        >
          <ShoppingBag size={18} />
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
