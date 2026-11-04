
import { Eye, EyeOff, Utensils } from "lucide-react";

type MenuStatsProps = {
  total: number;
  available: number;
  unavailable: number;
};

type StatCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
};

function StatCard({ label, value, icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className={`rounded-xl bg-slate-50 p-3 ${accent}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function MenuStats({
  total,
  available,
  unavailable,
}: MenuStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard
        label="Total menu items"
        value={total}
        icon={<Utensils size={20} />}
        accent="text-orange-600"
      />

      <StatCard
        label="Available"
        value={available}
        icon={<Eye size={20} />}
        accent="text-emerald-600"
      />

      <StatCard
        label="Unavailable"
        value={unavailable}
        icon={<EyeOff size={20} />}
        accent="text-rose-600"
      />
    </div>
  );
}
