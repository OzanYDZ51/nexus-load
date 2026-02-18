import { create } from "zustand";
import type { Product, OrderItem, TruckLoad, HistoryEntry } from "./types";
import { api } from "./api";

interface NexusState {
  // Hydration
  isHydrated: boolean;
  hydrate: () => Promise<void>;

  // Catalog
  catalog: Product[];
  setCatalog: (products: Product[]) => void;
  updateProduct: (reference: string, updates: Partial<Product>) => void;
  clearCatalog: () => void;

  // Order
  order: OrderItem[];
  addItem: (product: Product, qty: number) => void;
  setOrder: (items: OrderItem[]) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearOrder: () => void;

  // Optimization
  optimizationResults: TruckLoad[] | null;
  currentTruckIndex: number;
  setOptimizationResults: (trucks: TruckLoad[]) => void;
  setCurrentTruckIndex: (index: number) => void;
  clearOptimization: () => void;
  saveOptimization: (trucks: TruckLoad[], historyEntry: HistoryEntry) => void;

  // History
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

export const useNexusStore = create<NexusState>()((set, get) => ({
  // Hydration
  isHydrated: false,
  hydrate: async () => {
    try {
      const [catalogRes, orderRes, optRes, historyRes] = await Promise.all([
        api.catalog.load().catch(() => null),
        api.order.load().catch(() => null),
        api.optimization.load().catch(() => null),
        api.history.load().catch(() => []),
      ]);

      set({
        catalog: catalogRes?.products ?? [],
        order: orderRes?.items ?? [],
        optimizationResults: optRes?.trucks ?? null,
        history: (historyRes as HistoryEntry[]) ?? [],
        currentTruckIndex: 0,
        isHydrated: true,
      });
    } catch {
      // If API is unavailable (no DB yet), just mark hydrated so app works
      set({ isHydrated: true });
    }
  },

  // Catalog
  catalog: [],
  setCatalog: (products) => {
    set({ catalog: products });
    api.catalog.save(products).catch(console.error);
  },
  updateProduct: (reference, updates) => {
    const newCatalog = get().catalog.map((p) =>
      p.reference === reference ? { ...p, ...updates } : p
    );
    // Sync stacking/orientation changes to matching order items
    const newOrder = get().order.map((o) =>
      o.reference === reference ? { ...o, ...updates } : o
    );
    set({ catalog: newCatalog, order: newOrder });
    api.catalog.updateProduct(reference, updates).catch(console.error);
    api.order.save(newOrder).catch(console.error);
  },
  clearCatalog: () => {
    set({ catalog: [], order: [], optimizationResults: null });
    api.catalog.clear().catch(console.error);
    api.order.clear().catch(console.error);
    api.optimization.clear().catch(console.error);
  },

  // Order
  order: [],
  addItem: (product, qty) => {
    const order = [...get().order];
    const existing = order.findIndex((o) => o.reference === product.reference);
    if (existing >= 0) {
      // Merge latest catalog properties (stacking, orientation) + add quantity
      order[existing] = { ...order[existing], ...product, qty: order[existing].qty + qty };
    } else {
      order.push({ ...product, qty });
    }
    set({ order });
    api.order.save(order).catch(console.error);
  },
  setOrder: (items) => {
    set({ order: items, optimizationResults: null });
    api.order.save(items).catch(console.error);
    api.optimization.clear().catch(console.error);
  },
  removeItem: (index) => {
    const order = [...get().order];
    order.splice(index, 1);
    set({ order });
    api.order.save(order).catch(console.error);
  },
  updateQty: (index, qty) => {
    const order = [...get().order];
    if (order[index]) {
      order[index] = { ...order[index], qty: Math.max(1, qty) };
      set({ order });
      api.order.save(order).catch(console.error);
    }
  },
  clearOrder: () => {
    set({ order: [], optimizationResults: null });
    api.order.clear().catch(console.error);
    api.optimization.clear().catch(console.error);
  },

  // Optimization
  optimizationResults: null,
  currentTruckIndex: 0,
  setOptimizationResults: (trucks) =>
    set({ optimizationResults: trucks, currentTruckIndex: 0 }),
  setCurrentTruckIndex: (index) => set({ currentTruckIndex: index }),
  clearOptimization: () => {
    set({ optimizationResults: null, currentTruckIndex: 0 });
    api.optimization.clear().catch(console.error);
  },
  saveOptimization: (trucks, historyEntry) => {
    set({
      optimizationResults: trucks,
      currentTruckIndex: 0,
      history: [...get().history, historyEntry],
    });
    api.optimization.save(trucks, historyEntry).catch(console.error);
  },

  // History
  history: [],
  addHistoryEntry: (entry) =>
    set((state) => ({ history: [...state.history, entry] })),
  clearHistory: () => {
    set({ history: [] });
    api.history.clear().catch(console.error);
  },
}));
