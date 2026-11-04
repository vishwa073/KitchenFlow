import type { OrderStatus } from "../types/order";

interface OrderStatusTimelineProps {
  status: OrderStatus;
}

const steps: { status: OrderStatus; label: string }[] = [
  { status: "PENDING_ACCEPTANCE", label: "Pending outlet acceptance" },
  { status: "ACCEPTED", label: "Order accepted" },
  { status: "PREPARING", label: "Preparing your food" },
  { status: "READY", label: "Order ready" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

export default function OrderStatusTimeline({
  status,
}: OrderStatusTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <p className="rounded-xl bg-red-50 p-4 font-medium text-red-700">
        This order has been cancelled.
      </p>
    );
  }

  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <ol className="space-y-5">
      {steps.map((step, index) => {
        const isComplete = index <= currentIndex;

        return (
          <li key={step.status} className="flex items-start gap-3">
            <span
              className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full text-xs ${
                isComplete
                  ? "bg-orange-600 text-white"
                  : "border border-gray-300 bg-white text-gray-400"
              }`}
            >
              {isComplete ? "✓" : ""}
            </span>

            <span
              className={
                isComplete
                  ? "font-medium text-gray-900"
                  : "text-gray-400"
              }
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}