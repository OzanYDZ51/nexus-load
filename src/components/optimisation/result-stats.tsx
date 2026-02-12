"use client";

import { useNexusStore } from "@/lib/store";
import { TRUCK_VOLUME } from "@/lib/constants";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

function StatCard({
  icon,
  value,
  suffix,
  label,
  decimals = 0,
}: {
  icon: string;
  value: number;
  suffix?: string;
  label: string;
  decimals?: number;
}) {
  const animated = useAnimatedCounter(value, 1200, decimals);

  return (
    <div className="bg-glass-bg backdrop-blur-[20px] border border-glass-border rounded-[14px] p-6 text-center transition-all duration-400 relative overflow-hidden hover:-translate-y-1 hover:border-border-glow hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]">
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-cyan to-secondary-purple" />
      <span className="text-[28px] block mb-2.5">{icon}</span>
      <div className="font-[family-name:var(--font-display)] text-4xl font-black gradient-text mb-1">
        {animated}
        {suffix}
      </div>
      <div className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
        {label}
      </div>
    </div>
  );
}

export function ResultStats() {
  const trucks = useNexusStore((s) => s.optimizationResults);

  if (!trucks) return null;

  const totalItems = trucks.reduce((s, t) => s + t.items.length, 0);
  const totalWeight = trucks.reduce(
    (s, t) => s + t.items.reduce((ss, it) => ss + it.poids, 0),
    0
  );
  const usedVolume = trucks.reduce(
    (s, t) => s + t.items.reduce((ss, it) => ss + it.volume, 0),
    0
  );
  const avgFill =
    trucks.length > 0
      ? (usedVolume / (trucks.length * TRUCK_VOLUME)) * 100
      : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
      <StatCard
        icon="\uD83D\uDE9A"
        value={trucks.length}
        label="Camions nécessaires"
      />
      <StatCard icon="\uD83D\uDCE6" value={totalItems} label="Articles placés" />
      <StatCard
        icon="\u26A1"
        value={avgFill}
        suffix="%"
        label="Taux d'optimisation"
        decimals={0}
      />
      <StatCard
        icon="\u2696"
        value={totalWeight / 1000}
        suffix="t"
        label="Poids total"
        decimals={1}
      />
    </div>
  );
}
