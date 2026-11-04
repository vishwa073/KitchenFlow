
import { Plus } from "lucide-react";

import { useAdminMenu } from "../../../hooks/useAdminMenu";

import MenuStats from "./components/MenuStats";
import MenuFilters from "./components/MenuFilters";
import MenuItemsTable from "./components/MenuItemsTable";
import MenuItemFormModal from "./components/MenuItemFormModal";

export default function AdminMenuPage() {
  const {
    items,
    filteredItems,
    outlets,
    categories,
    filters,
    setFilters,
    isModalOpen,
    editingItem,
    form,
    openAddModal,
    openEditModal,
    closeModal,
    updateForm,
    handleSave,
    toggleAvailability,
    deleteMenuItem,
  } = useAdminMenu();

  const availableCount = items.filter((item) => item.isAvailable).length;
  const unavailableCount = items.length - availableCount;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-orange-600">
              KitchenFlow Admin
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Menu Management
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage food items, prices, and availability across outlets.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <Plus size={18} />
            Add menu item
          </button>
        </div>

        {/* Statistics */}
        <MenuStats
          total={items.length}
          available={availableCount}
          unavailable={unavailableCount}
        />

        {/* Filters */}
        <MenuFilters
          search={filters.search}
          outletId={filters.outletId}
          category={filters.category}
          showUnavailable={filters.showUnavailable}
          outlets={outlets}
          categories={categories}
          onSearchChange={(value) =>
            setFilters((current) => ({ ...current, search: value }))
          }
          onOutletChange={(value) =>
            setFilters((current) => ({ ...current, outletId: value }))
          }
          onCategoryChange={(value) =>
            setFilters((current) => ({ ...current, category: value }))
          }
          onShowUnavailableChange={(value) =>
            setFilters((current) => ({
              ...current,
              showUnavailable: value,
            }))
          }
        />

        {/* Menu items */}
        <MenuItemsTable
          items={filteredItems}
          outlets={outlets}
          onEdit={openEditModal}
          onToggleAvailability={toggleAvailability}
          onDelete={deleteMenuItem}
        />
      </div>

      {/* Add / Edit modal */}
      <MenuItemFormModal
        isOpen={isModalOpen}
        editingItem={editingItem}
        form={form}
        outlets={outlets}
        categories={categories}
        onChange={updateForm}
        onSubmit={handleSave}
        onClose={closeModal}
      />
    </div>
  );
}
