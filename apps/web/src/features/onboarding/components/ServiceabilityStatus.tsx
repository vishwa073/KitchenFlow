
import type { ServiceableOutlet } from "../../../hooks/useOnboarding";

interface ServiceabilityStatusProps {
  serviceable: boolean | null;
  outlets: ServiceableOutlet[];
  isChecking: boolean;
  error: string;
  onRetry: () => void;
  onSelectOutlet: (outlet: ServiceableOutlet) => void;
}

export default function ServiceabilityStatus({
  serviceable,
  outlets,
  isChecking,
  error,
  onRetry,
  onSelectOutlet,
}: ServiceabilityStatusProps) {
  if (isChecking) {
    return (
      <div className="mt-6 flex items-center gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-5">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
        <div>
          <p className="font-semibold text-[#1e232a]">
            Finding kitchens near you
          </p>
          <p className="mt-1 text-sm text-[#777b82]">
            Checking which outlets can deliver to your address.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-800">
          We couldn't check delivery availability
        </p>
        <p className="mt-1 text-sm text-red-700">{error}</p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    );
  }

  if (serviceable === false) {
    return (
      <div className="mt-6 overflow-hidden rounded-3xl border border-amber-200 bg-amber-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-2xl">
            📍
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#1e232a]">
              We're not there just yet
            </h3>
            <p className="mt-2 text-sm leading-6 text-[#777b82]">
              No kitchen currently delivers to this location. Try choosing
              another delivery point.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (serviceable !== true || outlets.length === 0) {
    return null;
  }

  return (
    <section className="mt-8">
      {/* Showcase heading */}
      <div className="mb-5">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-semibold text-emerald-700">
            Delivery available
          </span>
        </div>

        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-[#1e232a] sm:text-3xl">
              Kitchens around you
            </h3>
            <p className="mt-2 max-w-lg text-sm leading-6 text-[#777b82]">
              We've found kitchens that can serve your location. Explore the
              outlets available near you.
            </p>
          </div>

          <div className="inline-flex w-fit items-center rounded-xl bg-[#f7f7f5] px-3 py-2 text-sm font-medium text-[#454b54]">
            {outlets.length} outlet{outlets.length === 1 ? "" : "s"} nearby
          </div>
        </div>
      </div>

      {/* Outlet cards */}
      <div className="grid gap-4">
        {outlets.map((outlet, index) => (
          <article
            key={outlet.id}
            className="group relative overflow-hidden rounded-3xl border border-[#ecece8] bg-white transition duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_12px_35px_rgba(30,35,42,0.07)]"
          >
            {/* Subtle decorative accent */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-orange-400 to-orange-600 opacity-80" />

            <div className="p-5 sm:p-6">
              <div className="flex items-start gap-4">
                {/* Outlet identity */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff3e9] text-2xl">
                  {outlet.isCloudKitchen ? "👨‍🍳" : "🍽️"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {index === 0 && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-orange-700">
                        Nearest kitchen
                      </span>
                    )}

                    <span className="rounded-full bg-[#f5f5f3] px-2.5 py-1 text-[11px] font-medium text-[#666b72]">
                      {outlet.isCloudKitchen ? "Cloud kitchen" : "Restaurant"}
                    </span>
                  </div>

                  <h4 className="text-lg font-bold leading-snug text-[#1e232a] sm:text-xl">
                    {outlet.name}
                  </h4>

                  <p className="mt-1 text-sm text-[#777b82]">
                    {outlet.area}, {outlet.city}
                  </p>

                  <p className="mt-2 text-sm leading-5 text-[#92969c]">
                    {outlet.address}
                  </p>
                </div>
              </div>

              {/* Details strip */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[#f8f8f6] p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-[#92969c]">
                    <span>📍</span>
                    Distance
                  </div>
                  <p className="text-sm font-bold text-[#1e232a]">
                    {outlet.distanceKm.toFixed(1)} km
                  </p>
                </div>

                <div className="rounded-2xl bg-[#f8f8f6] p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs text-[#92969c]">
                    <span>⏱️</span>
                    Prep time
                  </div>
                  <p className="text-sm font-bold text-[#1e232a]">
                    {outlet.minimumPrepTimeMin} min
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl bg-[#f8f8f6] p-3 sm:col-span-1">
                  <div className="mb-1 flex items-center gap-2 text-xs text-[#92969c]">
                    <span>🛵</span>
                    Delivery range
                  </div>
                  <p className="text-sm font-bold text-[#1e232a]">
                    {outlet.deliveryRadiusKm} km
                  </p>
                </div>
              </div>

              {/* Outlet selection */}
              <div className="mt-4 flex items-center justify-between border-t border-[#f0f0ed] pt-4">
                <p className="text-xs text-[#92969c]">
                  Available for your delivery location
                </p>

                <button
                  type="button"
                  onClick={() => onSelectOutlet(outlet)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  Choose this kitchen
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
