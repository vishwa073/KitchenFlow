
import { useMemo, useState } from "react";
import { ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { outlets as outletData } from "./data/outlets";
import { getServiceableOutlets } from "./utils/serviceability";
import type { Outlet, OutletCategory } from "./types/outlet";
import type { CustomerLocation } from "./types/customerLocation";

import OutletSearch from "./components/OutletSearch";
import OutletGrid from "./components/OutletGrid";
import LocationSelector from "./components/LocationSelector";

export default function OutletPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<OutletCategory>("All");
  const [selectedOutlet, setSelectedOutlet] = useState<Outlet | null>(null);
  const [selectedLocation, setSelectedLocation] =
    useState<CustomerLocation | null>(null);

  const navigate = useNavigate();

  const serviceableOutlets = useMemo(() => {
    if (!selectedLocation) {
      return outletData;
    }

    return getServiceableOutlets(outletData, {
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
    });
  }, [selectedLocation]);

  const filteredOutlets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return serviceableOutlets.filter((outlet) => {
      const matchesCategory =
        category === "All" || outlet.category === category;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        outlet.name.toLowerCase().includes(normalizedSearch) ||
        outlet.category.toLowerCase().includes(normalizedSearch) ||
        outlet.description.toLowerCase().includes(normalizedSearch) ||
        outlet.tags.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch)
        );

      return matchesCategory && matchesSearch;
    });
  }, [serviceableOutlets, search, category]);

  const availableCount = filteredOutlets.filter(
    (outlet) => outlet.isAvailable
  ).length;

  function handleSelectOutlet(outlet: Outlet) {
    if (!outlet.isAvailable) return;

    setSelectedOutlet(outlet);
  }

  function handleLocationSelect(location: CustomerLocation) {
    setSelectedLocation(location);
    setSelectedOutlet(null);
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 font-bold text-white">
              K
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight">
                KitchenFlow
              </h1>
              <p className="text-xs text-stone-500">
                Hyderabad food, simplified
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
            <MapPin size={16} />
            <span>
              {selectedLocation?.label ?? "Choose delivery location"}
            </span>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
            Hyderabad food
          </p>

          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            What are you craving today?
          </h2>

          <p className="mt-3 text-base leading-7 text-stone-500">
            Discover Hyderabad outlets, explore their menus, and order your
            favorites.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
          <LocationSelector
            selectedLocation={selectedLocation}
            onSelect={handleLocationSelect}
          />

          {selectedLocation && (
            <p className="mt-3 text-sm text-stone-500">
              Showing outlets that deliver to {selectedLocation.label}.
            </p>
          )}
        </div>

        <OutletSearch
          search={search}
          category={category}
          onSearchChange={setSearch}
          onCategoryChange={setCategory}
        />

        <div className="mb-5 mt-8 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Explore outlets</h3>

            <p className="mt-1 text-sm text-stone-500">
              {availableCount} available
              {filteredOutlets.length !== availableCount
                ? ` · ${filteredOutlets.length} total matching`
                : ""}
            </p>
          </div>
        </div>

        {selectedLocation && filteredOutlets.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <MapPin
              className="mx-auto mb-3 text-orange-600"
              size={28}
            />

            <h4 className="text-lg font-semibold">
              No outlets deliver to this location
            </h4>

            <p className="mt-2 text-sm text-stone-500">
              Try another Hyderabad area to find available outlets.
            </p>
          </div>
        ) : (
          <OutletGrid
            outlets={filteredOutlets}
            onSelectOutlet={handleSelectOutlet}
          />
        )}
      </section>

      {selectedOutlet && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-stone-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-stone-500">Selected outlet</p>
              <p className="truncate font-semibold">
                {selectedOutlet.name}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate(`/outlets/${selectedOutlet.id}/menu`);
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              View menu
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
