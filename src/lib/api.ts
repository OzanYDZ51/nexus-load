import type { Product, OrderItem, TruckLoad, HistoryEntry } from "./types";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json();
}

export const api = {
  catalog: {
    load: () =>
      fetchJSON<{ products: Product[] } | null>("/api/catalog"),
    save: (products: Product[]) =>
      fetchJSON<{ id: string }>("/api/catalog", {
        method: "PUT",
        body: JSON.stringify({ products }),
      }),
    clear: () =>
      fetchJSON<{ ok: boolean }>("/api/catalog", { method: "DELETE" }),
    updateProduct: (reference: string, updates: Partial<Product>) =>
      fetchJSON<{ ok: boolean }>("/api/catalog/product", {
        method: "PATCH",
        body: JSON.stringify({ reference, updates }),
      }),
  },

  order: {
    load: () =>
      fetchJSON<{ items: OrderItem[]; id: string } | null>("/api/order"),
    save: (items: OrderItem[]) =>
      fetchJSON<{ id: string }>("/api/order", {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),
    clear: () =>
      fetchJSON<{ ok: boolean }>("/api/order", { method: "DELETE" }),
  },

  optimization: {
    load: () =>
      fetchJSON<{ trucks: TruckLoad[] } | null>("/api/optimization"),
    save: (trucks: TruckLoad[], historyEntry: HistoryEntry) =>
      fetchJSON<{ id: string }>("/api/optimization", {
        method: "POST",
        body: JSON.stringify({ trucks, historyEntry }),
      }),
    clear: () =>
      fetchJSON<{ ok: boolean }>("/api/optimization", { method: "DELETE" }),
  },

  history: {
    load: () =>
      fetchJSON<HistoryEntry[]>("/api/history"),
    clear: () =>
      fetchJSON<{ ok: boolean }>("/api/history", { method: "DELETE" }),
  },
};
