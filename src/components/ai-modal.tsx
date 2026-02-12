"use client";

import { useEffect, useState } from "react";
import { AI_STEPS } from "@/lib/constants";

interface AIModalProps {
  open: boolean;
  onComplete: () => void;
}

type StepState = "pending" | "active" | "done";

export function AIModal({ open, onComplete }: AIModalProps) {
  const [stepStates, setStepStates] = useState<StepState[]>(
    AI_STEPS.map(() => "pending")
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setStepStates(AI_STEPS.map(() => "pending"));
      setProgress(0);
      return;
    }

    const timings = [
      { step: 0, progress: 15, delay: 300, done: false },
      { step: 0, progress: 25, delay: 800, done: true },
      { step: 1, progress: 40, delay: 1200, done: false },
      { step: 1, progress: 55, delay: 1800, done: true },
      { step: 2, progress: 70, delay: 2200, done: false },
      { step: 2, progress: 85, delay: 2800, done: true },
      { step: 3, progress: 92, delay: 3200, done: false },
      { step: 3, progress: 100, delay: 3800, done: true },
    ];

    const timeouts: NodeJS.Timeout[] = [];

    for (const t of timings) {
      timeouts.push(
        setTimeout(() => {
          setProgress(t.progress);
          setStepStates((prev) => {
            const next = [...prev];
            next[t.step] = t.done ? "done" : "active";
            return next;
          });
        }, t.delay)
      );
    }

    timeouts.push(setTimeout(onComplete, 4200));

    return () => timeouts.forEach(clearTimeout);
  }, [open, onComplete]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-[rgba(6,6,15,0.9)] backdrop-blur-[10px] z-[1000] flex items-center justify-center">
      <div
        className="w-[480px] max-w-[90vw] bg-bg-surface border border-border-glow rounded-[20px] p-12 px-10 text-center animate-[modalAppear_0.5s_ease-out]"
        style={{
          boxShadow:
            "0 0 100px rgba(0, 240, 255, 0.1), 0 0 200px rgba(123, 47, 255, 0.05)",
        }}
      >
        {/* Brain icon */}
        <div className="w-20 h-20 mx-auto mb-6 relative">
          <div
            className="w-full h-full rounded-full border-2 border-primary-cyan flex items-center justify-center relative"
            style={{ animation: "brainPulse 2s ease-in-out infinite" }}
          >
            <span className="font-[family-name:var(--font-display)] text-sm font-black text-primary-cyan tracking-[2px]">
              N
            </span>
            <div
              className="absolute w-[120%] h-[120%] rounded-full border border-primary-cyan opacity-30"
              style={{ animation: "brainRing 3s linear infinite" }}
            />
            <div
              className="absolute w-[140%] h-[140%] rounded-full border border-primary-cyan opacity-15"
              style={{
                animation: "brainRing 3s linear infinite reverse",
              }}
            />
          </div>
        </div>

        <h2 className="font-[family-name:var(--font-display)] text-lg font-extrabold tracking-[2px] mb-7 text-text-primary">
          NEXUS OPTIMISE
        </h2>

        {/* Steps */}
        <div className="text-left mb-7 space-y-2.5">
          {AI_STEPS.map((label, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 py-2.5 text-sm transition-all duration-500 ${
                stepStates[i] === "done"
                  ? "text-success"
                  : stepStates[i] === "active"
                    ? "text-primary-cyan"
                    : "text-text-dim"
              }`}
            >
              <div
                className={`w-[22px] h-[22px] rounded-full border-2 border-current flex items-center justify-center text-[11px] shrink-0 ${
                  stepStates[i] === "active"
                    ? "bg-primary-dim animate-[stepPulse_1s_ease-in-out_infinite]"
                    : ""
                }`}
              >
                {stepStates[i] === "done" ? "\u2713" : i + 1}
              </div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-bg-card rounded-sm overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-cyan to-secondary-purple rounded-sm transition-[width] duration-800"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
