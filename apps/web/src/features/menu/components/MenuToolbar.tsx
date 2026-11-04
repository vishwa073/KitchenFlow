import MenuCategoryTabs from "./MenuCategoryTabs";
import MenuSearch from "./MenuSearch";

interface MenuToolbarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export default function MenuToolbar({
  categories,
  selectedCategory,
  onSelectCategory,
  search,
  onSearchChange,
}: MenuToolbarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <MenuCategoryTabs
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={onSelectCategory}
      />

      <MenuSearch value={search} onChange={onSearchChange} />
    </div>
  );
}