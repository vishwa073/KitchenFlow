
import type { MenuItem } from "../types/menu";
import { outlets } from "../../outlets/data/outlets";

const sampleMenu = [
  {
    name: "Hyderabadi Chicken Dum Biryani",
    description:
      "Aromatic basmati rice layered with tender chicken and traditional spices.",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",
    price: 299,
    category: "Biryani",
    isAvailable: true,
    isVegetarian: false,
    isPopular: true,
  },
  {
    name: "Hyderabadi Mutton Dum Biryani",
    description:
      "Slow-cooked mutton dum biryani with fragrant basmati rice.",
    image:
      "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=900&q=80",
    price: 399,
    category: "Biryani",
    isAvailable: true,
    isVegetarian: false,
    isPopular: true,
  },
  {
    name: "Paneer 65",
    description:
      "Crispy paneer bites tossed with curry leaves and spices.",
    image:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=80",
    price: 229,
    category: "Starters",
    isAvailable: true,
    isVegetarian: true,
    isPopular: false,
  },
  {
    name: "Chicken 65",
    description:
      "Crispy chicken pieces with classic South Indian seasoning.",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    price: 249,
    category: "Starters",
    isAvailable: true,
    isVegetarian: false,
    isPopular: true,
  },
  {
    name: "Double Ka Meetha",
    description:
      "Traditional Hyderabadi bread pudding with a rich, sweet finish.",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    price: 129,
    category: "Desserts",
    isAvailable: true,
    isVegetarian: true,
    isPopular: false,
  },
  {
    name: "Irani Chai",
    description:
      "A comforting cup of rich and creamy Irani-style tea.",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    price: 59,
    category: "Beverages",
    isAvailable: true,
    isVegetarian: true,
    isPopular: false,
  },
];

export const menuItems: MenuItem[] = outlets.flatMap((outlet) =>
  sampleMenu.map((item, index) => ({
    ...item,
    id: `${outlet.id}-item-${index + 1}`,
    outletId: outlet.id,
  }))
);
