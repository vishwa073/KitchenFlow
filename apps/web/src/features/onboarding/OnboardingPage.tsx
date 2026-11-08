import OnboardingLayout from "./components/OnboardingLayout";
import OnboardingProgress from "./components/OnboardingProgress";
import PhoneVerification from "./components/PhoneVerification";
import AddressForm from "./components/AddressForm";
import ServiceabilityStatus from "./components/ServiceabilityStatus";
import {
  useOnboarding,
  type ServiceableOutlet,
} from "../../hooks/useOnboarding";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/react";
export default function OnboardingPage() {
  const {
    activeStep,
    phone,
    address,
    serviceability,
    isCheckingServiceability,
    serviceabilityError,
    completePhoneVerification,
    saveAddress,
    savedAddressId,
  } = useOnboarding();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  async function handleSelectOutlet(outlet: ServiceableOutlet) {
  if (!savedAddressId) {
    console.error("No saved address ID available.");
    alert("Please save your delivery address first.");
    return;
  }

  try {
    const token = await getToken();

    if (!token) {
      throw new Error("You are not authenticated. Please sign in again.");
    }

    const response = await fetch(
      `http://localhost:4000/api/addresses/${savedAddressId}/select-outlet`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          outletId: outlet.id,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Failed to save selected outlet. HTTP ${response.status}`,
      );
    }

    navigate(`/customer/${outlet.id}`);
  } catch (error) {
    console.error("Error saving selected outlet:", error);
    alert(
      error instanceof Error
        ? error.message
        : "Something went wrong while choosing the kitchen.",
    );
  }
}
  return (
    <OnboardingLayout>
      <OnboardingProgress activeStep={activeStep} />

      {activeStep === "phone" ? (
        <div className="mt-6">
          <PhoneVerification onVerified={completePhoneVerification} />
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-[#1e232a]">
            Where should we deliver?
          </h2>

          <p className="mb-8 leading-6 text-[#777b82]">
            Add your delivery address to make ordering easier.
          </p>

          <AddressForm
            initialValue={{
              ...address,
              phone,
            }}
            onSubmit={saveAddress}
            isSubmitting={isCheckingServiceability}
          />

          <ServiceabilityStatus
            serviceable={serviceability?.serviceable ?? null}
            outlets={serviceability?.outlets ?? []}
            isChecking={isCheckingServiceability}
            error={serviceabilityError}
            onRetry={() => {
              if (address) void saveAddress(address);
            }}
            onSelectOutlet={handleSelectOutlet}
          />
        </div>
      )}
    </OnboardingLayout>
  );
}
