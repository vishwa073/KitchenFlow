
import { useCallback, useEffect, useMemo, useState } from "react";

import { adminMenuService } from "../features/admin/menu/services/adminMenuService";

import type { MenuItem } from "../features/menu/types/menu";

import type {
  CreateMenuItemInput,
  UpdateMenuItemInput,
  MenuFilters,
} from "../features/admin/menu/types/adminMenu";

import type { MenuFormData } from "../features/admin/menu/types/menuForm";

import { outlets } from "../features/outlets/data/outlets";

const emptyForm: MenuFormData = {
  name: "",
  description: "",
  price: "",
  category: "Biryani",
  outletId: outlets[0]?.id ?? "",
  isVegetarian: false,
  isPopular: false,
};

export function useAdminMenu() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<MenuFilters>({
    search: "",
    outletId: "All",
    category: "All",
    showUnavailable: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<MenuFormData>(emptyForm);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await adminMenuService.getAll();
      setItems(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load menu items."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const createItem = async (input: CreateMenuItemInput) => {
    const createdItem = await adminMenuService.create(input);
    setItems((current) => [createdItem, ...current]);
    return createdItem;
  };

  const updateItem = async (
    id: string,
    input: UpdateMenuItemInput
  ) => {
    const updatedItem = await adminMenuService.update(id, input);

    setItems((current) =>
      current.map((item) => (item.id === id ? updatedItem : item))
    );

    return updatedItem;
  };

  const toggleAvailability = async (id: string) => {
    const updatedItem = await adminMenuService.toggleAvailability(id);

    setItems((current) =>
      current.map((item) => (item.id === id ? updatedItem : item))
    );

    return updatedItem;
  };

  const deleteItem = async (id: string) => {
    await adminMenuService.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  const stats = useMemo(() => {
    const available = items.filter((item) => item.isAvailable).length;

    return {
      total: items.length,
      available,
      unavailable: items.length - available,
    };
  }, [items]);

  const categories = useMemo(
    () => ["All", ...new Set(items.map((item) => item.category))],
    [items]
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const search = filters.search.toLowerCase().trim();

      const matchesSearch =
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);

      const matchesOutlet =
        filters.outletId === "All" || item.outletId === filters.outletId;

      const matchesCategory =
        filters.category === "All" || item.category === filters.category;

      const matchesAvailability =
        filters.showUnavailable || item.isAvailable;

      return (
        matchesSearch &&
        matchesOutlet &&
        matchesCategory &&
        matchesAvailability
      );
    });
  }, [items, filters]);

  const openAddModal = () => {
    setEditingItem(null);

    setForm({
      ...emptyForm,
      outletId:
        filters.outletId === "All"
          ? outlets[0]?.id ?? ""
          : filters.outletId,
    });

    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);

    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category,
      outletId: item.outletId,
      isVegetarian: item.isVegetarian,
      isPopular: item.isPopular,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const updateForm = <K extends keyof MenuFormData>(
    key: K,
    value: MenuFormData[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedPrice = Number(form.price);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      !form.outletId ||
      !Number.isFinite(parsedPrice) ||
      parsedPrice <= 0
    ) {
      setError("Please enter valid menu item details.");
      return;
    }

    const commonFields = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parsedPrice,
      category: form.category.trim(),
      outletId: form.outletId,
      isVegetarian: form.isVegetarian,
      isPopular: form.isPopular,
    };

    try {
      setError(null);

      if (editingItem) {
        await updateItem(editingItem.id, commonFields);
      } else {
        const newItem: CreateMenuItemInput = {
          ...commonFields,
          image:
            "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
          isAvailable: true,
        };

        await createItem(newItem);
      }

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save menu item."
      );
    }
  };

  const deleteMenuItem = async (id: string) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!shouldDelete) return;

    try {
      setError(null);
      await deleteItem(id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete menu item."
      );
    }
  };

  return {
    items,
    filteredItems,
    outlets,
    categories,
    filters,
    setFilters,

    stats,
    isLoading,
    error,
    reload: loadItems,

    isModalOpen,
    editingItem,
    form,

    openAddModal,
    openEditModal,
    closeModal,
    updateForm,
    handleSave,

    createItem,
    updateItem,
    toggleAvailability,
    deleteItem,
    deleteMenuItem,
  };
}
