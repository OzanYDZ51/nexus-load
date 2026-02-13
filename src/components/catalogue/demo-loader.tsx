"use client";

import { Play } from "lucide-react";
import { toast } from "sonner";
import { DEMO_REFS, DEMO_NAMES } from "@/lib/constants";
import { useNexusStore } from "@/lib/store";
import type { Product } from "@/lib/types";

export function DemoLoader() {
  const setCatalog = useNexusStore((s) => s.setCatalog);

  function loadDemo() {
    // References that are physically stackable (~30%)
    const STACKABLE_REFS: Record<string, number> = {
      "BLK-010": 3, "BLK-011": 2, "BLK-012": 2,
      "BOX-040": 2, "BOX-041": 3, "PLT-030": 2,
    };

    const products: Product[] = DEMO_REFS.map((ref, i) => {
      const l = +(Math.random() * 3 + 0.5).toFixed(2);
      const w = +(Math.random() * 1.5 + 0.3).toFixed(2);
      const h = +(Math.random() * 1.5 + 0.2).toFixed(2);
      const p = +(Math.random() * 800 + 50).toFixed(1);
      const stackLevels = STACKABLE_REFS[ref];
      return {
        reference: ref,
        name: DEMO_NAMES[i],
        poids: p,
        longueur: l,
        largeur: w,
        hauteur: h,
        volume: +(l * w * h).toFixed(4),
        ...(stackLevels ? { stackable: true, maxStackLevels: stackLevels } : {}),
      };
    });

    setCatalog(products);
    toast.success(`${products.length} produits de démonstration chargés`);
  }

  return (
    <div className="mt-5 text-center">
      <button
        onClick={loadDemo}
        className="inline-flex items-center gap-2.5 px-6 py-3 bg-bg-card text-text-primary border border-glass-border rounded-lg text-sm font-bold transition-all duration-200 hover:border-border-glow hover:bg-bg-hover cursor-pointer"
      >
        <Play className="w-4 h-4" />
        Charger données de démonstration
      </button>
    </div>
  );
}
