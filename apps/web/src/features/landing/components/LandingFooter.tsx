import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-stone-200 bg-[#faf8f5]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white">
            <UtensilsCrossed size={18} />
          </div>

          <span className="font-bold text-stone-900">KitchenFlow</span>
        </Link>

        <p className="text-sm text-stone-500">
          Hydrabad food, made simple.
        </p>

        <Link
          to="/outlets"
          className="text-sm font-semibold text-stone-600 transition hover:text-orange-600"
        >
          Explore outlets
        </Link>
      </div>
    </footer>
  );
}