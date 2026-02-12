"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useNexusStore } from "@/lib/store";

export function FillRateChart() {
  const history = useNexusStore((s) => s.history);

  const data = history.map((h, i) => ({
    name: `#${i + 1}`,
    efficiency: +h.efficiency.toFixed(1),
  }));

  if (data.length === 0) {
    return (
      <div className="bg-glass-bg border border-glass-border rounded-[20px] p-6">
        <div className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[2px] text-text-secondary uppercase mb-5">
          Taux de remplissage par commande
        </div>
        <div className="h-[280px] flex items-center justify-center text-text-dim text-sm">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="bg-glass-bg border border-glass-border rounded-[20px] p-6">
      <div className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[2px] text-text-secondary uppercase mb-5">
        Taux de remplissage par commande
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(100,200,255,0.05)"
            />
            <XAxis
              dataKey="name"
              stroke="#4a5568"
              tick={{ fontFamily: "'JetBrains Mono'", fontSize: 11 }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#4a5568"
              tick={{ fontFamily: "'JetBrains Mono'", fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(12, 12, 30, 0.95)",
                border: "1px solid rgba(0, 240, 255, 0.25)",
                borderRadius: 8,
                color: "#e8ecff",
                fontFamily: "'JetBrains Mono'",
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="efficiency"
              stroke="#00f0ff"
              fill="url(#fillGradient)"
              strokeWidth={2}
              dot={{ fill: "#00f0ff", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
