import type {
  MenuItem,
  MenuVariant,
} from "../../menu/types/menu";

export interface CartItem {
  id: string; // Database CartItem.id
  menuItem: MenuItem;
  selectedVariant: MenuVariant;
  quantity: number;
}

export interface Cart {
  id?: string; // Database Cart.id
  outletId: string;
  items: CartItem[];
}