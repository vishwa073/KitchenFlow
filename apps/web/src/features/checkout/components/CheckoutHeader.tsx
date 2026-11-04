import { Link } from "react-router-dom";

export default function CheckoutHeader() {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-bold text-orange-600">
          KitchenFlow
        </Link>

        <div className="text-sm font-medium text-gray-600">
          Checkout
        </div>

        <Link
          to="/cart"
          className="text-sm font-medium text-gray-600 hover:text-orange-600"
        >
          Back to cart
        </Link>
      </div>
    </header>
  );
}