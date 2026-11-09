
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import {
  getAdminCoupons,
  createAdminCoupon,
  deleteAdminCoupon,
  type AdminCoupon,
  type CreateCouponInput,
} from "../services/AdminService";

type Props = {
  getToken: () => Promise<string>;
};

const initialForm: CreateCouponInput = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  maxDiscount: null,
  minOrderAmount: 0,
  startsAt: "",
  expiresAt: "",
  usageLimit: null,
  perUserLimit: null,
};

export default function AdminCoupons({ getToken }: Props) {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [form, setForm] = useState<CreateCouponInput>(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      setCoupons(await getAdminCoupons(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load coupons.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  function update<K extends keyof CreateCouponInput>(
    key: K,
    value: CreateCouponInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const token = await getToken();

      await createAdminCoupon(token, {
        ...form,
        code: form.code.trim().toUpperCase(),
        description: form.description?.trim() || undefined,
        discountValue: Number(form.discountValue),
        maxDiscount:
          form.maxDiscount === null || form.maxDiscount === undefined
            ? null
            : Number(form.maxDiscount),
        minOrderAmount: Number(form.minOrderAmount ?? 0),
        usageLimit:
          form.usageLimit === null || form.usageLimit === undefined
            ? null
            : Number(form.usageLimit),
        perUserLimit:
          form.perUserLimit === null || form.perUserLimit === undefined
            ? null
            : Number(form.perUserLimit),
      });

      setForm(initialForm);
      setNotice("Coupon created successfully.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create coupon.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this coupon?")) return;

    setDeletingId(id);
    setError("");
    setNotice("");

    try {
      const token = await getToken();
      await deleteAdminCoupon(token, id);
      setNotice("Coupon deleted.");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete coupon.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Coupons</h2>
        <p className="mt-1 text-sm text-slate-500">
          Create and manage customer discounts.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="grid gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200 md:grid-cols-2"
      >
        <h3 className="font-bold md:col-span-2">Create coupon</h3>

        <label className="text-sm font-medium">
          Coupon code
          <input
            required
            value={form.code}
            onChange={(e) => update("code", e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Description
          <input
            value={form.description ?? ""}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Welcome discount"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Discount type
          <select
            value={form.discountType}
            onChange={(e) =>
              update(
                "discountType",
                e.target.value as CreateCouponInput["discountType"],
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED_AMOUNT">Fixed amount (₹)</option>
          </select>
        </label>

        <label className="text-sm font-medium">
          Discount value
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={form.discountValue}
            onChange={(e) => update("discountValue", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Maximum discount (₹, optional)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.maxDiscount ?? ""}
            onChange={(e) =>
              update(
                "maxDiscount",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Minimum order amount (₹)
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.minOrderAmount ?? 0}
            onChange={(e) => update("minOrderAmount", Number(e.target.value))}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Starts at
          <input
            required
            type="datetime-local"
            value={form.startsAt}
            onChange={(e) => update("startsAt", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Expires at
          <input
            required
            type="datetime-local"
            value={form.expiresAt}
            onChange={(e) => update("expiresAt", e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Total usage limit (optional)
          <input
            type="number"
            min="1"
            step="1"
            value={form.usageLimit ?? ""}
            onChange={(e) =>
              update(
                "usageLimit",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="text-sm font-medium">
          Per-user usage limit (optional)
          <input
            type="number"
            min="1"
            step="1"
            value={form.perUserLimit ?? ""}
            onChange={(e) =>
              update(
                "perUserLimit",
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-orange-600 px-4 py-3 font-semibold text-white hover:bg-orange-700 disabled:opacity-60 md:col-span-2"
        >
          {saving ? "Creating..." : "Create coupon"}
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200">
        <div className="border-b border-slate-100 p-5">
          <h3 className="font-bold">Existing coupons</h3>
        </div>

        {loading ? (
          <p className="p-6 text-sm text-slate-500">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">No coupons created yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-4">Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Validity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="p-4">
                      <p className="font-bold">{coupon.code}</p>
                      <p className="text-xs text-slate-500">
                        {coupon.description || "—"}
                      </p>
                    </td>
                    <td className="p-4">
                      {coupon.discountType === "PERCENTAGE"
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      <div>{new Date(coupon.startsAt).toLocaleString()}</div>
                      <div>to {new Date(coupon.expiresAt).toLocaleString()}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        disabled={deletingId === coupon.id}
                        onClick={() => void handleDelete(coupon.id)}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === coupon.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
