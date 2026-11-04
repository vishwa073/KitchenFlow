import type { MenuItem } from "../../../menu/types/menu";

export type MenuFormData = {
  name: string;
  description: string;
  price: string;
  category: string;
  outletId: string;
  isVegetarian: boolean;
  isPopular: boolean;
};

export type MenuFilters = {
  search: string;
  outletId: string;
  category: string;
  showUnavailable: boolean;
};

export type CreateMenuItemInput = Omit<MenuItem, "id">;

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export type AdminMenuService = {
  getAll(): Promise<MenuItem[]>;
  create(input: CreateMenuItemInput): Promise<MenuItem>;
  update(id: string, input: UpdateMenuItemInput): Promise<MenuItem>;
  toggleAvailability(id: string): Promise<MenuItem>;
  delete(id: string): Promise<void>;
};