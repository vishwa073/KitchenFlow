
import { useCallback, useEffect, useState } from "react";
import {
  Check,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import { useAuth } from "@clerk/react";

import {
  partyRequestService,
  type PartyRequest,
  type PartyRequestStatus,
} from "./services/partyRequestService";

const statusStyles: Record<PartyRequestStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700",
  REVIEWING: "bg-blue-50 text-blue-700",
  QUOTED: "bg-violet-50 text-violet-700",
  CONFIRMED: "bg-emerald-50 text-emerald-700",
  REJECTED: "bg-rose-50 text-rose-700",
};

const statusLabels: Record<PartyRequestStatus, string> = {
  PENDING: "Pending",
  REVIEWING: "Reviewing",
  QUOTED: "Quoted",
  CONFIRMED: "Confirmed",
  REJECTED: "Rejected",
};

type FilterStatus = "ALL" | PartyRequestStatus;

function formatDate(value?: string | null) {
  if (!value) return "Not specified";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCustomerName(request: PartyRequest) {
  return request.customer?.name || "Customer";
}

export default function ManagerPartyRequestsPage() {
  const { getToken } = useAuth();

  const [requests, setRequests] = useState<PartyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const [selectedRequest, setSelectedRequest] =
    useState<PartyRequest | null>(null);

  const [quoteAmount, setQuoteAmount] = useState("");
  const [managerNotes, setManagerNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token is unavailable.");
      }

      const data = await partyRequestService.getAll(token);
      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load party requests."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  const openRequest = (request: PartyRequest) => {
    setSelectedRequest(request);
    setQuoteAmount(
      request.quoteAmount != null ? String(request.quoteAmount) : ""
    );
    setManagerNotes(request.managerNotes ?? "");
  };

  const updateRequest = async (
    status: "REVIEWING" | "QUOTED" | "CONFIRMED" | "REJECTED"
  ) => {
    if (!selectedRequest) return;

    if (status === "QUOTED") {
      const amount = Number(quoteAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        setError("Enter a valid quote amount greater than zero.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Authentication token is unavailable.");
      }

      const payload = {
        status,
        ...(status === "QUOTED"
          ? { quoteAmount: Number(quoteAmount) }
          : {}),
        managerNotes: managerNotes.trim(),
      };

      const updated = await partyRequestService.update(
        selectedRequest.id,
        payload,
        token
      );

      setRequests((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      setSelectedRequest(updated);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update the party request."
      );
    } finally {
      setSaving(false);
    }
  };

  const filteredRequests =
    filter === "ALL"
      ? requests
      : requests.filter((request) => request.status === filter);

  const countByStatus = (status: PartyRequestStatus) =>
    requests.filter((request) => request.status === status).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-orange-600">
            KitchenFlow Manager
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Party Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review event requests, prepare quotes, and manage confirmations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadRequests()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {(
          ["PENDING", "REVIEWING", "QUOTED", "CONFIRMED", "REJECTED"] as const
        ).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-2xl border p-4 text-left transition ${
              filter === status
                ? "border-orange-300 bg-orange-50"
                : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <p className="text-xs font-medium text-slate-500">
              {statusLabels[status]}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {countByStatus(status)}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "REVIEWING", "QUOTED", "CONFIRMED", "REJECTED"] as const).map(
          (status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                filter === status
                  ? "bg-slate-900 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
              }`}
            >
              {status === "ALL" ? "All requests" : statusLabels[status]}
            </button>
          )
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-slate-500">
          <Loader2 className="mr-2 animate-spin" size={20} />
          Loading party requests...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
          <MessageSquare className="mx-auto text-slate-300" size={36} />
          <h3 className="mt-3 font-semibold text-slate-800">
            No party requests found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Try a different status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {getCustomerName(request)}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      statusStyles[request.status]
                    }`}
                  >
                    {statusLabels[request.status]}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-600">
                  {request.outlet?.name ?? "Outlet not specified"}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  {request.eventDate && (
                    <span>
                      Event: {formatDate(request.eventDate)}
                    </span>
                  )}

                  {request.guestCount != null && (
                    <span>{request.guestCount} guests</span>
                  )}

                  {request.customer?.email && (
                    <span>{request.customer.email}</span>
                  )}

                  {request.quoteAmount != null && (
                    <span className="font-semibold text-slate-700">
                      Quote: ₹{Number(request.quoteAmount).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => openRequest(request)}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Review request
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Review party request
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {getCustomerName(selectedRequest)} ·{" "}
                  {selectedRequest.outlet?.name ?? "Outlet"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close request review"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Event date</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(selectedRequest.eventDate)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Guest count</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.guestCount ?? "Not specified"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Customer email</p>
                  <p className="mt-1 break-all font-semibold text-slate-900">
                    {selectedRequest.customer?.email ?? "Not provided"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Customer phone</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {selectedRequest.customer?.phone ?? "Not provided"}
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Quote amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={quoteAmount}
                  onChange={(event) => setQuoteAmount(event.target.value)}
                  placeholder="Enter quote amount"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Manager notes
                </label>
                <textarea
                  rows={4}
                  value={managerNotes}
                  onChange={(event) => setManagerNotes(event.target.value)}
                  placeholder="Add event requirements, internal notes, or quote details..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-3 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                disabled={saving}
                onClick={() => void updateRequest("REJECTED")}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                <X size={16} />
                Reject
              </button>

              <div className="flex flex-wrap gap-2">
                {selectedRequest.status === "PENDING" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void updateRequest("REVIEWING")}
                    className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                  >
                    <Clock size={16} />
                    Start review
                  </button>
                )}

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void updateRequest("QUOTED")}
                  className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  <Send size={16} />
                  Send quote
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void updateRequest("CONFIRMED")}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={16} />
                  Confirm
                </button>
              </div>
            </div>

            {saving && (
              <div className="flex items-center gap-2 px-6 pb-4 text-sm text-slate-500">
                <Loader2 className="animate-spin" size={16} />
                Updating request...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
