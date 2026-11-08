import { ShoppingCart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../cart/context/CartContext";

export default function StickyCartBar() {
  const navigate = useNavigate();
  const { cartCount, subtotal } = useCart();

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 border-t border-gray-200 bg-white/95 p-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
            <ShoppingCart size={22} />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-gray-900">
              {cartCount} {cartCount === 1 ? "item" : "items"} in cart
            </p>

            <p className="text-sm text-gray-500">
              Subtotal · ₹{subtotal.toFixed(2)}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600"
        >
          <span>View Cart</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}