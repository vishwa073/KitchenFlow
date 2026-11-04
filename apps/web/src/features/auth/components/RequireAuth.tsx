
import { Show, SignInButton } from "@clerk/react";
import type { ReactNode } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  return (
    <Show
      when="signed-in"
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5">
          <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-stone-900">
              Sign in to continue
            </h1>

            <p className="mt-3 text-sm text-stone-600">
              Please sign in to access this KitchenFlow page.
            </p>

            <SignInButton mode="modal">
              <button className="mt-6 w-full rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                Sign in
              </button>
            </SignInButton>
          </div>
        </div>
      }
    >
      {children}
    </Show>
  );
}
