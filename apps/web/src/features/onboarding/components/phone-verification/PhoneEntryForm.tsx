
import type { FormEvent } from "react";
import { ArrowRight } from "lucide-react";

interface PhoneEntryFormProps {
  phone: string;
  onPhoneChange: (phone: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string;
}

export default function PhoneEntryForm({
  phone,
  onPhoneChange,
  onSubmit,
  loading,
  error,
}: PhoneEntryFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#303741]">
          Mobile number
        </span>

        <div className="flex h-14 items-center rounded-2xl border border-[#e7e3dc] bg-white px-4 transition focus-within:border-[#f47b38] focus-within:ring-4 focus-within:ring-orange-100">
          <span className="mr-3 border-r border-[#e7e3dc] pr-3 text-sm font-semibold text-[#303741]">
            🇮🇳 +91
          </span>

          <input
            autoComplete="tel-national"
            inputMode="numeric"
            maxLength={10}
            value={phone}
            onChange={(event) =>
              onPhoneChange(event.target.value.replace(/\D/g, ""))
            }
            placeholder="98765 43210"
            className="w-full bg-transparent text-base font-medium outline-none placeholder:text-slate-300"
          />
        </div>
      </label>

      <p className="text-xs leading-5 text-slate-400">
        We’ll send a one-time password by SMS. Your number is kept secure.
      </p>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#f47b38] font-semibold text-white shadow-md shadow-orange-200/50 transition hover:bg-[#e96d2d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Sending code..." : "Send verification code"}
        {!loading && <ArrowRight size={18} />}
      </button>
    </form>
  );
}
