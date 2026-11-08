
import { ShieldCheck, Smartphone } from "lucide-react";

type VerificationStep = "phone" | "otp" | "success";

interface VerificationHeaderProps {
  step: VerificationStep;
  phone: string;
}

export default function VerificationHeader({
  step,
  phone,
}: VerificationHeaderProps) {
  return (
    <>
      <div className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f47b38]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f47b38]" />
        Step 1 of 2 · Phone verification
      </div>

      {step !== "success" && (
        <div className="mb-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0e6] text-[#e96d2d]">
            {step === "phone" ? (
              <Smartphone size={23} />
            ) : (
              <ShieldCheck size={23} />
            )}
          </div>

          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#1e232a] sm:text-3xl">
            {step === "phone"
              ? "Let's get your kitchen journey started."
              : "One quick check."}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            {step === "phone"
              ? "Add your mobile number so we can keep you updated on your orders."
              : `We sent a 6-digit code to ${phone}. Enter it below to verify your number.`}
          </p>
        </div>
      )}
    </>
  );
}
