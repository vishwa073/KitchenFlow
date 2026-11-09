import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useApi } from "../../lib/api";
import {
  checkOutletServiceability,
  fetchOutlets,
  type ServiceabilityResponse,
} from "./api/outlet.api";

import type { Outlet, OutletCategory } from "./types/outlet";
import type { Coordinates } from "../onboarding/components/LocationPicker";

import OutletSearch from "./components/OutletSearch";
import OutletGrid from "./components/OutletGrid";
import LocationSelector from "./components/LocationSelector";

export default function OutletPage() {
  const { apiFetch } = useApi();
  const apiFetchRef = useRef(apiFetch);

  const [outletData, setOutletData] = useState<Outlet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [serviceability, setServiceability] =
    useState<ServiceabilityResponse | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [serviceabilityError, setServiceabilityError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<OutletCategory>("All");

  const navigate = useNavigate();

  // Load active outlets from the backend.
  useEffect(() => {
    let isMounted = true;

    async function loadOutlets() {
      try {
        setIsLoading(true);
        setLoadError("");

        const outlets = await fetchOutlets(apiFetchRef.current);

        if (isMounted) {
          setOutletData(outlets);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(
            error instanceof Error ? error.message : "Unable to load outlets.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOutlets();

    return () => {
      isMounted = false;
    };
  }, []);

  // Reset the previous result when the map location changes.
  function handleLocationChange(nextCoordinates: Coordinates) {
    setCoordinates(nextCoordinates);
    setServiceability(null);
    setServiceabilityError("");
  }

  // Check delivery using the backend serviceability endpoint.
  async function handleCheckDelivery() {
    if (!coordinates) return;

    try {
      setIsChecking(true);
      setServiceabilityError("");
      setServiceability(null);

      const result = await checkOutletServiceability(
        apiFetchRef.current,
        coordinates,
      );

      setServiceability(result);
    } catch (error) {
      setServiceabilityError(
        error instanceof Error
          ? error.message
          : "Unable to check delivery availability.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  // Only apply the backend's serviceable outlet IDs after a check.
  const serviceableOutlets = useMemo(() => {
    if (!serviceability) {
      return outletData;
    }

    const serviceableIds = new Set(
      serviceability.outlets.map((outlet) => outlet.id),
    );

    return outletData.filter((outlet) => serviceableIds.has(outlet.id));
  }, [outletData, serviceability]);

  const filteredOutlets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return serviceableOutlets.filter((outlet) => {
      const matchesCategory =
        category === "All" || outlet.category === category;

      const matchesSearch =
        !normalizedSearch ||
        outlet.name.toLowerCase().includes(normalizedSearch) ||
        outlet.category?.toLowerCase().includes(normalizedSearch) ||
        outlet.description?.toLowerCase().includes(normalizedSearch) ||
        outlet.tags?.some((tag) =>
          tag.toLowerCase().includes(normalizedSearch),
        );

      return matchesCategory && matchesSearch;
    });
  }, [serviceableOutlets, search, category]);


  function handleSelectOutlet(outlet: Outlet) {
    const isAvailable = outlet.isAvailable ?? outlet.isActive;

    if (!isAvailable) return;

    navigate(`/outlets/${outlet.id}/menu`);
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
              <h1 className="text-lg font-bold tracking-tight">KitchenFlow</h1>
              <p className="text-xs text-stone-500">
                Hyderabad food, simplified
              </p>
            </div>
          </a>

          <div className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
            <MapPin size={16} />
            <span>
              {coordinates
                ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                : "Choose delivery location"}
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
            value={coordinates}
            onChange={handleLocationChange}
            onCheck={handleCheckDelivery}
            isChecking={isChecking}
          />

          {serviceability && (
            <p
              className={`mt-3 text-sm font-medium ${
                serviceability.serviceable ? "text-green-700" : "text-amber-700"
              }`}
            >
              {serviceability.serviceable
                ? `${serviceability.count} outlet(s) deliver to this location.`
                : "No outlets currently deliver to this location."}
            </p>
          )}

          {serviceabilityError && (
            <p className="mt-3 text-sm text-red-600">{serviceabilityError}</p>
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
              {!serviceability
                ? `${filteredOutlets.length} outlets`
                : serviceability.outlets.length === 0
                  ? "No outlets deliver here"
                  : `${serviceability.outlets.length} outlet(s) deliver to this location`}
            </p>
          </div>
        </div>
        {isLoading ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <p className="text-sm text-stone-500">Loading outlets...</p>
          </div>
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center">
            <h4 className="text-lg font-semibold text-red-600">
              Unable to load outlets
            </h4>
            <p className="mt-2 text-sm text-stone-500">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white"
            >
              Retry
            </button>
          </div>
        ) : !serviceability ? (
          <OutletGrid
            outlets={filteredOutlets}
            onSelectOutlet={handleSelectOutlet}
          />
        ) : serviceability.outlets.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <MapPin className="mx-auto mb-3 text-orange-600" size={28} />
            <h4 className="text-lg font-semibold">
              Sorry, we don’t deliver to this location
            </h4>
            <p className="mt-2 text-sm text-stone-500">
              Choose another location on the map and check delivery again.
            </p>
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
            <h4 className="text-lg font-semibold">
              No outlets match your search
            </h4>
            <p className="mt-2 text-sm text-stone-500">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <OutletGrid
            outlets={filteredOutlets}
            onSelectOutlet={handleSelectOutlet}
          />
        )}
      </section>
    </main>
  );
}
