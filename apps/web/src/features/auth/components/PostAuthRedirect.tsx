
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { useNavigate } from "react-router-dom";

interface AuthUser {
  id: string;
  clerkUserId: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  isActive: boolean;
  roles: string[];
}

interface AuthMeResponse {
  success: boolean;
  user: AuthUser;
  message?: string;
}

interface DefaultAddress {
  selectedOutletId: string | null;
}

interface DefaultAddressResponse {
  success: boolean;
  address: DefaultAddress | null;
  message?: string;
}

const API_BASE_URL = "http://localhost:4000";

export default function PostAuthRedirect() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let cancelled = false;

    async function checkUserAndRedirect() {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("Authentication token unavailable.");
        }

        // Step 1: Identify the authenticated user and their DB roles.
        const meResponse = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const meResult: AuthMeResponse = await meResponse.json();

        if (!meResponse.ok || !meResult.success || !meResult.user) {
          throw new Error(
            meResult.message || "Unable to verify your account.",
          );
        }

        if (cancelled) return;

        const user = meResult.user;

        if (!user.isActive) {
          throw new Error("Your account is inactive. Please contact support.");
        }

        const roles = user.roles ?? [];

        // Step 2: Redirect staff/admin users.
        // These roles are supplied by the backend, not by the client.
        if (roles.includes("CENTRAL_ADMIN")) {
          navigate("/admin", { replace: true });
          return;
        }

        if (roles.includes("OUTLET_MANAGER")) {
          navigate("/manager", { replace: true });
          return;
        }

        if (roles.includes("KITCHEN_STAFF")) {
          navigate("/kitchen", { replace: true });
          return;
        }

        // Step 3: Preserve the existing customer address flow.
        if (roles.includes("CUSTOMER")) {
          const addressResponse = await fetch(
            `${API_BASE_URL}/api/addresses/default`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          const addressResult: DefaultAddressResponse =
            await addressResponse.json();

          if (!addressResponse.ok || !addressResult.success) {
            throw new Error(
              addressResult.message ||
                "Unable to check your saved address.",
            );
          }

          if (cancelled) return;

          const selectedOutletId =
            addressResult.address?.selectedOutletId;

          if (selectedOutletId) {
            navigate(`/customer/${selectedOutletId}`, {
              replace: true,
            });
          } else if (addressResult.address) {
            navigate("/outlets", { replace: true });
          } else {
            navigate("/onboarding", { replace: true });
          }

          return;
        }

        // Do not silently route unknown roles into the customer flow.
        throw new Error(
          "Your account does not have a recognized KitchenFlow role.",
        );
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to check your account.",
        );
      }
    }

    void checkUserAndRedirect();

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
