import { menuItems as initialMenuItems } from "../../../menu/data/menuItems";
import type { MenuItem } from "../../../menu/types/menu";
import type {
  AdminMenuService,
  CreateMenuItemInput,
  UpdateMenuItemInput,
} from "../types/adminMenu";

let items: MenuItem[] = [...initialMenuItems];

const delay = (ms = 150) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const mockAdminMenuService: AdminMenuService = {
  async getAll() {
    await delay();
    return [...items];
  },

  async create(input: CreateMenuItemInput) {
    await delay();

    const newItem: MenuItem = {
      ...input,
      id: crypto.randomUUID(),
    };

    items = [newItem, ...items];
    return newItem;
  },

  async update(id: string, input: UpdateMenuItemInput) {
    await delay();

    const existingItem = items.find((item) => item.id === id);

    if (!existingItem) {
      throw new Error("Menu item not found.");
    }

    const updatedItem = {
      ...existingItem,
      ...input,
    };

    items = items.map((item) => (item.id === id ? updatedItem : item));

    return updatedItem;
  },

  async toggleAvailability(id: string) {
    await delay();

    const existingItem = items.find((item) => item.id === id);

    if (!existingItem) {
      throw new Error("Menu item not found.");
    }

    const updatedItem: MenuItem = {
      ...existingItem,
      isAvailable: !existingItem.isAvailable,
    };

    items = items.map((item) => (item.id === id ? updatedItem : item));

    return updatedItem;
  },

  async delete(id: string) {
    await delay();

    const exists = items.some((item) => item.id === id);

    if (!exists) {
      throw new Error("Menu item not found.");
    }

    items = items.filter((item) => item.id !== id);
  },
};