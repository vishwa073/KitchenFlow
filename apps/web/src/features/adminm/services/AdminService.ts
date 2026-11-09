const API_BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const MANAGEMENT = `${API_BASE}/api/management`;

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${MANAGEMENT}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message ?? `Request failed (${response.status})`,
    );
  }

  return data as T;
}

export type AdminOutlet = {
  id: string;
  name: string;
  code: string;
  address: string;
  area: string;
  postalCode: string;
  phone?: string | null;
  isCloudKitchen?: boolean;
  city?: {
    name: string;
    state: string;
  };
  _count?: {
    orders: number;
    staff: number;
    menuItems: number;
  };
};

export type CreateOutletInput = {
  name: string;
  code: string;
  cityId: string;
  address: string;
  area: string;
  postalCode: string;
  phone?: string;
  isCloudKitchen: boolean;
};

export type PartyStatus =
  | "REVIEWING"
  | "QUOTED"
  | "CONFIRMED"
  | "REJECTED";

export type PartyRequest = {
  id: string;
  status: PartyStatus;
  eventAt?: string | null;
  guestCount?: number | null;
  description?: string | null;
  notes?: string | null;
  quoteAmount?: number | string | null;
  managerNotes?: string | null;

  customer?: {
    fullName?: string | null;
    email?: string | null;
    phone?: string | null;
  };

  outlet?: {
    id: string;
    name: string;
    code?: string;
  };
};

export async function getAdminOutlets(
  token: string,
): Promise<AdminOutlet[]> {
  const data = await request<{ outlets: AdminOutlet[] }>(
    token,
    "/admin/outlets",
  );

  return data.outlets;
}

export async function createAdminOutlet(
  token: string,
  input: CreateOutletInput,
): Promise<AdminOutlet> {
  const data = await request<{ outlet: AdminOutlet }>(
    token,
    "/admin/outlets",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return data.outlet;
}

export async function getPartyRequests(
  token: string,
): Promise<PartyRequest[]> {
  const data = await request<{ requests: PartyRequest[] }>(
    token,
    "/party-requests",
  );

  return data.requests;
}

export async function updatePartyRequest(
  token: string,
  id: string,
  input: {
    status: PartyStatus;
    quoteAmount?: number;
    managerNotes?: string;
  },
): Promise<PartyRequest> {
  const data = await request<{ request: PartyRequest }>(
    token,
    `/party-requests/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return data.request;
}
export type AdminCoupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  startsAt: string;
  expiresAt: string;
  usageLimit: number | null;
  perUserLimit: number | null;
  isActive: boolean;
  createdAt: string;
};

export type CreateCouponInput = {
  code: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number;
  maxDiscount?: number | null;
  minOrderAmount?: number;
  startsAt: string;
  expiresAt: string;
  usageLimit?: number | null;
  perUserLimit?: number | null;
};

export async function getAdminCoupons(
  token: string,
): Promise<AdminCoupon[]> {
  const data = await request<{ coupons: AdminCoupon[] }>(
    token,
    "/admin/coupons",
  );

  return data.coupons;
}

export async function createAdminCoupon(
  token: string,
  input: CreateCouponInput,
): Promise<AdminCoupon> {
  const data = await request<{ coupon: AdminCoupon }>(
    token,
    "/admin/coupons",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return data.coupon;
}

export async function deleteAdminCoupon(
  token: string,
  id: string,
): Promise<void> {
  await request<{ message: string }>(
    token,
    `/admin/coupons/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}