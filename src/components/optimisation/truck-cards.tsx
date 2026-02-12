"use client";

import { useEffect, useRef } from "react";
import { useNexusStore } from "@/lib/store";
import { TRUCK, TRUCK_VOLUME } from "@/lib/constants";
import { hexToString } from "@/lib/utils";

function ProgressBar({
  fill,
  gradient,
}: {
  fill: number;
  gradient: string;
}) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${fill}%`;
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [fill]);

  return (
    <div className="w-full h-2 bg-bg-card rounded overflow-hidden mb-1.5">
      <div
        ref={barRef}
        className="h-full rounded relative transition-[width] duration-[1.5s] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          width: "0%",
          background: gradient,
        }}
      />
    </div>
  );
}

export function TruckCards() {
  const trucks = useNexusStore((s) => s.optimizationResults);

  if (!trucks) return null;

  return (
    <>
      <h3 className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[2px] text-text-secondary mb-5">
        DÉTAIL PAR CAMION
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {trucks.map((truck, i) => {
          const truckVolume = truck.items.reduce(
            (s, it) => s + it.volume,
            0
          );
          const fillPct = +((truckVolume / TRUCK_VOLUME) * 100).toFixed(1);
          const weightPct = +(
            (truck.currentWeight / TRUCK.maxWeight) *
            100
          ).toFixed(1);
          const fillClass =
            fillPct >= 70
              ? "fill-high"
              : fillPct >= 40
                ? "fill-medium"
                : "fill-low";

          // Group items by reference
          const itemCounts: Record<
            string,
            { count: number; color: number; volume: number; weight: number }
          > = {};
          for (const it of truck.items) {
            if (!itemCounts[it.reference]) {
              itemCounts[it.reference] = {
                count: 0,
                color: it.color,
                volume: 0,
                weight: 0,
              };
            }
            itemCounts[it.reference].count++;
            itemCounts[it.reference].volume += it.volume;
            itemCounts[it.reference].weight += it.poids;
          }

          return (
            <div
              key={i}
              className="bg-glass-bg border border-glass-border rounded-[14px] p-6 transition-all duration-400 hover:border-border-glow hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-[18px]">
                <span className="font-[family-name:var(--font-display)] text-base font-extrabold tracking-wider text-primary-cyan">
                  CAMION {i + 1}
                </span>
                <span
                  className={`px-3 py-1 rounded-xl font-[family-name:var(--font-mono)] text-xs font-bold ${fillClass}`}
                >
                  {fillPct}% rempli
                </span>
              </div>

              {/* Volume progress */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-text-dim mb-1 font-[family-name:var(--font-mono)]">
                  <span>
                    Volume: {truckVolume.toFixed(2)} / {TRUCK_VOLUME.toFixed(1)}{" "}
                    m³
                  </span>
                  <span>{fillPct}%</span>
                </div>
                <ProgressBar
                  fill={fillPct}
                  gradient="linear-gradient(90deg, var(--color-primary-cyan), var(--color-secondary-purple))"
                />
              </div>

              {/* Weight progress */}
              <div className="mb-3">
                <div className="flex justify-between text-[11px] text-text-dim mb-1 font-[family-name:var(--font-mono)]">
                  <span>
                    Poids: {(truck.currentWeight / 1000).toFixed(2)} /{" "}
                    {TRUCK.maxWeight / 1000} t
                  </span>
                  <span>{weightPct}%</span>
                </div>
                <ProgressBar
                  fill={weightPct}
                  gradient="linear-gradient(90deg, var(--color-secondary-purple), var(--color-accent-pink))"
                />
              </div>

              {/* Items list */}
              <div className="mt-3.5">
                {Object.entries(itemCounts).map(([ref, data]) => (
                  <div
                    key={ref}
                    className="flex items-center justify-between py-2 border-b border-border-subtle last:border-b-0 text-[13px]"
                  >
                    <div>
                      <span
                        className="w-2.5 h-2.5 rounded-[3px] inline-block mr-2"
                        style={{ background: hexToString(data.color) }}
                      />
                      {ref} ×{data.count}
                    </div>
                    <div className="text-text-dim font-[family-name:var(--font-mono)] text-xs">
                      {data.volume.toFixed(2)}m³ / {data.weight.toFixed(0)}kg
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
