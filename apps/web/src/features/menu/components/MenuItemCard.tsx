
import { useRef, useState } from "react";
import { useAuth, useClerk } from "@clerk/react";
import type { MenuAddon, MenuItem, MenuVariant } from "../types/menu";

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (
    item: MenuItem,
    variant: MenuVariant,
    addons: MenuAddon[],
  ) => void | Promise<void>;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { redirectToSignIn } = useClerk();

  const [selectedVariantId, setSelectedVariantId] = useState(
    item.variants[0]?.id ?? "",
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const addLock = useRef(false);

  const selectedVariant =
    item.variants.find((variant) => variant.id === selectedVariantId) ??
    item.variants[0];

  const selectedAddons = item.addons.filter((addon) =>
    selectedAddonIds.includes(addon.id),
  );

  const missingRequiredAddons = item.addons.some(
    (addon) => addon.isRequired && !selectedAddonIds.includes(addon.id),
  );

  const handleAddonToggle = (addon: MenuAddon) => {
    if (!addon.isAvailable || isAdding) return;

    setSelectedAddonIds((current) => {
      const isSelected = current.includes(addon.id);

      if (isSelected) {
        return current.filter((id) => id !== addon.id);
      }

      return [...current, addon.id];
    });
  };

  const handleAddToCart = async () => {
    console.log("Add to Cart clicked", {
      isLoaded,
      isSignedIn,
      itemAvailable: item.isAvailable,
      selectedVariant,
      selectedAddons,
      isAdding,
    });

    if (!isLoaded) {
      console.log("Clerk is not loaded yet");
      return;
    }

    if (
      !selectedVariant ||
      !item.isAvailable ||
      missingRequiredAddons ||
      addLock.current
    ) {
      console.log("Add to Cart blocked by item, required addon, or lock state");
      return;
    }

    // Guest users must sign in before adding items to the cart.
    if (!isSignedIn) {
      console.log("Guest detected. Triggering Clerk sign-in.");

      redirectToSignIn({
        signInForceRedirectUrl: "/onboarding",
        signUpForceRedirectUrl: "/onboarding",
      });

      return;
    }

    // Keep the existing add-to-cart behavior for signed-in customers.
    addLock.current = true;
    setIsAdding(true);

    try {
      await onAddToCart(item, selectedVariant, selectedAddons);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    } finally {
      addLock.current = false;
      setIsAdding(false);
    }
  };

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

              <h3 className="font-semibold text-gray-900">{item.name}</h3>
            </div>

            <p className="text-sm text-gray-500">{item.category}</p>
          </div>

          <p className="shrink-0 whitespace-nowrap font-bold text-gray-900">
            ₹{selectedVariant?.price ?? item.price}
          </p>
        </div>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm text-gray-600">
          {item.description}
        </p>

        {item.variants.length > 1 && (
          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-gray-700">
              Choose variant
            </span>

            <select
              value={selectedVariantId}
              onChange={(event) => setSelectedVariantId(event.target.value)}
              disabled={isAdding}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              {item.variants.map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} — ₹{variant.price}
                </option>
              ))}
            </select>
          </label>
        )}

        {item.addons.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              Add-ons
            </p>

            <div className="space-y-2">
              {item.addons.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border border-gray-200 px-3 py-2 ${
                    addon.isAvailable
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-50"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedAddonIds.includes(addon.id)}
                      onChange={() => handleAddonToggle(addon)}
                      disabled={isAdding || !addon.isAvailable}
                      className="accent-orange-500"
                    />

                    <span className="text-sm text-gray-700">
                      {addon.name}

                      {addon.isRequired && (
                        <span className="ml-1 text-xs text-red-500">
                          Required
                        </span>
                      )}
                    </span>
                  </span>

                  <span className="whitespace-nowrap text-sm font-medium text-gray-800">
                    +₹{addon.price}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={
            !isLoaded ||
            !item.isAvailable ||
            !selectedVariant ||
            isAdding ||
            missingRequiredAddons
          }
          onClick={handleAddToCart}
          className="w-full rounded-lg bg-orange-500 py-2.5 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {!item.isAvailable
            ? "Unavailable"
            : isAdding
              ? "Adding…"
              : !isLoaded
                ? "Loading…"
                : missingRequiredAddons
                  ? "Select required add-ons"
                  : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
