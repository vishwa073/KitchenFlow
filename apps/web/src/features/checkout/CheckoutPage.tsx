import { useCheckout } from "../../hooks/useCheckout";

import CheckoutHeader from "./components/CheckoutHeader";
import DeliveryAddressForm from "./components/DeliveryAddressForm";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import OrderSummary from "./components/OrderSummary";
import EmptyCheckout from "./components/EmptyCheckout";

export default function CheckoutPage() {
  const checkout = useCheckout();

  if (!checkout.cart || checkout.cart.items.length === 0) {
    return <EmptyCheckout />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CheckoutHeader />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <form
          onSubmit={checkout.handlePlaceOrder}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <DeliveryAddressForm
              customerName={checkout.customerName}
              setCustomerName={checkout.setCustomerName}
              phone={checkout.phone}
              setPhone={checkout.setPhone}
              address={checkout.address}
              setAddress={checkout.setAddress}
              landmark={checkout.landmark}
              setLandmark={checkout.setLandmark}
            />

            <PaymentMethodSelector
              paymentMethod={checkout.paymentMethod}
              setPaymentMethod={checkout.setPaymentMethod}
            />
          </div>

          <OrderSummary
            cart={checkout.cart}
            subtotal={checkout.subtotal}
            deliveryFee={checkout.deliveryFee}
            taxes={checkout.taxes}
            total={checkout.total}
            error={checkout.error}
            isSubmitting={checkout.isSubmitting}
          />
        </form>
      </main>
    </div>
  );
}