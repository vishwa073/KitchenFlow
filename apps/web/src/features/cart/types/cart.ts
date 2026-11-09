import type {
  MenuItem,
  MenuVariant,
} from "../../menu/types/menu";

export interface CartAddon {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  selectedVariant: MenuVariant;
  selectedAddons: CartAddon[];
  quantity: number;
}

export interface Cart {
  id?: string;
  outletId: string;
  items: CartItem[];
}