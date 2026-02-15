"use client";

import { useEffect } from "react";
import { useNexusStore } from "@/lib/store";

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useNexusStore((s) => s.hydrate);
  const isHydrated = useNexusStore((s) => s.isHydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      {!isHydrated && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a1a]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-[rgba(0,240,255,0.3)] border-t-[#00f0ff] rounded-full animate-spin" />
            <span className="text-text-secondary text-sm font-[family-name:var(--font-display)] tracking-widest">
              CHARGEMENT
            </span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
