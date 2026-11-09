export interface MenuVariant {
  id: string; // OutletVariantPrice ID
  variantId: string; // MenuVariant ID
  name: string;
  price: number;
}

export type MenuAddon = {
  id: string; // OutletAddonPrice ID
  addonId: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  isRequired: boolean;
  maxSelect: number;
  sortOrder: number;
};

export interface MenuItem {
  id: string; // OutletMenuItem ID
  outletId: string;
  menuItemId: string; // Global MenuItem ID
  name: string;
  description: string;
  image: string;
  price: number; // Lowest available variant price
  category: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isPopular: boolean;
  variants: MenuVariant[];
  addons: MenuAddon[];
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}