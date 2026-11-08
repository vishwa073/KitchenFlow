import type { MenuItem, MenuVariant } from "../types/menu";
import MenuItemCard from "./MenuItemCard";

interface MenuGridProps {
  items: MenuItem[];
  onAddToCart: (item: MenuItem, variant: MenuVariant) => void;
}

export default function MenuGrid({
  items,
  onAddToCart,
}: MenuGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <MenuItemCard
          key={item.id}
          item={item}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}