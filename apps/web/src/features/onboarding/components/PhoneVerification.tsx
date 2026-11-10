import { useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { useUser } from "@clerk/react";
import OtpInput from "./OtpInput";
import PhoneEntryForm from "./phone-verification/PhoneEntryForm";
import VerificationHeader from "./phone-verification/VerificationHeader";
import VerificationSuccess from "./phone-verification/VerificationSuccess";

type PhoneVerificationProps = {
  onVerified: (phoneNumber: string) => void;
};

type ApiResponse = {
  success: boolean;
  message?: string;
  phone?: string;
  expiresInSeconds?: number;
};

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/$/, "");;

export default function PhoneVerification({
  onVerified,
}: PhoneVerificationProps) {
  const { isLoaded, isSignedIn } = useUser();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formattedPhone = `+91${phone.replace(/\D/g, "")}`;

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const digits = phone.replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(digits)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/whatsapp/send-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ phone: formattedPhone }),
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to send WhatsApp OTP.");
      }

      setCode("");
      setSuccessMessage(
        data.message || "OTP sent to your WhatsApp number.",
      );
      setStep("otp");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to send the verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/auth/whatsapp/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            phone: formattedPhone,
            code,
          }),
        },
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "That code couldn't be verified. Please try again.",
        );
      }

      const verifiedPhone = data.phone || formattedPhone;

      setStep("success");
      onVerified(verifiedPhone);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid or expired code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function changePhone() {
    setStep("phone");
    setCode("");
    setError("");
    setSuccessMessage("");
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="p-6 text-center text-sm text-slate-600">
        Please sign in to continue.
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <VerificationHeader step={step} phone={formattedPhone} />

      {step === "success" ? (
        <VerificationSuccess />
      ) : step === "phone" ? (
        <PhoneEntryForm
          phone={phone}
          onPhoneChange={setPhone}
          onSubmit={sendCode}
          loading={loading}
          error={error}
        />
      ) : (
        <form onSubmit={verifyCode} className="space-y-4">
          <p className="text-sm text-slate-500">
            {successMessage || `Enter the code sent to ${formattedPhone} on WhatsApp.`}
          </p>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-[#303741]">
              Verification code
            </span>

            <OtpInput
              value={code}
              onChange={setCode}
              length={6}
              disabled={loading}
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f47b38] font-semibold text-white shadow-md shadow-orange-200/50 transition hover:bg-[#e96d2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify phone number"}
            {!loading && <Check size={18} />}
          </button>

          <button
            type="button"
            onClick={changePhone}
            className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 transition hover:text-[#e96d2d]"
          >
            <ArrowLeft size={16} />
            Change phone number
          </button>
        </form>
      )}

      {step !== "success" && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} />
          Secure WhatsApp verification
        </div>
      )}
    </div>
  );
}