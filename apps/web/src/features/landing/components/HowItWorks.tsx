
import { Link } from "react-router-dom";
import { ArrowRight, ShoppingBag, Store, Truck } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore Hyderabad outlets and find your favorite biryani and local flavors.",
    icon: Store,
  },
  {
    number: "02",
    title: "Order",
    description:
      "Choose your favorite dishes, add them to your cart, and place your order.",
    icon: ShoppingBag,
  },
  {
    number: "03",
    title: "Enjoy",
    description:
      "Track your order as the kitchen prepares your meal, then enjoy it when it's ready.",
    icon: Truck,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
            Simple by design
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
            Good food. Fewer steps.
          </h2>

          <p className="mt-4 leading-7 text-stone-500">
            From discovering an outlet to tracking your order, KitchenFlow
            makes enjoying Hyderabad's favorite flavors simple.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map(({ number, title, description, icon: Icon }) => (
            <article
              key={number}
              className="rounded-2xl border border-stone-200 bg-[#faf8f5] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold tracking-widest text-orange-600">
                  {number}
                </span>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Icon size={22} />
                </div>
              </div>

              <h3 className="mt-7 text-xl font-bold text-stone-900">
                {title}
              </h3>

              <p className="mt-3 leading-7 text-stone-600">{description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/outlets"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-700"
          >
            Explore Hyderabad outlets
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
