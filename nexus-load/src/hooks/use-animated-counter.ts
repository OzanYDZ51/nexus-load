"use client";

import { useEffect, useState } from "react";

export function useAnimatedCounter(
  target: number,
  duration: number = 1200,
  decimals: number = 0
): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(target * ease);

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
}
