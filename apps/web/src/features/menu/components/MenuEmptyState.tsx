interface MenuEmptyStateProps {
  title?: string;
  message?: string;
}

export default function MenuEmptyState({
  title = "No menu items found",
  message = "Try another category or search for a different dish.",
}: MenuEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{message}</p>
    </div>
  );
}