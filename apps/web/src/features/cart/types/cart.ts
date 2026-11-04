
import type { MenuItem } from "../../menu/types/menu";

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Cart {
  outletId: string;
  items: CartItem[];
}
