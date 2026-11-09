import { Link } from "react-router-dom";
import { ShoppingBag } from "lucide-react";
import { useCart } from "../../cart/context/CartContext";

export default function EmptyCheckout() {
  const { cart } = useCart();
  const outletId = cart.outletId;

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <ShoppingBag className="mb-4 h-12 w-12 text-gray-400" />

      <h2 className="text-xl font-semibold">Your cart is empty</h2>

      <p className="mt-2 text-sm text-gray-500">
        Add some delicious items to continue with checkout.
      </p>

      <Link
        to={outletId ? `/outlets/${outletId}/menu` : "/outlets"}
        className="mt-6 rounded-lg bg-orange-500 px-5 py-3 font-medium text-white hover:bg-orange-600"
      >
        Explore menu
      </Link>
    </div>
  );
}