

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

interface DefaultAddress {
  selectedOutletId: string | null;
}

interface DefaultAddressResponse {
  success: boolean;
  address: DefaultAddress | null;
  message?: string;
}

export default function PostAuthRedirect() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;

    async function checkAddress() {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication token unavailable.");
        }

        const response = await fetch(
          "http://localhost:4000/api/addresses/default",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result: DefaultAddressResponse = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to check your saved address.",
          );
        }

        if (cancelled) return;

        const selectedOutletId = result.address?.selectedOutletId;

        if (selectedOutletId) {
          navigate(`/customer/${selectedOutletId}`, { replace: true });
        } else if (result.address) {
          navigate("/outlets", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to check your onboarding status.",
        );
      }
    }

    void checkAddress();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getToken, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-stone-900">
            Unable to continue
          </h1>
          <p className="mt-3 text-sm text-stone-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]">
      <p className="text-sm text-stone-600">
        Checking your KitchenFlow account...
      </p>
    </div>
  );
}
