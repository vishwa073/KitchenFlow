import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "@clerk/react";

import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import AdminOverview from "./components/AdminOverview";
import OutletsTable from "./components/OutletsTable";
import CreateOutletDialog from "./components/CreateOutletDialog";
import AdminCoupons from "./components/AdminCoupons";
import {
  getAdminOutlets,
  createAdminOutlet,
  type AdminOutlet,
  type CreateOutletInput,
} from "./services/AdminService";

type AdminTab = "overview" | "outlets" | "coupons";

const initialOutletForm: CreateOutletInput = {
  name: "",
  code: "",
  cityId: "",
  address: "",
  area: "",
  postalCode: "",
  phone: "",
  isCloudKitchen: false,
};

export default function AdminDashboard() {
  const { getToken, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  const [outlets, setOutlets] = useState<AdminOutlet[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [showCreateOutlet, setShowCreateOutlet] = useState(false);
  const [form, setForm] = useState<CreateOutletInput>(initialOutletForm);

  const getBearerToken = useCallback(async () => {
    const token = await getToken();

    if (!token) {
      throw new Error(
        "Could not obtain your sign-in token. Please sign in again.",
      );
    }

    return token;
  }, [getToken]);

  const refreshOutlets = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getBearerToken();
      const data = await getAdminOutlets(token);

      setOutlets(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load Admin data.");
    } finally {
      setLoading(false);
    }
  }, [getBearerToken]);

  useEffect(() => {
    void refreshOutlets();
  }, [refreshOutlets]);

  const handleCreateOutlet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const token = await getBearerToken();

      await createAdminOutlet(token, form);

      setForm(initialOutletForm);
      setShowCreateOutlet(false);
      setNotice("Outlet created successfully.");

      await refreshOutlets();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Outlet creation failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (
    field: keyof CreateOutletInput,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    setError("");

    try {
      await signOut();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not sign out. Please try again.",
      );
    } finally {
      setSigningOut(false);
    }
  };

  const openCreateOutlet = () => {
    setForm(initialOutletForm);
    setShowCreateOutlet(true);
  };

  const pageTitle =
    activeTab === "overview"
      ? "Dashboard"
      : activeTab === "outlets"
        ? "Outlet management"
        : "Coupon management";

  const pageSubtitle =
    activeTab === "overview"
      ? "Monitor your KitchenFlow platform."
      : activeTab === "outlets"
        ? "View and create platform outlets."
        : "Create and manage promotional coupons.";

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-slate-900">
      {/* Desktop sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onSignOut={() => void handleSignOut()}
        signingOut={signingOut}
      />

      {/* Main content */}
      <main className="lg:ml-64">
        <AdminHeader
          title={pageTitle}
          subtitle={pageSubtitle}
          onRefresh={() => void refreshOutlets()}
          refreshing={loading}
        />

        <section className="p-5 md:p-8">
          {/* Mobile navigation */}
          <div className="mb-5 flex gap-2 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200 lg:hidden">
            <button
              type="button"
              onClick={() => setActiveTab("overview")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                activeTab === "overview"
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("outlets")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                activeTab === "outlets"
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Outlets
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("coupons")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                activeTab === "coupons"
                  ? "bg-orange-100 text-orange-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Coupons
            </button>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              disabled={signingOut}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {signingOut ? "..." : "Sign out"}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p>{error}</p>

              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
                className="font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Success message */}
          {notice && (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <p>{notice}</p>

              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
                className="font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* Loading state */}
          {loading ? (
            <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 ring-1 ring-slate-200">
              Loading Admin workspace...
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <AdminOverview
                  outlets={outlets}
                  onViewOutlets={() => setActiveTab("outlets")}
                />
              )}

              {activeTab === "outlets" && (
                <OutletsTable
                  outlets={outlets}
                  onAddOutlet={openCreateOutlet}
                />
              )}
              {activeTab === "coupons" && (
                <AdminCoupons getToken={getBearerToken} />
              )}
            </>
          )}
        </section>
      </main>

      {/* Create outlet modal */}
      <CreateOutletDialog
        open={showCreateOutlet}
        form={form}
        saving={saving}
        onChange={handleFormChange}
        onClose={() => setShowCreateOutlet(false)}
        onSubmit={handleCreateOutlet}
      />
    </div>
  );
}
