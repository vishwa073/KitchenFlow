import { Link } from "react-router-dom";
import { UtensilsCrossed } from "lucide-react";
import AuthActions from "../../auth/components/AuthActions";
export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/70 bg-[#faf8f5]/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
            <UtensilsCrossed size={20} />
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-stone-900">
              KitchenFlow
            </p>
            <p className="text-[11px] tracking-wide text-stone-500">
              Hyderabadi food, made easy
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-stone-600 transition hover:text-orange-600"
          >
            How it works
          </a>

          <Link
            to="/outlets"
            className="text-sm font-medium text-stone-600 transition hover:text-orange-600"
          >
            Explore outlets
          </Link>
        </div>

        <AuthActions />
      </nav>
    </header>
  );
}
