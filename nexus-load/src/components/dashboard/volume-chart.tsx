"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useNexusStore } from "@/lib/store";
import { TRUCK_VOLUME } from "@/lib/constants";

export function VolumeChart() {
  const history = useNexusStore((s) => s.history);

  const totalVol = history.reduce((s, h) => s + h.volume, 0);
  const totalCap = history.reduce((s, h) => s + h.trucks * TRUCK_VOLUME, 0);
  const wastedVol = Math.max(0, totalCap - totalVol);

  const data = [
    { name: "Volume utilisé", value: +totalVol.toFixed(2) },
    { name: "Volume libre", value: +wastedVol.toFixed(2) },
  ];

  const COLORS = ["rgba(0, 240, 255, 0.7)", "rgba(100, 100, 150, 0.2)"];
  const BORDER_COLORS = ["rgba(0, 240, 255, 1)", "rgba(100, 100, 150, 0.4)"];

  if (history.length === 0) {
    return (
      <div className="bg-glass-bg border border-glass-border rounded-[20px] p-6">
        <div className="font-[family-name:var(--font-display)] text-xs font-bold tracking-[2px] text-text-secondary uppercase mb-5">
          Répartition du volume
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
        Répartition du volume
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                  stroke={BORDER_COLORS[index]}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(12, 12, 30, 0.95)",
                border: "1px solid rgba(0, 240, 255, 0.25)",
                borderRadius: 8,
                color: "#e8ecff",
                fontFamily: "'JetBrains Mono'",
                fontSize: 12,
              }}
              formatter={(value) => `${Number(value).toFixed(2)} m³`}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{
                fontFamily: "'Rajdhani'",
                fontSize: 13,
                paddingTop: 20,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
