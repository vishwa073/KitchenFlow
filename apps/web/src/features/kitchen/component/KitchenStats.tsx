type KitchenStatsProps = {
  incoming: number;
  preparing: number;
  ready: number;
};

const stats = [
  {
    key: "incoming",
    label: "Incoming",
    color: "border-blue-500",
  },
  {
    key: "preparing",
    label: "Preparing",
    color: "border-amber-500",
  },
  {
    key: "ready",
    label: "Ready",
    color: "border-green-500",
  },
] as const;

export default function KitchenStats({
  incoming,
  preparing,
  ready,
}: KitchenStatsProps) {
  const values = { incoming, preparing, ready };

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className={`rounded-xl border border-gray-200 border-l-4 ${stat.color} bg-white p-4 shadow-sm`}
        >
          <p className="text-sm font-medium text-gray-500">
            {stat.label}
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-900">
            {values[stat.key]}
          </p>
        </div>
      ))}
    </section>
  );
}