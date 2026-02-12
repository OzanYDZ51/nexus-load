export interface Product {
  reference: string;
  name?: string;
  poids: number;      // kg
  longueur: number;   // m
  largeur: number;    // m
  hauteur: number;    // m
  volume: number;     // m³
}

export interface OrderItem extends Product {
  qty: number;
}

export interface PlacedItem extends Product {
  position: { x: number; y: number; z: number };
  dims: { l: number; w: number; h: number };
  color: number;
}

export interface TruckLoad {
  items: PlacedItem[];
  currentWeight: number;
  availablePoints: { x: number; y: number; z: number }[];
}

export interface OptimizationResult {
  trucks: TruckLoad[];
  totalItems: number;
  totalWeight: number;
  totalVolume: number;
  avgFillRate: number;
}

export interface HistoryEntry {
  id: string;
  date: string;
  items: number;
  weight: number;
  volume: number;
  trucks: number;
  efficiency: number;
}
