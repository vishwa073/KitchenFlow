import type { PaymentMethod } from "../types/checkout";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

const paymentOptions: {
  value: PaymentMethod;
  label: string;
  description: string;
}[] = [
  {
    value: "upi",
    label: "UPI",
    description: "Pay using UPI apps",
  },
  {
    value: "card",
    label: "Credit / Debit Card",
    description: "Pay using your card",
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
  },
];

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodSelectorProps) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Payment method
      </h2>

      <p className="mb-5 text-sm text-gray-500">
        Choose how you want to pay.
      </p>

      <div className="space-y-3">
        {paymentOptions.map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
              paymentMethod === option.value
                ? "border-orange-500 bg-orange-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={option.value}
              checked={paymentMethod === option.value}
              onChange={() => setPaymentMethod(option.value)}
              className="accent-orange-600"
            />

            <div>
              <p className="font-medium text-gray-900">
                {option.label}
              </p>
              <p className="text-sm text-gray-500">
                {option.description}
              </p>
            </div>
          </label>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Payment is currently a demo selection. No real payment is processed.
      </p>
    </section>
  );
}