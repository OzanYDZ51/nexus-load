"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { useNexusStore } from "@/lib/store";
import { TRUCK, TRUCK_VOLUME } from "@/lib/constants";
import { binPack3D } from "@/lib/optimizer";
import { generateId } from "@/lib/utils";
import { AIModal } from "@/components/ai-modal";

export function OrderSummary() {
  const order = useNexusStore((s) => s.order);
  const setOptimizationResults = useNexusStore((s) => s.setOptimizationResults);
  const addHistoryEntry = useNexusStore((s) => s.addHistoryEntry);
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  if (order.length === 0) return null;

  const totalItems = order.reduce((s, i) => s + i.qty, 0);
  const totalWeight = order.reduce((s, i) => s + i.poids * i.qty, 0);
  const totalVolume = order.reduce((s, i) => s + i.volume * i.qty, 0);
  const estTrucks = Math.max(
    Math.ceil(totalVolume / TRUCK_VOLUME),
    Math.ceil(totalWeight / TRUCK.maxWeight)
  );

  const handleOptimize = useCallback(() => {
    if (order.length === 0) return;
    setShowModal(true);
  }, [order.length]);

  const handleModalComplete = useCallback(() => {
    const trucks = binPack3D(order);
    setOptimizationResults(trucks);

    const usedVolume = trucks.reduce(
      (s, t) => s + t.items.reduce((ss, it) => ss + it.volume, 0),
      0
    );
    const avgFill =
      trucks.length > 0 ? (usedVolume / (trucks.length * TRUCK_VOLUME)) * 100 : 0;

    addHistoryEntry({
      id: generateId(),
      date: new Date().toLocaleString("fr-FR"),
      items: totalItems,
      weight: totalWeight,
      volume: totalVolume,
      trucks: trucks.length,
      efficiency: avgFill,
    });

    setShowModal(false);
    router.push("/optimisation");
  }, [
    order,
    setOptimizationResults,
    addHistoryEntry,
    totalItems,
    totalWeight,
    totalVolume,
    router,
  ]);

  return (
    <>
      {/* Summary */}
      <div className="mt-5 p-5 bg-[rgba(0,240,255,0.03)] border border-border-glow rounded-[14px]">
        {[
          { label: "Articles", value: totalItems.toString() },
          {
            label: "Poids total",
            value:
              totalWeight.toLocaleString("fr-FR", {
                maximumFractionDigits: 1,
              }) + " kg",
          },
          { label: "Volume total", value: totalVolume.toFixed(2) + " m³" },
          { label: "Estimation camions", value: "~" + estTrucks },
        ].map((row) => (
          <div
            key={row.label}
            className="flex justify-between items-center py-1.5 text-sm"
          >
            <span className="text-text-secondary">{row.label}</span>
            <span className="font-[family-name:var(--font-mono)] font-bold text-primary-cyan">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Optimize button */}
      <div className="mt-6">
        <button
          onClick={handleOptimize}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-br from-secondary-purple to-accent-pink text-white font-[family-name:var(--font-display)] text-sm tracking-[2px] px-9 py-4 rounded-[14px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02]"
          style={{ animation: "btnGlow 3s ease-in-out infinite" }}
        >
          <Zap className="w-5 h-5" />
          LANCER L&apos;OPTIMISATION IA
        </button>
      </div>

      <AIModal open={showModal} onComplete={handleModalComplete} />
    </>
  );
}
