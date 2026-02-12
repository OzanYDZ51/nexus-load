import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatWeight(kg: number): string {
  if (kg >= 1000) {
    return (kg / 1000).toFixed(2) + " t";
  }
  return kg.toLocaleString("fr-FR", { maximumFractionDigits: 1 }) + " kg";
}

export function formatVolume(m3: number): string {
  return m3.toFixed(2) + " m³";
}

export function hexToString(hex: number): string {
  return "#" + hex.toString(16).padStart(6, "0");
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
