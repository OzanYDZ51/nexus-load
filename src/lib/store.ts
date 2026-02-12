import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, OrderItem, TruckLoad, HistoryEntry } from "./types";

interface NexusState {
  // Catalog
  catalog: Product[];
  setCatalog: (products: Product[]) => void;
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

  // History (persisted)
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
}

export const useNexusStore = create<NexusState>()(
  persist(
    (set, get) => ({
      // Catalog
      catalog: [],
      setCatalog: (products) => set({ catalog: products }),
      clearCatalog: () => set({ catalog: [], order: [], optimizationResults: null }),

      // Order
      order: [],
      addItem: (product, qty) => {
        const order = [...get().order];
        const existing = order.findIndex((o) => o.reference === product.reference);
        if (existing >= 0) {
          order[existing] = { ...order[existing], qty: order[existing].qty + qty };
        } else {
          order.push({ ...product, qty });
        }
        set({ order });
      },
      setOrder: (items) => set({ order: items, optimizationResults: null }),
      removeItem: (index) => {
        const order = [...get().order];
        order.splice(index, 1);
        set({ order });
      },
      updateQty: (index, qty) => {
        const order = [...get().order];
        if (order[index]) {
          order[index] = { ...order[index], qty: Math.max(1, qty) };
          set({ order });
        }
      },
      clearOrder: () => set({ order: [], optimizationResults: null }),

      // Optimization
      optimizationResults: null,
      currentTruckIndex: 0,
      setOptimizationResults: (trucks) =>
        set({ optimizationResults: trucks, currentTruckIndex: 0 }),
      setCurrentTruckIndex: (index) => set({ currentTruckIndex: index }),
      clearOptimization: () => set({ optimizationResults: null, currentTruckIndex: 0 }),

      // History
      history: [],
      addHistoryEntry: (entry) =>
        set((state) => ({ history: [...state.history, entry] })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "nexus-storage",
      partialize: (state) => ({ history: state.history }),
    }
  )
);
