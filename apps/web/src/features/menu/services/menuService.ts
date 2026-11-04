import type { MenuItem } from "../types/menu";

export interface MenuService {
  getMenuByOutlet(outletId: string): Promise<MenuItem[]>;
}