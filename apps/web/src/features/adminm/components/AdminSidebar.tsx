import type { ReactNode } from "react";

type AdminTab = "overview" | "outlets" | "coupons";

type AdminSidebarProps = {
  activeTab: AdminTab;
  onNavigate: (tab: AdminTab) => void;
  onSignOut: () => void;
  signingOut: boolean;
};

const navItems: {
  id: AdminTab;
  label: string;
  icon: ReactNode;
}[] = [
  {
    id: "overview",
    label: "Dashboard",
    icon: <span aria-hidden="true">▦</span>,
  },
  {
    id: "outlets",
    label: "Outlet management",
    icon: <span aria-hidden="true">⌂</span>,
  },
  {
  id: "coupons",
  label: "Coupons",
  icon: <span aria-hidden="true">%</span>,
},
];

export default function AdminSidebar({
  activeTab,
  onNavigate,
  onSignOut,
  signingOut,
}: AdminSidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white p-6 lg:flex">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-600 text-lg font-black text-white">
          K
        </div>

        <div>
          <p className="font-bold text-slate-900">KitchenFlow</p>
          <p className="text-xs text-slate-500">Central Admin</p>
        </div>
      </div>

      {/* Navigation */}
      <p className="mb-3 mt-10 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">
        Workspace
      </p>

      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                active
                  ? "bg-orange-50 text-orange-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto">
        <div className="mb-4 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-700">
            Central operations
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            Manage outlets and monitor platform operations.
          </p>
        </div>

        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true">↪</span>
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}