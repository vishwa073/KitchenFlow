import { Link } from "react-router-dom";

export default function EmptyCheckout() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-2xl border bg-white p-8 text-center">
        <div className="mb-4 text-5xl">🛒</div>

        <h1 className="text-xl font-semibold text-gray-900">
          Your cart is empty
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          Add some delicious food before proceeding to checkout.
        </p>

        <Link
          to="/outlets"
          className="mt-6 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
        >
          Explore outlets
        </Link>
      </div>
    </main>
  );
}