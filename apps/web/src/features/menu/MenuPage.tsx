import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useApi } from "../../lib/api";
import { fetchOutlets } from "../outlets/api/outlet.api";
import type { Outlet } from "../outlets/types/outlet";

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

  const { apiFetch } = useApi();
  const apiFetchRef = useRef(apiFetch);

  const [outlet, setOutlet] = useState<Outlet | null>(null);
  const [outletLoading, setOutletLoading] = useState(true);
  const [outletError, setOutletError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadOutlet() {
      if (!outletId) {
        setOutlet(null);
        setOutletError("No outlet was selected.");
        setOutletLoading(false);
        return;
      }

      try {
        setOutletLoading(true);
        setOutletError("");

        const allOutlets = await fetchOutlets(apiFetchRef.current);
        const selectedOutlet = allOutlets.find((item) => item.id === outletId);

        if (!selectedOutlet) {
          throw new Error("This outlet could not be found.");
        }

        if (isMounted) {
          setOutlet(selectedOutlet);
        }
      } catch (error) {
        if (isMounted) {
          setOutlet(null);
          setOutletError(
            error instanceof Error
              ? error.message
              : "Unable to load outlet details.",
          );
        }
      } finally {
        if (isMounted) {
          setOutletLoading(false);
        }
      }
    }

    void loadOutlet();

    return () => {
      isMounted = false;
    };
  }, [outletId]);

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

  if (outletLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="font-medium text-gray-600">Loading outlet...</p>
      </div>
    );
  }

  if (outletError || !outlet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <p className="text-lg font-semibold text-gray-800">
          {outletError || "Outlet not found."}
        </p>

        <button
          type="button"
          onClick={() => navigate("/outlets")}
          className="rounded-xl bg-orange-600 px-4 py-2.5 font-semibold text-white hover:bg-orange-700"
        >
          Back to outlets
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MenuHeader
        outletName={outlet.name}
        servingArea={outlet.area}
        cartCount={cartCount}
        onCartClick={() => navigate("/cart")}
      />

      <main
        className={`mx-auto max-w-7xl px-4 py-6 sm:py-8 ${
          cartCount > 0 ? "pb-28 sm:pb-32" : "pb-8"
        }`}
      >
        <button
          type="button"
          onClick={() => navigate(`/customer/${outletId}`)}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Back to outlets
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Our Menu
          </h2>

          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Freshly prepared favorites from {outlet.name}.
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
            <p className="font-medium text-gray-600">Loading menu...</p>
          </div>
        ) : error ? (
          <MenuEmptyState title="Unable to load menu" message={error} />
        ) : filteredItems.length === 0 ? (
          <MenuEmptyState />
        ) : (
          <MenuGrid items={filteredItems} onAddToCart={addItem} />
        )}
      </main>

      <StickyCartBar />
    </div>
  );
}
