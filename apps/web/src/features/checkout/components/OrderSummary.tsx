import type { Cart } from "../../cart/types/cart";

interface OrderSummaryProps {
  cart: Cart;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  error: string;
  isSubmitting: boolean;
}

const formatPrice = (amount: number) =>
  `₹${amount.toFixed(2)}`;

export default function OrderSummary({
  cart,
  subtotal,
  deliveryFee,
  taxes,
  total,
  error,
  isSubmitting,
}: OrderSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Order summary
      </h2>

      <div className="mb-5 space-y-4">
        {cart.items.map(({ menuItem, quantity }) => (
          <div
            key={menuItem.id}
            className="flex justify-between gap-4 text-sm"
          >
            <div>
              <p className="font-medium text-gray-800">
                {menuItem.name}
              </p>
              <p className="text-gray-500">
                Qty: {quantity}
              </p>
            </div>

            <p className="font-medium text-gray-800">
              {formatPrice(menuItem.price * quantity)}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-3 border-t pt-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Delivery fee</span>
          <span>
            {deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Taxes (5%)</span>
          <span>{formatPrice(taxes)}</span>
        </div>

        <div className="flex justify-between border-t pt-3 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Placing order..."
          : `Place order · ${formatPrice(total)}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Your order will be pending outlet acceptance.
      </p>
    </aside>
  );
}