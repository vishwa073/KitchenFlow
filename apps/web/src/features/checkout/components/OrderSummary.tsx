import { useState } from "react";
import type { Cart } from "../../cart/types/cart";

interface OrderSummaryProps {
  cart: Cart;
  subtotal: number;
  deliveryFee: number;
  taxes: number;
  total: number;
  error: string;
  isSubmitting: boolean;

  discount?: number;
  loyaltyDiscount?: number;
  loyaltyPointsRedeemed?: number;
  appliedCoupon?: string;
  onApplyCoupon?: (code: string) => void | Promise<void>;
  onRemoveCoupon?: () => void | Promise<void>;
  couponLoading?: boolean;
  couponError?: string;

  // Preview only. Points are awarded after order completion.
  pointsToEarn?: number;
}

const formatPrice = (amount: number) => `₹${amount.toFixed(2)}`;

export default function OrderSummary({
  cart,
  subtotal,
  deliveryFee,
  taxes,
  total,
  error,
  isSubmitting,
  discount = 0,
  loyaltyDiscount = 0,
  loyaltyPointsRedeemed = 0,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading = false,
  couponError = "",
  pointsToEarn = 0,
}: OrderSummaryProps) {
  return (
    <aside className="h-fit rounded-2xl border bg-white p-6">
      <h2 className="mb-5 text-lg font-semibold text-gray-900">
        Order summary
      </h2>

      {/* Items, selected portion and add-ons */}
      <div className="mb-5 space-y-4">
        {cart.items.map((item, index) => {
          const addonsTotal = item.selectedAddons.reduce(
            (sum, addon) => sum + Number(addon.price) * addon.quantity,
            0,
          );

          const itemTotal =
            (Number(item.selectedVariant.price) + addonsTotal) * item.quantity;

          return (
            <div
              key={`${item.id}-${index}`}
              className="flex justify-between gap-4 text-sm"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800">
                  {item.menuItem.name}
                </p>

                <p className="text-gray-500">
                  {item.selectedVariant.name} · Qty: {item.quantity}
                </p>

                {item.selectedAddons.length > 0 && (
                  <div className="mt-1 space-y-1 text-xs text-gray-500">
                    {item.selectedAddons.map((addon) => (
                      <p key={addon.id}>
                        + {addon.name}
                        {addon.quantity > 1 ? ` × ${addon.quantity}` : ""}
                        {" · "}
                        {formatPrice(Number(addon.price) * addon.quantity)}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <p className="shrink-0 font-medium text-gray-800">
                {formatPrice(itemTotal)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Coupon entry */}
      {onApplyCoupon && (
        <CouponEntry
          appliedCoupon={appliedCoupon}
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
          couponLoading={couponLoading}
          couponError={couponError}
        />
      )}

      {/* Bill details */}
      <div className="space-y-3 border-t pt-4 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>
              Coupon discount
              {appliedCoupon ? ` (${appliedCoupon})` : ""}
            </span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Delivery fee</span>
          <span>{deliveryFee === 0 ? "FREE" : formatPrice(deliveryFee)}</span>
        </div>
        {loyaltyDiscount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>
              Loyalty points
              {loyaltyPointsRedeemed > 0
                ? ` (${loyaltyPointsRedeemed} points)`
                : ""}
            </span>
            <span>-{formatPrice(loyaltyDiscount)}</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Taxes</span>
          <span>{formatPrice(taxes)}</span>
        </div>

        <div className="flex justify-between border-t pt-3 text-base font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Loyalty points preview */}
      {pointsToEarn > 0 && (
        <div className="mt-4 rounded-xl bg-orange-50 p-3 text-sm text-orange-800">
          <p className="font-semibold">Earn {pointsToEarn} loyalty points</p>
          <p className="mt-1 text-xs">
            Points are added after your order is completed.
          </p>
        </div>
      )}

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
        disabled={isSubmitting || couponLoading}
        className="mt-6 w-full rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? "Placing order..."
          : `Place order · ${formatPrice(total)}`}
      </button>

      <p className="mt-3 text-center text-xs text-gray-500">
        Demo checkout · Your order will be pending outlet acceptance.
      </p>
    </aside>
  );
}

interface CouponEntryProps {
  appliedCoupon?: string;
  onApplyCoupon: (code: string) => void | Promise<void>;
  onRemoveCoupon?: () => void | Promise<void>;
  couponLoading: boolean;
  couponError: string;
}

function CouponEntry({
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading,
  couponError,
}: CouponEntryProps) {
  const [couponCode, setCouponCode] = useState("");

  return (
    <div className="mb-5 border-t pt-4">
      <p className="mb-2 text-sm font-medium text-gray-800">Apply coupon</p>

      {appliedCoupon ? (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-sm">
          <span className="font-medium text-green-800">
            {appliedCoupon} applied
          </span>

          {onRemoveCoupon && (
            <button
              type="button"
              onClick={() => void onRemoveCoupon()}
              disabled={couponLoading}
              className="font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {couponLoading ? "Removing..." : "Remove"}
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={(event) => {
            event.preventDefault();

            const code = couponCode.trim().toUpperCase();

            if (code && !couponLoading) {
              void onApplyCoupon(code);
            }
          }}
          className="flex gap-2"
        >
          <input
            value={couponCode}
            onChange={(event) => setCouponCode(event.target.value)}
            placeholder="Enter coupon code"
            disabled={couponLoading}
            className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-orange-500 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!couponCode.trim() || couponLoading}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {couponLoading ? "Applying..." : "Apply"}
          </button>
        </form>
      )}

      {couponError && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {couponError}
        </p>
      )}
    </div>
  );
}
