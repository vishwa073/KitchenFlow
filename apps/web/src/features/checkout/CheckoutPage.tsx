import { useCheckout } from "../../hooks/useCheckout";

import CheckoutHeader from "./components/CheckoutHeader";
import DeliveryAddressForm from "./components/DeliveryAddressForm";
import MockPaymentForm from "./components/MockPaymentForm";
import OrderSummary from "./components/OrderSummary";
import EmptyCheckout from "./components/EmptyCheckout";

export default function CheckoutPage() {
  const checkout = useCheckout();

  if (!checkout.cart || checkout.cart.items.length === 0) {
    return <EmptyCheckout />;
  }

  async function handleMockPay() {
    await checkout.handlePlaceOrder();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <section className="space-y-6 lg:col-span-2">
            <DeliveryAddressForm
              addresses={checkout.addresses}
              selectedAddressId={checkout.selectedAddressId}
              setSelectedAddressId={checkout.setSelectedAddressId}
              isLoadingAddresses={checkout.isLoadingAddresses}
            />

            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Redeem loyalty points
              </h2>

              <p className="mb-4 text-sm text-gray-500">
                1 loyalty point = ₹1. Redeemed points will reduce your order
                total.
              </p>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-orange-50 p-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Available loyalty points
                  </p>
                  <p className="text-xl font-bold text-orange-700">
                    {checkout.isLoadingLoyalty
                      ? "Loading..."
                      : `${checkout.availableLoyaltyPoints} points`}
                  </p>
                  <p className="text-sm text-gray-500">
                    Worth ₹{checkout.availableLoyaltyPoints}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={checkout.handleUseAllLoyaltyPoints}
                  disabled={
                    checkout.isLoadingLoyalty ||
                    checkout.availableLoyaltyPoints === 0
                  }
                  className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use all points
                </button>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={Math.min(
                    checkout.availableLoyaltyPoints,
                    Math.floor(checkout.totalBeforeLoyalty),
                  )}
                  step={1}
                  value={checkout.redeemPoints}
                  onChange={(e) =>
                    checkout.setRedeemPoints(
                      Math.min(
                        Math.max(0, Math.floor(Number(e.target.value) || 0)),
                        checkout.availableLoyaltyPoints,
                        Math.floor(checkout.totalBeforeLoyalty),
                      ),
                    )
                  }
                  disabled={checkout.isLoadingLoyalty}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-orange-500 disabled:bg-gray-100"
                  placeholder="Points to redeem"
                />

                <button
                  type="button"
                  onClick={() => checkout.setRedeemPoints(0)}
                  className="rounded-xl border px-4 py-3 text-sm font-medium hover:bg-gray-50"
                >
                  Clear
                </button>
              </div>

              {checkout.redeemPoints > 0 && (
                <p className="mt-3 text-sm font-medium text-green-700">
                  ₹{checkout.effectiveRedeemPoints} discount applied
                </p>
              )}
            </section>

            <section className="rounded-2xl border bg-white p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Choose payment method
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {(["UPI", "CARD"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => checkout.setPaymentMethod(method)}
                    className={`rounded-xl border p-4 text-left font-medium transition ${
                      checkout.paymentMethod === method
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {method === "UPI" ? "UPI" : "Credit / Debit Card"}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <MockPaymentForm
                  paymentMethod={checkout.paymentMethod}
                  total={checkout.total}
                  isSubmitting={checkout.isSubmitting}
                  onPay={handleMockPay}
                />
              </div>
            </section>
          </section>

          <OrderSummary
            cart={checkout.cart}
            subtotal={checkout.subtotal}
            discount={checkout.couponDiscount}
            appliedCoupon={checkout.appliedCoupon?.code}
            onApplyCoupon={checkout.handleApplyCoupon}
            onRemoveCoupon={checkout.handleRemoveCoupon}
            couponLoading={checkout.couponLoading}
            couponError={checkout.couponError}
            deliveryFee={checkout.deliveryFee}
            taxes={checkout.taxes}
            total={checkout.total}
            error={checkout.error}
            isSubmitting={checkout.isSubmitting}
            loyaltyDiscount={checkout.loyaltyDiscount}
            loyaltyPointsRedeemed={checkout.effectiveRedeemPoints}
          />
        </div>
      </main>
    </div>
  );
}
