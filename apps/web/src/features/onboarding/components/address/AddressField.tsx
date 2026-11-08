import type { InputHTMLAttributes } from "react";

interface AddressFieldProps
  extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function AddressField({
  label,
  error,
  className = "",
  ...inputProps
}: AddressFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <input
        {...inputProps}
        className={`w-full rounded-lg border border-gray-300 px-3 py-2.5
          text-sm outline-none transition
          focus:border-orange-500 focus:ring-2 focus:ring-orange-100
          ${error ? "border-red-500" : ""}
          ${className}`}
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}