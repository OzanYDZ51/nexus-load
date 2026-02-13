"use client";

import { useNexusStore } from "@/lib/store";

export function StatCards() {
  const history = useNexusStore((s) => s.history);

  const totalOrders = history.length;
  const totalTrucks = history.reduce((s, h) => s + h.trucks, 0);
  const avgEff =
    totalOrders > 0
      ? history.reduce((s, h) => s + h.efficiency, 0) / totalOrders
      : 0;
  const totalVol = history.reduce((s, h) => s + h.volume, 0);

  const stats = [
    {
      icon: "📦",
      value: totalOrders.toString(),
      label: "Commandes traitées",
      bg: "bg-primary-dim",
      color: "text-primary-cyan",
    },
    {
      icon: "🚚",
      value: totalTrucks.toString(),
      label: "Camions utilisés",
      bg: "bg-secondary-dim",
      color: "text-secondary-purple",
    },
    {
      icon: "⚡",
      value: avgEff.toFixed(1) + "%",
      label: "Efficacité moyenne",
      bg: "bg-[rgba(0,255,136,0.15)]",
      color: "text-success",
    },
    {
      icon: "📈",
      value: totalVol.toFixed(1),
      label: "m³ optimisés",
      bg: "bg-accent-dim",
      color: "text-accent-pink",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-glass-bg backdrop-blur-[20px] border border-glass-border rounded-[14px] p-6 relative overflow-hidden"
        >
          <div
            className={`w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] mb-3.5 ${stat.bg} ${stat.color}`}
          >
            {stat.icon}
          </div>
          <div className="font-[family-name:var(--font-display)] text-[30px] font-black text-text-primary mb-1">
            {stat.value}
          </div>
          <div className="text-[13px] text-text-secondary font-medium">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
