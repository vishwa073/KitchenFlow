
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { useCart } from "./context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();

  const {
    cart,
    cartCount,
    subtotal,
    updateQuantity,
    removeItem,
  } = useCart();

  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 40;
  const taxes = subtotal * 0.05;
  const total = subtotal + deliveryFee + taxes;

  const formatPrice = (price: number) =>
    `₹${price.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;

  const handleCheckout = () => {
    if (cart.items.length === 0) return;

    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4]">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
          <Link
            to="/outlets"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-orange-600"
          >
            <ArrowLeft size={18} />
            Continue shopping
          </Link>

          <h1 className="text-xl font-bold text-gray-900">Your Cart</h1>

          <div className="w-28" />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-orange-600">KITCHENFLOW</p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
            Your delicious picks
          </h2>

          <p className="mt-2 text-gray-500">
            Review your items before placing your order.
          </p>
        </div>

        {cart.items.length === 0 ? (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white px-6 text-center shadow-sm">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-50 text-orange-500">
              <ShoppingBag size={36} />
            </div>

            <h3 className="text-xl font-bold text-gray-900">
              Your cart is empty
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
              Looks like you haven't added anything yet. Explore the menu and
              find something delicious.
            </p>

            <Link
              to="/outlets"
              className="mt-6 rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white transition hover:bg-orange-600"
            >
              Explore outlets
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Cart items
                </h3>

                <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">
                  {cartCount} items
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.items.map(({ menuItem, quantity }) => (
                  <article
                    key={menuItem.id}
                    className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center"
                  >
                    <img
                      src={menuItem.image}
                      alt={menuItem.name}
                      className="h-24 w-full rounded-2xl object-cover sm:w-28"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {menuItem.name}
                      </h4>

                      <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                        {menuItem.description}
                      </p>

                      <p className="mt-2 font-bold text-gray-900">
                        {formatPrice(menuItem.price)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-2 py-1.5">
                        <button
                          aria-label={`Decrease quantity of ${menuItem.name}`}
                          onClick={() =>
                            updateQuantity(menuItem.id, quantity - 1)
                          }
                          className="rounded-lg p-1 text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Minus size={16} />
                        </button>

                        <span className="min-w-5 text-center text-sm font-semibold">
                          {quantity}
                        </span>

                        <button
                          aria-label={`Increase quantity of ${menuItem.name}`}
                          onClick={() =>
                            updateQuantity(menuItem.id, quantity + 1)
                          }
                          className="rounded-lg p-1 text-gray-600 transition hover:bg-orange-50 hover:text-orange-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <p className="font-bold text-gray-900">
                        {formatPrice(menuItem.price * quantity)}
                      </p>

                      <button
                        onClick={() => removeItem(menuItem.id)}
                        className="flex items-center gap-1 text-xs font-medium text-gray-400 transition hover:text-red-500"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="h-fit rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900">
                Order summary
              </h3>

              <div className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span>
                    {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Estimated taxes (5%)</span>
                  <span>{formatPrice(taxes)}</span>
                </div>

                {subtotal > 0 && subtotal < 499 && (
                  <p className="rounded-xl bg-orange-50 p-3 text-xs leading-5 text-orange-700">
                    Add {formatPrice(499 - subtotal)} more to get free delivery.
                  </p>
                )}
              </div>

              <div className="my-5 border-t border-dashed border-gray-200" />

              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-900">Total</span>

                <span className="text-2xl font-bold text-gray-900">
                  {formatPrice(total)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3.5 font-semibold text-white transition hover:bg-orange-600"
              >
                Proceed to checkout
                <ArrowLeft className="rotate-180" size={18} />
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-gray-400">
                Taxes and delivery charges are estimates for this prototype.
              </p>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
