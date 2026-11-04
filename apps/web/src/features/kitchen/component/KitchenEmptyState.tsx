type KitchenEmptyStateProps = {
  message?: string;
};

export default function KitchenEmptyState({
  message = "No active orders for this outlet.",
}: KitchenEmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-gray-800">
        All caught up!
      </h3>

      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}