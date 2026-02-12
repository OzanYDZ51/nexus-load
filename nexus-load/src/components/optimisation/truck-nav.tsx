"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export function TruckNav() {
  const trucks = useNexusStore((s) => s.optimizationResults);
  const currentIndex = useNexusStore((s) => s.currentTruckIndex);
  const setIndex = useNexusStore((s) => s.setCurrentTruckIndex);

  if (!trucks || trucks.length === 0) return null;

  function prev() {
    setIndex((currentIndex - 1 + trucks!.length) % trucks!.length);
  }

  function next() {
    setIndex((currentIndex + 1) % trucks!.length);
  }

  return (
    <div className="flex items-center justify-center gap-4 py-4 border-t border-border-subtle bg-glass-bg rounded-b-[20px] -mt-7 mb-7">
      <button
        onClick={prev}
        className="w-9 h-9 flex items-center justify-center bg-bg-card border border-glass-border rounded-[10px] text-text-primary transition-all duration-200 hover:border-border-glow hover:bg-bg-hover cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="font-[family-name:var(--font-display)] text-[13px] font-bold tracking-wider text-text-primary min-w-[160px] text-center">
        Camion {currentIndex + 1} / {trucks.length}
      </span>
      <button
        onClick={next}
        className="w-9 h-9 flex items-center justify-center bg-bg-card border border-glass-border rounded-[10px] text-text-primary transition-all duration-200 hover:border-border-glow hover:bg-bg-hover cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
