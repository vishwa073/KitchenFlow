
type PaymentMethod = "UPI" | "CARD";

interface PaymentMethodSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
}

const paymentOptions: {
  value: PaymentMethod;
  title: string;
  description: string;
}[] = [
  {
    value: "UPI",
    title: "UPI",
    description: "Pay using a UPI app",
  },
  {
    value: "CARD",
    title: "Credit or debit card",
    description: "Pay using your card",
  },
];

export default function PaymentMethodSelector({
  paymentMethod,
  setPaymentMethod,
}: PaymentMethodSelectorProps) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        Payment method
      </h2>

      <div className="space-y-3">
        {paymentOptions.map((option) => {
          const selected = paymentMethod === option.value;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selected
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={option.value}
                checked={selected}
                onChange={() => setPaymentMethod(option.value)}
                className="mt-1 accent-orange-600"
              />

              <div>
                <p className="font-medium text-gray-900">
                  {option.title}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {option.description}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
        Demo payment: payment processing is not connected yet.
      </p>
    </section>
  );
}
