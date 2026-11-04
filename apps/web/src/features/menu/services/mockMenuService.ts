import { menuItems } from "../data/menuItems";
import type { MenuService } from "./menuService";

export const mockMenuService: MenuService = {
  async getMenuByOutlet(outletId) {
    await new Promise((resolve) => setTimeout(resolve, 250));

    return menuItems.filter((item) => item.outletId === outletId);
  },
};