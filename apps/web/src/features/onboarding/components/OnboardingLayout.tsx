
import type { ReactNode } from "react";

interface OnboardingLayoutProps {
  children: ReactNode;
}

export default function OnboardingLayout({
  children,
}: OnboardingLayoutProps) {
  return (
    <main className="h-dvh overflow-hidden bg-[#fbf9f5]">
      <div className="grid h-full lg:grid-cols-2">
        {/* Form side */}
        <section className="flex min-h-0 flex-col px-5 py-5 sm:px-10 lg:px-12 xl:px-16">
          <a
            href="/"
            className="inline-flex w-fit shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight text-[#1e232a]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f47b38] text-white">
              K
            </span>
            KitchenFlow
          </a>

          {/* Scrollable onboarding content */}
          <div className="min-h-0 flex-1 overflow-y-auto py-4">
            <div className="mx-auto w-full max-w-md">
              {children}
            </div>
          </div>

          <p className="shrink-0 text-center text-xs text-[#96969a]">
            © {new Date().getFullYear()} KitchenFlow. Made for your next meal.
          </p>
        </section>

        {/* Brand side */}
        <aside className="relative hidden min-h-0 overflow-hidden bg-[#22252b] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="absolute -right-28 -top-28 h-96 w-96 rounded-full bg-[#f47b38]/20 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#f47b38]/10 blur-3xl" />

          <div className="relative z-10 max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#f9a16e]">
              Good food, made simple
            </p>

            <h1 className="text-4xl font-bold leading-tight xl:text-5xl">
              Your favorite meals,
              <span className="block text-[#f47b38]">
                just a few steps away.
              </span>
            </h1>

            <p className="mt-5 max-w-md leading-7 text-white/65">
              Set up your account and delivery details. We’ll help you get your
              next delicious meal.
            </p>
          </div>

          <div className="relative z-10 mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
            <p className="text-lg font-semibold">
              “Great meals. Less waiting.”
            </p>
            <p className="mt-2 text-sm text-white/55">
              A smoother way to order from KitchenFlow.
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
