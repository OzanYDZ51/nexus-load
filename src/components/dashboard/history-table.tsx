"use client";

import { useNexusStore } from "@/lib/store";

export function HistoryTable() {
  const history = useNexusStore((s) => s.history);

  return (
    <div className="bg-glass-bg border border-glass-border rounded-[20px] p-6">
      <div className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[2px] text-text-secondary uppercase mb-5">
        Historique des commandes
      </div>
      <div className="overflow-x-auto rounded-[14px] border border-glass-border max-h-[360px] overflow-y-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {["Date", "Articles", "Poids", "Volume", "Camions", "Efficacité"].map(
                (header) => (
                  <th
                    key={header}
                    className="bg-[rgba(0,240,255,0.05)] px-[18px] py-3.5 text-left font-[family-name:var(--font-display)] text-[11px] font-bold tracking-[2px] uppercase text-primary-cyan border-b border-border-glow whitespace-nowrap sticky top-0"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-text-dim py-8"
                >
                  Aucun historique disponible
                </td>
              </tr>
            ) : (
              [...history].reverse().map((h) => (
                <tr
                  key={h.id}
                  className="transition-colors duration-200 hover:bg-[rgba(0,240,255,0.03)] border-b border-border-subtle last:border-b-0"
                >
                  <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                    {h.date}
                  </td>
                  <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                    {h.items}
                  </td>
                  <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                    {(h.weight / 1000).toFixed(2)} t
                  </td>
                  <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                    {h.volume.toFixed(2)} m³
                  </td>
                  <td className="px-[18px] py-3 font-[family-name:var(--font-mono)] text-[13px]">
                    {h.trucks}
                  </td>
                  <td className="px-[18px] py-3">
                    <span
                      className={`px-3 py-1 rounded-xl font-[family-name:var(--font-mono)] text-xs font-bold ${
                        h.efficiency >= 70
                          ? "fill-high"
                          : h.efficiency >= 40
                            ? "fill-medium"
                            : "fill-low"
                      }`}
                    >
                      {h.efficiency.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
