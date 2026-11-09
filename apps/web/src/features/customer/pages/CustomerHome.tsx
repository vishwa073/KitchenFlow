
import { Link, Navigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ClipboardList,
  MapPin,
  PartyPopper,
  Utensils,
} from "lucide-react";

import CustomerSection from "../components/CustomerSection";

export default function CustomerHome() {
  const { outletId } = useParams<{ outletId: string }>();

  if (!outletId) {
    return <Navigate to="/outlets" replace />;
  }

  const customerHome = `/customer/${outletId}`;
  const menuPath = `/outlets/${outletId}/menu`;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-6 sm:py-8">
      {/* Welcome / primary menu action */}
      <section className="relative isolate overflow-hidden rounded-3xl bg-stone-900 px-6 py-8 text-white sm:px-10 sm:py-10">
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-orange-500/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-amber-400/10 blur-3xl"
        />

        <div className="relative max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-orange-200">
            <Utensils size={14} />
            KITCHENFLOW
          </p>

          <h1 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
            Good food, made easy.
          </h1>

          <p className="mt-3 max-w-lg text-sm leading-6 text-stone-300 sm:text-base">
            Explore the menu, place your order, and let us take care of the
            rest.
          </p>

          <Link
            to={menuPath}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500"
          >
            Browse menu
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Customer shortcuts */}
      <CustomerSection
        title="What would you like to do?"
        description="Your KitchenFlow shortcuts, all in one place."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to={menuPath}
            className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Utensils size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-stone-900">
              Explore menu
            </h2>

            <p className="mt-1 text-sm leading-5 text-stone-500">
              Find something delicious to order.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
              View menu <ArrowRight size={15} />
            </span>
          </Link>

          <Link
            to={`${customerHome}/orders`}
            state={{ returnTo: customerHome }}
            className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ClipboardList size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-stone-900">
              Your orders
            </h2>

            <p className="mt-1 text-sm leading-5 text-stone-500">
              Check order status and revisit past orders.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
              View orders <ArrowRight size={15} />
            </span>
          </Link>

          <Link
            to={`${customerHome}/party`}
            className="group rounded-2xl border border-stone-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <PartyPopper size={21} />
            </div>

            <h2 className="mt-4 font-semibold text-stone-900">
              Party catering
            </h2>

            <p className="mt-1 text-sm leading-5 text-stone-500">
              Plan food for a gathering or celebration.
            </p>

            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange-600">
              Plan catering <ArrowRight size={15} />
            </span>
          </Link>
        </div>
      </CustomerSection>

      {/* Delivery address shortcut */}
      <section className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600">
            <MapPin size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-stone-900">
              Delivery details
            </h2>

            <p className="mt-1 text-sm text-stone-500">
              Check or update your saved delivery address.
            </p>
          </div>
        </div>

        <Link
          to={`${customerHome}/profile`}
          state={{ returnTo: customerHome }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
        >
          Manage address
          <ArrowRight size={16} />
        </Link>
      </section>
    </div>
  );
}
