import { useParams, useNavigate } from "react-router-dom";

import { outlets } from "../outlets/data/outlets";
import { useCart } from "../cart/context/CartContext";
import { useMenu } from "../../hooks/useMenu";

import MenuHeader from "./components/MenuHeader";
import MenuToolbar from "./components/MenuToolbar";
import MenuGrid from "./components/MenuGrid";
import MenuEmptyState from "./components/MenuEmptyState";
import StickyCartBar from "./components/StickyCartBar";

export default function MenuPage() {
  const { outletId } = useParams<{ outletId: string }>();
  const navigate = useNavigate();

  const outlet = outlets.find((item) => item.id === outletId);

  const {
    filteredItems,
    categories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
  } = useMenu(outletId);

  const { addItem, cartCount } = useCart();

  if (!outlet) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Outlet not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader
        outletName={outlet.name}
        servingArea={outlet.servingArea}
        cartCount={cartCount}
        onCartClick={() => navigate("/cart")}
      />

      <main
        className={`mx-auto max-w-7xl px-4 py-6 sm:py-8 ${
          cartCount > 0 ? "pb-28 sm:pb-32" : "pb-8"
        }`}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Our Menu
          </h2>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Freshly prepared favorites from your selected outlet.
          </p>
        </div>

        <MenuToolbar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          search={search}
          onSearchChange={setSearch}
        />

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center">
            <p className="font-medium text-gray-600">
              Loading menu...
            </p>
          </div>
        ) : error ? (
          <MenuEmptyState
            title="Unable to load menu"
            message={error}
          />
        ) : filteredItems.length === 0 ? (
          <MenuEmptyState />
        ) : (
          <MenuGrid
            items={filteredItems}
            onAddToCart={addItem}
          />
        )}
      </main>

      <StickyCartBar />
    </div>
  );
}