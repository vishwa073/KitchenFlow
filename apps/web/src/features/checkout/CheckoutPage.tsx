
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
          />
        </div>
      </main>
    </div>
  );
}
