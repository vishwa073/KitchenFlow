import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardList, ChevronRight, MapPin } from "lucide-react";

import CustomerSection from "../components/CustomerSection";
import CustomerProfileCard from "../components/CustomerProfileCard";
import EditAddressDialog from "../components/EditAddressDialog";
import { useApi } from "../../../lib/api";

type CustomerAddress = {
  id: string;
  label?: string | null;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  landmark?: string | null;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
};

export default function CustomerProfile() {
  const navigate = useNavigate();
  const { outletId } = useParams<{ outletId: string }>();
  const { apiFetch } = useApi();

  const [address, setAddress] = useState<CustomerAddress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);

  const customerHome = `/customer/${outletId}`;

  const loadAddress = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch("/api/addresses/default");
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load your address.");
      }

      setAddress(result.address ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load your address.",
      );
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    void loadAddress();
  }, [loadAddress]);

  const profileItems = [
    {
      icon: ClipboardList,
      label: "Your orders",
      description: "View order history and status",
      onClick: () =>
        navigate(`${customerHome}/orders`, {
          state: { returnTo: customerHome },
        }),
    },
  ];

  function handleAddressSaved(updatedAddress: CustomerAddress) {
    setAddress(updatedAddress);
    setIsEditOpen(false);
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-8">
      <CustomerSection
        title="Your profile"
        description="Manage your account and delivery address."
      >
        <div className="space-y-4">
          <CustomerProfileCard
            address={address}
            loading={loading}
            onEditAddress={() => setIsEditOpen(true)}
          />

          {!loading && !address && (
            <div className="rounded-2xl border border-stone-200 bg-white p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 text-orange-500" size={20} />
                <div>
                  <p className="font-semibold text-stone-900">
                    No saved delivery address
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Add an address to make ordering easier.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/onboarding", {
                        state: { returnTo: customerHome },
                      })
                    }
                    className="mt-3 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Add address
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
              <button
                type="button"
                onClick={() => void loadAddress()}
                className="ml-2 font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            {profileItems.map(
              ({ icon: Icon, label, description, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-stone-50"
                >
                  <Icon size={21} className="text-stone-500" />

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-stone-900">{label}</p>
                    <p className="mt-1 text-sm text-stone-500">
                      {description}
                    </p>
                  </div>

                  <ChevronRight size={20} className="text-stone-400" />
                </button>
              ),
            )}
          </div>
        </div>
      </CustomerSection>

      {isEditOpen && address && (
        <EditAddressDialog
          address={address}
          onClose={() => setIsEditOpen(false)}
          onSaved={handleAddressSaved}
        />
      )}
    </div>
  );
}