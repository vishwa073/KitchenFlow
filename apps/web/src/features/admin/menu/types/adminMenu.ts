import type { MenuItem } from "../../../menu/types/menu";

export type ManagerMenuItem = MenuItem & {
  /**
   * The ID of the shared MenuItem record in Prisma.
   * This is different from the outlet-specific MenuItem ID.
   */
  menuItemId: string;
};

export type MenuFilters = {
  search: string;
  outletId: string;
  category: string;
  showUnavailable: boolean;
};

export type CreateMenuItemInput = Omit<MenuItem, "id"> & {
  menuItemId: string;
  variants: Array<Record<string, unknown>>;
  addons: Array<Record<string, unknown>>;
};

export type UpdateMenuItemInput = Partial<CreateMenuItemInput>;

export type AdminMenuService = {
  getAll(): Promise<ManagerMenuItem[]>;
  create(input: CreateMenuItemInput): Promise<ManagerMenuItem>;
  update(
    id: string,
    input: UpdateMenuItemInput,
  ): Promise<ManagerMenuItem>;
  toggleAvailability(
    outletId: string,
    menuItemId: string,
    isAvailable: boolean,
  ): Promise<ManagerMenuItem>;
  delete(id: string): Promise<void>;
};