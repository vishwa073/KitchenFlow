import { ShoppingCart } from "lucide-react";

interface MenuHeaderProps {
  outletName: string;
  servingArea: string;
  cartCount: number;
  onCartClick: () => void;
}

export default function MenuHeader({
  outletName,
  servingArea,
  cartCount,
  onCartClick,
}: MenuHeaderProps) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">KitchenFlow / Menu</p>
          <h1 className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
            {outletName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{servingArea}</p>
        </div>

        <button
          type="button"
          onClick={onCartClick}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 sm:px-4"
        >
          <ShoppingCart size={18} />
          Cart ({cartCount})
        </button>
      </div>
    </header>
  );
}