"use client";

import { useState } from "react";
import { useNexusStore } from "@/lib/store";
import type { Product } from "@/lib/types";

interface ProductSelectorProps {
  onSelect: (product: Product | null) => void;
  selected: Product | null;
}

export function ProductSelector({ onSelect, selected }: ProductSelectorProps) {
  const catalog = useNexusStore((s) => s.catalog);

  return (
    <div className="mb-5">
      <label className="block font-[family-name:var(--font-display)] text-[10px] font-bold tracking-[2px] uppercase text-text-secondary mb-2">
        Référence produit
      </label>
      <select
        value={selected?.reference || ""}
        onChange={(e) => {
          const product = catalog.find((c) => c.reference === e.target.value) || null;
          onSelect(product);
        }}
        className="w-full px-4 py-3 bg-bg-card border border-glass-border rounded-lg text-text-primary font-[family-name:var(--font-body)] text-[15px] font-semibold transition-all duration-200 outline-none focus:border-primary-cyan focus:shadow-[0_0_0_3px_var(--color-primary-dim)] appearance-none cursor-pointer"
      >
        <option value="">— Sélectionnez une référence —</option>
        {catalog.map((item) => (
          <option
            key={item.reference}
            value={item.reference}
            className="bg-bg-primary text-text-primary"
          >
            {item.reference}
            {item.name ? ` — ${item.name}` : ""}
          </option>
        ))}
      </select>

      {/* Preview */}
      {selected && (
        <div className="mt-5 p-3.5 bg-bg-card border border-glass-border rounded-lg">
          <div className="text-xs text-text-dim font-[family-name:var(--font-display)] tracking-wider mb-2">
            DÉTAILS PRODUIT
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[13px] text-text-secondary leading-loose">
            Poids: <span className="text-primary-cyan">{selected.poids} kg</span>
            <br />
            Dimensions:{" "}
            <span className="text-primary-cyan">
              {selected.longueur} × {selected.largeur} × {selected.hauteur} m
            </span>
            <br />
            Volume: <span className="text-primary-cyan">{selected.volume} m³</span>
          </div>
        </div>
      )}
    </div>
  );
}
