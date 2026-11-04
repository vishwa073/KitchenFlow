
export interface MenuItem {
  id: string;
  outletId: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isPopular: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}
