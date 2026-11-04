
import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/react";
import { ArrowRight } from "lucide-react";

export default function AuthActions() {
  return (
    <div className="flex items-center gap-3">
      <Show when="signed-out">
        <>
          <SignInButton mode="modal">
            <button className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-100 sm:inline-flex">
              Sign in
            </button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 sm:px-5">
              Get started
              <ArrowRight size={16} />
            </button>
          </SignUpButton>
        </>
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
