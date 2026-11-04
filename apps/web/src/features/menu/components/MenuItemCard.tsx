import type { MenuItem } from "../types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuItemCard({
  item,
  onAddToCart,
}: MenuItemCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className="h-48 w-full object-cover sm:h-52"
        />

        {item.isPopular && (
          <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-600 shadow">
            Popular
          </span>
        )}

        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-800">
              Currently unavailable
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                aria-label={item.isVegetarian ? "Vegetarian" : "Non-vegetarian"}
                className={`flex h-3 w-3 shrink-0 items-center justify-center rounded-sm border ${
                  item.isVegetarian ? "border-green-600" : "border-red-600"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    item.isVegetarian ? "bg-green-600" : "bg-red-600"
                  }`}
                />
              </span>

              <h3 className="font-semibold text-gray-900">
                {item.name}
              </h3>
            </div>

            <p className="text-sm text-gray-500">{item.category}</p>
          </div>

          <p className="shrink-0 whitespace-nowrap font-bold text-gray-900">
            ₹{item.price}
          </p>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm text-gray-600">
          {item.description}
        </p>

        <button
          type="button"
          disabled={!item.isAvailable}
          onClick={() => onAddToCart(item)}
          className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {item.isAvailable ? "Add to cart" : "Unavailable"}
        </button>
      </div>
    </article>
  );
}