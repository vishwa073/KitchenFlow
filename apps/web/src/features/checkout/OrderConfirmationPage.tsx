
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2, Clock, ShoppingBag } from "lucide-react";

export default function OrderConfirmationPage() {
  const location = useLocation();

  const order = location.state?.order;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4] px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={44} />
        </div>

        <p className="mt-6 text-sm font-semibold tracking-widest text-orange-600">
          KITCHENFLOW
        </p>

        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Order placed!
        </h1>

        <p className="mt-3 leading-6 text-gray-500">
          Thank you for ordering with us. Your delicious food is being prepared.
        </p>

        {order && (
          <div className="mt-7 rounded-2xl bg-gray-50 p-5 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Customer</span>
              <span className="font-semibold text-gray-900">
                {order.customerName}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Payment</span>
              <span className="font-semibold capitalize text-gray-900">
                {order.paymentMethod}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Order total</span>
              <span className="text-lg font-bold text-gray-900">
                ₹{order.total.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-500">Delivering to</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {order.address}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-orange-50 p-4 text-sm text-orange-700">
          <Clock size={18} />
          Estimated preparation time will be shown once the order is accepted.
        </div>

        <Link
          to="/outlets"
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600"
        >
          <ShoppingBag size={18} />
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
