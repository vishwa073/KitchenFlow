import { useState } from "react";
import { useAuth } from "@clerk/react";
import type { DeliveryAddress } from "../features/onboarding/components/AddressForm";

export type OnboardingStep = "phone" | "address";

export interface ServiceableOutlet {
  id: string;
  name: string;
  code: string;
  address: string;
  area: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  isCloudKitchen: boolean;
  minimumPrepTimeMin: number;
  deliveryRadiusKm: number;
  distanceKm: number;
  city: string;
}

interface ServiceabilityResponse {
  success: boolean;
  count: number;
  serviceable: boolean;
  outlets: ServiceableOutlet[];
  message?: string;
}

interface SaveAddressResponse {
  success: boolean;
  message: string;
  address?: {
    id: string;
  };
}

export function useOnboarding() {
  const { getToken } = useAuth();

  const [activeStep, setActiveStep] = useState<OnboardingStep>("phone");
  const [phone, setPhone] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [address, setAddress] = useState<DeliveryAddress | null>(null);
  const [savedAddressId, setSavedAddressId] = useState<string | null>(null);
  const [serviceability, setServiceability] =
    useState<ServiceabilityResponse | null>(null);
  const [isCheckingServiceability, setIsCheckingServiceability] =
    useState(false);
  const [serviceabilityError, setServiceabilityError] = useState("");

  function completePhoneVerification(verifiedPhone: string) {
    setPhone(verifiedPhone);
    setIsPhoneVerified(true);
    setActiveStep("address");
  }

  function goToPhoneStep() {
    setActiveStep("phone");
  }
  

  async function saveAddress(deliveryAddress: DeliveryAddress) {
    setAddress(deliveryAddress);
    setServiceability(null);
    setServiceabilityError("");
    setIsCheckingServiceability(true);

    try {
      const { latitude, longitude } = deliveryAddress;

      if (latitude === null || longitude === null) {
        throw new Error("Please select your delivery location on the map.");
      }

      const token = await getToken();

      if (!token) {
        throw new Error("You are not authenticated. Please sign in again.");
      }

      const addressPayload = {
        label: deliveryAddress.addressType,
        recipientName: deliveryAddress.fullName,
        phone: deliveryAddress.phone,
        addressLine1: [deliveryAddress.houseNo, deliveryAddress.street]
          .filter(Boolean)
          .join(", "),
        landmark: deliveryAddress.landmark || null,
        area: deliveryAddress.area,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postalCode: deliveryAddress.pincode,
        country: "India",
        latitude,
        longitude,
        isDefault: true,
      };

      const saveResponse = await fetch("http://localhost:4000/api/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(addressPayload),
      });

      const saveResult: SaveAddressResponse = await saveResponse.json();

      if (!saveResponse.ok || !saveResult.success) {
        throw new Error(
          saveResult.message || "Unable to save your delivery address.",
        );
      }
      if (!saveResult.address?.id) {
        throw new Error("Address was saved, but its ID was not returned.");
      }

      setSavedAddressId(saveResult.address.id);
      

      const serviceabilityResponse = await fetch(
        `http://localhost:4000/api/serviceability?latitude=${latitude}&longitude=${longitude}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const serviceabilityResult: ServiceabilityResponse =
        await serviceabilityResponse.json();

      if (!serviceabilityResponse.ok || !serviceabilityResult.success) {
        throw new Error(
          serviceabilityResult.message ||
            "Unable to check delivery availability.",
        );
      }

      setServiceability(serviceabilityResult);
    } catch (error) {
      setServiceabilityError(
        error instanceof Error
          ? error.message
          : "Unable to check delivery availability.",
      );
    } finally {
      setIsCheckingServiceability(false);
    }
  }

  return {
    activeStep,
    setActiveStep,
    phone,
    isPhoneVerified,
    address,
    serviceability,
    isCheckingServiceability,
    serviceabilityError,
    completePhoneVerification,
    goToPhoneStep,
    saveAddress,
    savedAddressId,
  };
}
