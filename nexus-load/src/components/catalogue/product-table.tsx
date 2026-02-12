"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useNexusStore } from "@/lib/store";

export function ProductTable() {
  const catalog = useNexusStore((s) => s.catalog);
  const [search, setSearch] = useState("");

  if (catalog.length === 0) return null;

  const filtered = catalog.filter((item) =>
    item.reference.toLowerCase().includes(search.toLowerCase()) ||
    (item.name && item.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mt-7">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-bg-card border border-glass-border rounded-lg flex-1 max-w-[400px] transition-all duration-200 focus-within:border-primary-cyan focus-within:shadow-[0_0_0_3px_var(--color-primary-dim)]">
          <Search className="w-[18px] h-[18px] text-text-dim shrink-0" />
          <input
            type="text"
            placeholder="Rechercher une référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent border-none text-text-primary font-[family-name:var(--font-body)] text-sm outline-none placeholder:text-text-dim"
          />
        </div>
        <div className="font-[family-name:var(--font-mono)] text-[13px] text-text-secondary">
          <span className="text-primary-cyan font-bold">{filtered.length}</span>{" "}
          produits chargés
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-[14px] border border-glass-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {["Référence", "Poids (kg)", "Longueur (m)", "Largeur (m)", "Hauteur (m)", "Volume (m³)"].map(
                (header) => (
                  <th
                    key={header}
                    className="bg-[rgba(0,240,255,0.05)] px-[18px] py-3.5 text-left font-[family-name:var(--font-display)] text-[11px] font-bold tracking-[2px] uppercase text-primary-cyan border-b border-border-glow whitespace-nowrap"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr
                key={item.reference}
                className="transition-colors duration-200 hover:bg-[rgba(0,240,255,0.03)] border-b border-border-subtle last:border-b-0"
              >
                <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-primary-dim text-primary-cyan font-semibold text-xs">
                    {item.reference}
                  </span>
                </td>
                <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                  {item.poids.toLocaleString("fr-FR")} kg
                </td>
                <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                  {item.longueur} m
                </td>
                <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                  {item.largeur} m
                </td>
                <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                  {item.hauteur} m
                </td>
                <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                  {item.volume} m³
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
