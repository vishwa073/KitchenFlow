
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Sparkles,
  UtensilsCrossed,
} from "lucide-react";
import heroImage from "../../../assets/hero.png";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute -right-32 -top-24 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-32 h-80 w-80 rounded-full bg-amber-100/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-semibold text-orange-700 sm:text-sm">
            <Sparkles size={15} />
            Hyderabad's flavors, made easy
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Your favorite flavors,
            <span className="block text-orange-600">
              flow effortlessly.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">
            Discover Hyderabad outlets, order your favorites, and track your
            meal—all in one simple experience.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/outlets"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
            >
              Explore Hyderabad outlets
              <ArrowRight size={17} />
            </Link>

            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-xl border border-stone-200 bg-white/80 px-6 py-3.5 text-sm font-semibold text-stone-700 transition hover:bg-white"
            >
              How it works
            </a>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-sm text-stone-500">
            <span className="flex items-center gap-2">
              <MapPin size={16} className="text-orange-600" />
              Hyderabad outlets
            </span>

            <span className="flex items-center gap-2">
              <Clock3 size={16} className="text-orange-600" />
              Easy order tracking
            </span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-4 rounded-[2rem] bg-orange-100/70 blur-2xl" />

          <div className="relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white p-3 shadow-2xl shadow-stone-900/10">
            <img
              src={heroImage}
              alt="A delicious Hyderabadi meal ready to be enjoyed"
              className="h-[300px] w-full rounded-[1.25rem] object-cover sm:h-[420px]"
            />

            <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/70 bg-white/95 p-4 shadow-lg backdrop-blur sm:bottom-8 sm:left-8 sm:right-8 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-stone-500">
                    Your next favorite meal
                  </p>

                  <p className="mt-1 text-base font-bold text-stone-900 sm:text-lg">
                    Just a few taps away
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <UtensilsCrossed size={21} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
