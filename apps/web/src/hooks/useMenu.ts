import { useEffect, useMemo, useState } from "react";
import type { MenuItem } from "../features/menu/types/menu";
import { mockMenuService } from "../features/menu/services/mockMenuService";

export function useMenu(outletId: string | undefined) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      if (!outletId) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const result =
          await mockMenuService.getMenuByOutlet(outletId);

        if (!cancelled) {
          setItems(result);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load the menu. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMenu();

    return () => {
      cancelled = true;
    };
  }, [outletId]);

  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items]
  );

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "All" ||
        item.category === selectedCategory;

      const matchesSearch =
        item.name.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [items, search, selectedCategory]);

  return {
    items,
    filteredItems,
    categories,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
  };
}