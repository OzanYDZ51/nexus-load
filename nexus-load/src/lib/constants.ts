export const TRUCK = {
  length: 13,
  width: 2.4,
  height: 2.7,
  maxWeight: 24000,
} as const;

export const TRUCK_VOLUME = TRUCK.length * TRUCK.width * TRUCK.height;

export const ITEM_COLORS = [
  0x00f0ff, 0x7b2fff, 0xff006e, 0x00ff88,
  0xffaa00, 0xff4444, 0x44aaff, 0xff44ff,
  0x44ffaa, 0xffff44, 0x88aaff, 0xff8844,
] as const;

export const NAV_ITEMS = [
  {
    key: "catalogue",
    label: "Catalogue",
    href: "/catalogue",
    icon: "Package",
  },
  {
    key: "commande",
    label: "Commande",
    href: "/commande",
    icon: "ShoppingCart",
  },
  {
    key: "optimisation",
    label: "Optimisation",
    href: "/optimisation",
    icon: "Truck",
  },
  {
    key: "dashboard",
    label: "Tableau de Bord",
    href: "/dashboard",
    icon: "PieChart",
  },
] as const;

export const AI_STEPS = [
  "Analyse des dimensions produits...",
  "Calcul volumétrique avancé...",
  "Optimisation 3D par intelligence artificielle...",
  "Génération du plan de chargement...",
] as const;

export const DEMO_REFS = [
  "PNL-001", "PNL-002", "PNL-003", "PNL-004", "PNL-005",
  "PNL-006", "PNL-007", "PNL-008", "BLK-010", "BLK-011",
  "BLK-012", "CYL-020", "CYL-021", "PLT-030", "PLT-031",
  "PLT-032", "BOX-040", "BOX-041", "BOX-042", "TUB-050",
] as const;

export const DEMO_NAMES = [
  "Panneau Standard", "Panneau Large", "Panneau XL", "Panneau Mince",
  "Panneau Carré", "Panneau Mini", "Panneau Double", "Panneau Pro",
  "Bloc Béton A", "Bloc Béton B", "Bloc Béton C", "Cylindre Alu",
  "Cylindre Acier", "Palette EUR", "Palette US", "Palette Custom",
  "Caisse Standard", "Caisse Renforcée", "Caisse Export", "Tube Acier",
] as const;
