
import { Outlet, useParams } from "react-router-dom";

import CustomerHeader from "./components/CustomerHeader";
import CustomerBottomNav from "./components/CustomerBottomNav";

export default function CustomerPage() {
  const { outletId } = useParams<{ outletId: string }>();

  if (!outletId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center">
          <h1 className="text-xl font-bold text-stone-900">
            Outlet not found
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            Please select an outlet to continue.
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <CustomerHeader outletId={outletId} />

      <main className="pb-24">
        <Outlet />
      </main>

      <CustomerBottomNav outletId={outletId} />
    </div>
  );
}
