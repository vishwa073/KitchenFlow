import type { ManagerMenuItem } from "../types/adminMenu";
import type {
  AdminMenuService,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "../types/adminMenu";

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  item?: T;
  items?: T[];
};

let getAccessToken: (() => Promise<string | null>) | undefined;

export function configureAdminMenuAuth(
  tokenGetter: () => Promise<string | null>,
) {
  getAccessToken = tokenGetter;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getAccessToken?.();

  if (!token) {
    throw new Error("Your session expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const payload = (await response
    .json()
    .catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || payload?.success === false) {
    throw new Error(payload?.message ?? `Request failed (${response.status}).`);
  }

  return payload as T;
}

export const adminMenuService: AdminMenuService = {
  async getAll() {
    const payload = await apiRequest<{
      success: boolean;
      items: ManagerMenuItem[];
    }>("/api/management/manager/menu-items");

    return payload.items;
  },

  async create(input: CreateMenuItemInput) {
    const payload = await apiRequest<{
      success: boolean;
      item: ManagerMenuItem;
    }>("/api/management/manager/menu-items", {
      method: "POST",
      body: JSON.stringify(input),
    });

    return payload.item;
  },

  async update(id: string, input: UpdateMenuItemInput) {
    const payload = await apiRequest<{
      success: boolean;
      item: ManagerMenuItem;
    }>(`/api/management/manager/menu-items/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });

    return payload.item;
  },

  async toggleAvailability(_id: string) {
    throw new Error(
      "Use toggleOutletAvailability(outletId, menuItemId, isAvailable) for outlet-specific availability.",
    );
  },

  async delete(id: string) {
    await apiRequest<{ success: boolean }>(
      `/api/management/manager/menu-items/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },
};

export async function toggleOutletAvailability(
  outletId: string,
  menuItemId: string,
  isAvailable: boolean,
) {
  return apiRequest<{
    success: boolean;
    item: {
      id: string;
      outletId: string;
      menuItemId: string;
      isAvailable: boolean;
    };
  }>(
    `/api/management/outlets/${encodeURIComponent(outletId)}/menu-items/${encodeURIComponent(menuItemId)}/availability`,
    {
      method: "PATCH",
      body: JSON.stringify({ isAvailable }),
    },
  );
}
