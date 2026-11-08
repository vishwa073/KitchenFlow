import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export default function OtpInput({
  value,
  onChange,
  length = 6,
  disabled = false,
}: OtpInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const digits = Array.from({ length }, (_, index) => value[index] ?? "");

  function updateDigit(index: number, digit: string) {
    const next = digits.slice();
    next[index] = digit;
    onChange(next.join(""));

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleChange(index: number, input: string) {
    const cleanInput = input.replace(/\D/g, "");

    if (!cleanInput) {
      updateDigit(index, "");
      return;
    }

    if (cleanInput.length > 1) {
      const pastedDigits = cleanInput.slice(0, length).split("");
      const next = Array.from({ length }, (_, i) => digits[i] ?? "");

      pastedDigits.forEach((digit, i) => {
        next[i] = digit;
      });

      onChange(next.join(""));

      const focusIndex = Math.min(pastedDigits.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
      return;
    }

    updateDigit(index, cleanInput);
  }

  function handleKeyDown(
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={length}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="h-12 min-w-0 flex-1 rounded-xl border border-[#e5e1d9] bg-white text-center text-xl font-bold text-[#1e232a] outline-none transition focus:border-[#f47b38] focus:ring-2 focus:ring-[#f47b38]/15 disabled:opacity-50 sm:h-14"
        />
      ))}
    </div>
  );
}