
import type { OrderStatus } from "../types/order";

interface Props {
  status: OrderStatus;
}

const steps: { status: OrderStatus; label: string }[] = [
  { status: "PLACED", label: "Order placed" },
  { status: "ACCEPTED", label: "Order accepted" },
  { status: "PREPARING", label: "Preparing your food" },
  { status: "READY", label: "Order ready" },
  {
    status: "AWAITING_DELIVERY_PARTNER",
    label: "Waiting for delivery partner",
  },
  { status: "HANDED_OFF", label: "Handed off" },
];

export default function OrderStatusTimeline({ status }: Props) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700">
        This order has been cancelled.
      </div>
    );
  }

  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <ol className="space-y-4">
      {steps.map((step, index) => {
        const completed = currentIndex >= index;
        const current = currentIndex === index;

        return (
          <li key={step.status} className="flex items-start gap-3">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                completed
                  ? "bg-orange-600 text-white"
                  : "border border-gray-300 text-gray-400"
              }`}
            >
              {completed ? "✓" : ""}
            </span>

            <span
              className={
                current
                  ? "font-semibold text-orange-700"
                  : completed
                    ? "text-gray-800"
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
