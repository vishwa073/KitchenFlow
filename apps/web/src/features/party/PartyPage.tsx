import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { CheckCircle2 } from "lucide-react";

import PartyRequestForm from "./PartyRequestForm";
import PartyRequestsList from "./PartyRequestsList";
import { getPartyRequests } from "./partyService";
import type { PartyRequest } from "./party.types";

interface PartyPageProps {
  outletId?: string;
}

export default function PartyPage({ outletId }: PartyPageProps) {
  const { getToken } = useAuth();

  const [requests, setRequests] = useState<PartyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const getTokenForApi = useCallback(
    async () => getToken(),
    [getToken],
  );

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError("");

      const result = await getPartyRequests(getTokenForApi);
      setRequests(result);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load party requests.",
      );
    } finally {
      setLoading(false);
    }
  }, [getTokenForApi]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  function handleCreated(request: PartyRequest) {
    setRequests((previous) => [
      request,
      ...previous.filter((item) => item.id !== request.id),
    ]);

    setSuccessMessage(
      `Your party request ${request.requestNumber} was submitted. It is awaiting manager review.`,
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
        >
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Request submitted</p>
            <p className="mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6">
        <PartyRequestForm
          outletId={outletId}
          getToken={getTokenForApi}
          onCreated={handleCreated}
        />
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {loadError}

          <button
            type="button"
            onClick={() => void loadRequests()}
            className="ml-2 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <PartyRequestsList
        requests={requests}
        loading={loading}
        onRefresh={() => void loadRequests()}
      />
    </div>
  );
}