import { Link } from "react-router-dom";
import { useOrders } from "../../hooks/useOrders";
import OrderCard from "./components/OrderCard";

export default function OrdersPage() {
  const { orders, isLoading, error, refreshOrders } = useOrders();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              My orders
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View and track your orders.
            </p>
          </div>

          <Link to="/" className="text-sm font-medium text-orange-600">
            Home
          </Link>
        </div>

        {isLoading && (
          <p className="text-gray-500">Loading orders...</p>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-red-600">
            <p>{error}</p>
            <button
              onClick={refreshOrders}
              className="mt-2 font-medium underline"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !error && orders.length === 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center">
            <h2 className="font-semibold">No orders yet</h2>
            <p className="mt-2 text-sm text-gray-500">
              Your placed orders will appear here.
            </p>
            <Link
              to="/outlets"
              className="mt-4 inline-block text-orange-600"
            >
              Browse outlets
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </main>
  );
}