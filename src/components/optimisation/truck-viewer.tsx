"use client";

import dynamic from "next/dynamic";
import { useNexusStore } from "@/lib/store";

const TruckScene = dynamic(
  () =>
    import("./truck-scene").then((mod) => mod.TruckScene),
  { ssr: false, loading: () => <div className="h-[500px] bg-bg-deep flex items-center justify-center text-text-dim">Chargement 3D...</div> }
);

export function TruckViewer() {
  const trucks = useNexusStore((s) => s.optimizationResults);
  const currentIndex = useNexusStore((s) => s.currentTruckIndex);

  if (!trucks || trucks.length === 0) return null;

  const truck = trucks[currentIndex];

  return (
    <div className="bg-glass-bg border border-glass-border rounded-[20px] overflow-hidden relative mb-7">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
        <div className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[2px] text-primary-cyan">
          VISUALISATION 3D DU CHARGEMENT
        </div>
      </div>
      <TruckScene truck={truck} truckIndex={currentIndex} />
    </div>
  );
}
