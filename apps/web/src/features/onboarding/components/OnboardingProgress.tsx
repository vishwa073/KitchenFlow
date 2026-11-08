type OnboardingStep = "phone" | "address";

interface OnboardingProgressProps {
  activeStep: OnboardingStep;
}

const steps = [
  { id: "phone", label: "Phone", description: "Verify your number" },
  { id: "address", label: "Address", description: "Where should we deliver?" },
];

export default function OnboardingProgress({
  activeStep,
}: OnboardingProgressProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm font-semibold text-[#1e232a]">
          Getting started
        </p>
        <p className="text-sm text-[#777b82]">
          Step {activeIndex + 1} of {steps.length}
        </p>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div
              key={step.id}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                isCompleted || isActive
                  ? "bg-[#f47b38]"
                  : "bg-[#e8e5df]"
              }`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {steps.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <div key={step.id} className="flex items-start gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  isCompleted || isActive
                    ? "bg-[#f47b38] text-white"
                    : "bg-[#eeece7] text-[#85878b]"
                }`}
              >
                {isCompleted ? "✓" : index + 1}
              </div>

              <div>
                <p
                  className={`text-sm font-semibold ${
                    isActive ? "text-[#1e232a]" : "text-[#777b82]"
                  }`}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-xs text-[#8b8d91]">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}