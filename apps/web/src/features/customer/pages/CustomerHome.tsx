import { Link } from "react-router-dom";
import { UtensilsCrossed, UserRound } from "lucide-react";

interface CustomerHeaderProps {
  outletId: string;
}

export default function CustomerHeader({
  outletId,
}: CustomerHeaderProps) {
  const customerHome = `/customer/${outletId}`;

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to={customerHome} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white">
            <UtensilsCrossed size={20} />
          </div>

          <div>
            <p className="font-bold text-stone-900">KitchenFlow</p>
            <p className="text-xs text-stone-500">
              Your food, your way
            </p>
          </div>
        </Link>

        <Link
          to={`${customerHome}/profile`}
          state={{ returnTo: customerHome }}
          aria-label="Profile"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200"
        >
          <UserRound size={20} />
        </Link>
      </div>
    </header>
  );
}