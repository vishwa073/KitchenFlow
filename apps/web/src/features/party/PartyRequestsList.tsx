import { CalendarDays, UsersRound } from "lucide-react";
import type { PartyRequest } from "./party.types";

interface PartyRequestsListProps {
  requests: PartyRequest[];
  loading: boolean;
  onRefresh: () => void;
}

function formatEventDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getStatusStyle(status: PartyRequest["status"]): string {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    case "QUOTED":
      return "bg-blue-100 text-blue-700";
    case "REVIEWING":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

function readableStatus(status: PartyRequest["status"]): string {
  return status.replaceAll("_", " ");
}

export default function PartyRequestsList({
  requests,
  loading,
  onRefresh,
}: PartyRequestsListProps) {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            Your party requests
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Check the latest status of your submissions.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-stone-200 bg-white p-5 text-sm text-stone-500">
          Loading your party requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-6 text-center">
          <CalendarDays className="mx-auto text-stone-400" size={28} />
          <p className="mt-3 font-semibold text-stone-800">
            No party requests yet
          </p>
          <p className="mt-1 text-sm text-stone-500">
            Your submitted requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-900">
                    {request.requestNumber}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    {request.eventType || "Party event"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(
                    request.status,
                  )}`}
                >
                  {readableStatus(request.status)}
                </span>
              </div>

              <div className="mt-4 space-y-2 text-sm text-stone-600">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} className="shrink-0 text-stone-400" />
                  <span>{formatEventDate(request.eventAt)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <UsersRound size={16} className="shrink-0 text-stone-400" />
                  <span>{request.guestCount} guests</span>
                </div>

                <p>
                  {[
                    request.addressLine1,
                    request.addressLine2,
                    request.area,
                    request.city,
                    request.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>

              {request.managerNotes && (
                <div className="mt-3 rounded-lg bg-stone-50 p-3 text-sm text-stone-600">
                  <span className="font-semibold text-stone-800">
                    Manager note:{" "}
                  </span>
                  {request.managerNotes}
                </div>
              )}

              {request.quoteAmount != null && (
                <p className="mt-3 text-sm font-semibold text-stone-900">
                  Quote: ₹{Number(request.quoteAmount).toLocaleString("en-IN")}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}