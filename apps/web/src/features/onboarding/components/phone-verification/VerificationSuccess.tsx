
import { Check, ShieldCheck } from "lucide-react";

export default function VerificationSuccess() {
  return (
    <div className="py-4 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-3xl bg-emerald-50 text-emerald-600">
        <Check size={30} />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-[#1e232a]">
        Phone verified!
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        Your number is ready. Let’s find the best way to get your food to you.
      </p>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={14} />
        Secure verification powered by Clerk
      </div>
    </div>
  );
}
