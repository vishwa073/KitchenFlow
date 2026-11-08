
import { useEffect, useMemo, useRef, useState } from "react";
import type { MenuItem } from "../features/menu/types/menu";
import { useApi } from "../lib/api";

interface MenuApiResponse {
  success: boolean;
  count: number;
  items: MenuItem[];
  message?: string;
}

export function useMenu(outletId: string | undefined) {
  const { apiFetch } = useApi();

  // Keep the latest API function without restarting the fetch effect
  // whenever its reference changes.
  const apiFetchRef = useRef(apiFetch);
  apiFetchRef.current = apiFetch;

  const [items, setItems] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(Boolean(outletId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMenu() {
      if (!outletId) {
        setItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setItems([]);

      try {
        const response = await apiFetchRef.current(
          `/api/menu/${outletId}`,
        );

        const data = (await response.json()) as MenuApiResponse;

        if (!response.ok || !data.success) {
          throw new Error(data.message ?? "Unable to load menu.");
        }

        if (!Array.isArray(data.items)) {
          throw new Error("The menu API returned an invalid items list.");
        }

        if (!cancelled) {
          setItems(data.items);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load the menu. Please try again.",
          );
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
    [items],
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
