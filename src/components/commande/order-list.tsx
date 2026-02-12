"use client";

import { X, ShoppingCart } from "lucide-react";
import { useNexusStore } from "@/lib/store";
import { ITEM_COLORS } from "@/lib/constants";
import { hexToString } from "@/lib/utils";

export function OrderList() {
  const order = useNexusStore((s) => s.order);
  const removeItem = useNexusStore((s) => s.removeItem);

  if (order.length === 0) {
    return (
      <div className="text-center py-10 text-text-dim">
        <ShoppingCart className="w-9 h-9 mx-auto mb-4 opacity-50" />
        <div className="text-[13px]">Aucun produit ajouté</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {order.map((item, i) => {
        const color = hexToString(ITEM_COLORS[i % ITEM_COLORS.length]);
        return (
          <div
            key={`${item.reference}-${i}`}
            className="flex items-center justify-between p-3.5 px-[18px] bg-bg-card border border-glass-border rounded-lg transition-all duration-200 hover:border-border-glow"
          >
            <div className="flex items-center gap-3.5">
              <span
                className="w-2.5 h-2.5 rounded-[3px] inline-block"
                style={{ background: color }}
              />
              <div>
                <div className="font-semibold">{item.reference}</div>
                <div className="text-xs text-text-secondary font-[family-name:var(--font-mono)]">
                  {item.longueur}×{item.largeur}×{item.hauteur}m — {item.poids}
                  kg
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="font-[family-name:var(--font-mono)] font-bold text-primary-cyan text-[15px]">
                ×{item.qty}
              </span>
              <button
                onClick={() => removeItem(i)}
                className="bg-transparent border-none text-danger cursor-pointer p-1.5 rounded-md transition-all duration-200 hover:bg-accent-dim"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
