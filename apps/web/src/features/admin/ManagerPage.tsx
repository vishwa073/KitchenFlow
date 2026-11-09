import { useState } from "react";
import { useClerk } from "@clerk/react";
import {
  Utensils,
  CalendarDays,
  LogOut,
  Menu as MenuIcon,
  X,
  ChefHat,
  ClipboardList,
  Users,
  BellRing,
} from "lucide-react";
import ManagerOrdersPage from "./orders/ManagerOrdersPage";
import AdminMenuPage from "./menu/AdminMenuPage";
import ManagerPartyRequestsPage from "./party-requests/ManagerPartyRequestsPage";
import ManagerAlertsPage from "./alerts/ManagerAlertsPage";

type ManagerSection = "menu" | "party-requests" | "orders" | "staff" | "alerts";

export default function ManagerPage() {
  const { signOut } = useClerk();

  const [activeSection, setActiveSection] = useState<ManagerSection>("menu");

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigation = [
    {
      id: "menu" as const,
      label: "Menu Management",
      icon: Utensils,
    },
    {
      id: "party-requests" as const,
      label: "Party Requests",
      icon: CalendarDays,
    },
    {
      id: "orders" as const,
      label: "Outlet Orders",
      icon: ClipboardList,
    },
    {
      id: "staff" as const,
      label: "Staff Management",
      icon: Users,
    },
    {
      id: "alerts" as const,
      label: "Manager Alerts",
      icon: BellRing,
    },
  ];
  const handleNavigation = (section: ManagerSection) => {
    setActiveSection(section);
    setMobileSidebarOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white">
            <ChefHat size={20} />
          </div>

          <div>
            <p className="font-bold text-slate-900">KitchenFlow</p>
            <p className="text-xs text-slate-500">Manager Portal</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileSidebarOpen((open) => !open)}
          aria-label={
            mobileSidebarOpen ? "Close navigation" : "Open navigation"
          }
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          {mobileSidebarOpen ? <X size={22} /> : <MenuIcon size={22} />}
        </button>
      </div>

      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Brand */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-white">
              <ChefHat size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">KitchenFlow</h1>
              <p className="text-xs text-slate-500">Manager Portal</p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 px-4 py-6">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspace
            </p>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigation(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition ${
                      isActive
                        ? "bg-orange-50 text-orange-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={19} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Manager info and sign out */}
          <div className="border-t border-slate-100 p-4">
            <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-700">
                <ChefHat size={20} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  Outlet Manager
                </p>
                <p className="text-xs text-slate-500">Manager Account</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {activeSection === "menu" && <AdminMenuPage />}

          {activeSection === "party-requests" && <ManagerPartyRequestsPage />}

          {activeSection === "orders" && <ManagerOrdersPage />}

          {activeSection === "staff" && (
            <div className="p-8">
              <h1 className="text-2xl font-bold text-slate-900">
                Staff Management
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                We will implement staff listing, adding staff, and role
                assignment next.
              </p>
            </div>
          )}
          {activeSection === "alerts" && <ManagerAlertsPage />}
        </main>
      </div>
    </div>
  );
}
