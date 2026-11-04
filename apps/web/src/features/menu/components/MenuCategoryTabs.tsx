interface MenuCategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function MenuCategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuCategoryTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {categories.map((category) => {
        const selected = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              selected
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-orange-50"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}