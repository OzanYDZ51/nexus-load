"use client";

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
}

export function QuantityControl({ value, onChange }: QuantityControlProps) {
  return (
    <div className="mb-5">
      <label className="block font-[family-name:var(--font-display)] text-[10px] font-bold tracking-[2px] uppercase text-text-secondary mb-2">
        Quantité
      </label>
      <div className="flex items-center">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-11 h-11 flex items-center justify-center bg-bg-card border border-glass-border text-primary-cyan text-xl font-bold cursor-pointer transition-all duration-200 hover:bg-primary-dim rounded-l-lg"
        >
          −
        </button>
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-[70px] h-11 text-center bg-bg-card border-t border-b border-glass-border text-text-primary font-[family-name:var(--font-mono)] text-base font-bold outline-none"
        />
        <button
          onClick={() => onChange(value + 1)}
          className="w-11 h-11 flex items-center justify-center bg-bg-card border border-glass-border text-primary-cyan text-xl font-bold cursor-pointer transition-all duration-200 hover:bg-primary-dim rounded-r-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}
