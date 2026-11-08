
import { useState } from "react";

export type MockPaymentMethod = "UPI" | "CARD";

interface MockPaymentFormProps {
  paymentMethod: MockPaymentMethod;
  total: number;
  isSubmitting: boolean;
  onPay: () => Promise<void> | void;
}

const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

export default function MockPaymentForm({
  paymentMethod,
  total,
  isSubmitting,
  onPay,
}: MockPaymentFormProps) {
  const [upiId, setUpiId] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (paymentMethod === "UPI") {
      if (!/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
        setError("Enter a valid demo UPI ID, such as demo@upi.");
        return;
      }
    }

    if (paymentMethod === "CARD") {
      const digits = cardNumber.replace(/\s/g, "");

      if (!cardName.trim()) {
        setError("Enter the name on the demo card.");
        return;
      }

      if (!/^\d{16}$/.test(digits)) {
        setError("Enter a 16-digit demo card number.");
        return;
      }

      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
        setError("Enter expiry in MM/YY format.");
        return;
      }

      if (!/^\d{3}$/.test(cvv)) {
        setError("Enter a 3-digit demo CVV.");
        return;
      }
    }

    void onPay();
  }

  function formatCardNumber(value: string) {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-stone-900">
          {paymentMethod === "UPI" ? "Pay using UPI" : "Card payment"}
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          Demo payment only. No real money will be charged.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {paymentMethod === "UPI" ? (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-stone-700">
              Demo UPI ID
            </label>

            <input
              value={upiId}
              onChange={(event) => setUpiId(event.target.value)}
              placeholder="demo@upi"
              autoComplete="off"
              required
              className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />

            <p className="mt-2 text-xs text-stone-500">
              Use a sample ID like demo@upi for this mock flow.
            </p>
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Name on card
              </label>

              <input
                value={cardName}
                onChange={(event) => setCardName(event.target.value)}
                placeholder="Demo Customer"
                autoComplete="off"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                Demo card number
              </label>

              <input
                value={cardNumber}
                onChange={(event) =>
                  setCardNumber(formatCardNumber(event.target.value))
                }
                placeholder="1234 5678 9012 3456"
                inputMode="numeric"
                autoComplete="off"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  Expiry
                </label>

                <input
                  value={expiry}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4);

                    setExpiry(
                      value.length > 2
                        ? `${value.slice(0, 2)}/${value.slice(2)}`
                        : value,
                    );
                  }}
                  placeholder="MM/YY"
                  autoComplete="off"
                  required
                  className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-stone-700">
                  CVV
                </label>

                <input
                  value={cvv}
                  onChange={(event) =>
                    setCvv(event.target.value.replace(/\D/g, "").slice(0, 3))
                  }
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="off"
                  required
                  className="w-full rounded-xl border border-stone-200 px-3 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || total <= 0}
          className="w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Processing demo payment..."
            : `Pay ${formatPrice(total)}`}
        </button>
      </form>
    </section>
  );
}

