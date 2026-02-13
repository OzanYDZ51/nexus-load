// Column mapping types and auto-detection for Excel imports

export type MappableField =
  | "reference"
  | "quantite"
  | "poids"
  | "longueur"
  | "largeur"
  | "hauteur"
  | "empilable"
  | "maxNiveaux"
  | "orientation";

export type ColumnMapping = Partial<Record<MappableField, number>>;

export interface RawExcelData {
  headers: string[];
  rows: unknown[][];
  previewRows: unknown[][];
  fileName: string;
  buffer: ArrayBuffer;
}

// Patterns for auto-detection (lowercase)
const FIELD_PATTERNS: Record<MappableField, string[]> = {
  reference: ["référence", "reference", "ref", "sku", "code article", "code", "article", "ref."],
  quantite: ["quantité", "quantite", "qty", "qté", "qte", "nombre", "nb", "quantity"],
  poids: ["poids", "weight", "kg", "masse", "mass"],
  longueur: ["longueur", "length", "long", "long.", "l (m)", "l(m)"],
  largeur: ["largeur", "width", "larg", "larg.", "w (m)", "w(m)", "la (m)"],
  hauteur: ["hauteur", "height", "haut", "haut.", "h (m)", "h(m)"],
  empilable: ["empilable", "stackable", "stack"],
  maxNiveaux: ["niveaux", "levels", "max stack", "étages", "max niveaux"],
  orientation: ["orientation", "sens", "direction", "placement", "sens palette"],
};

function scoreMatch(header: string, patterns: string[]): number {
  const h = header.toLowerCase().trim();
  for (const p of patterns) {
    if (h === p) return 100;
  }
  for (const p of patterns) {
    if (h.startsWith(p)) return 80;
  }
  for (const p of patterns) {
    if (h.includes(p)) return 60;
  }
  return 0;
}

/**
 * Auto-detect column mapping by scoring each (field, header) pair.
 * Greedy assignment: best score first, no column reuse.
 */
export function autoDetectMapping(headers: string[]): ColumnMapping {
  const fields = Object.keys(FIELD_PATTERNS) as MappableField[];

  // Build scored pairs
  const scored: { field: MappableField; colIndex: number; score: number }[] = [];
  for (const field of fields) {
    for (let i = 0; i < headers.length; i++) {
      const s = scoreMatch(headers[i], FIELD_PATTERNS[field]);
      if (s > 0) {
        scored.push({ field, colIndex: i, score: s });
      }
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  const mapping: ColumnMapping = {};
  const usedFields = new Set<MappableField>();
  const usedCols = new Set<number>();

  for (const { field, colIndex } of scored) {
    if (usedFields.has(field) || usedCols.has(colIndex)) continue;
    mapping[field] = colIndex;
    usedFields.add(field);
    usedCols.add(colIndex);
  }

  return mapping;
}

export interface MappingValidation {
  valid: boolean;
  missingFields: MappableField[];
  duplicateCols: number[];
}

/**
 * Validate that all required fields are mapped and no column is used twice.
 */
export function validateMapping(
  mapping: ColumnMapping,
  requiredFields: MappableField[]
): MappingValidation {
  const missingFields = requiredFields.filter((f) => mapping[f] === undefined);

  const colCounts = new Map<number, number>();
  for (const col of Object.values(mapping)) {
    if (col !== undefined) {
      colCounts.set(col, (colCounts.get(col) || 0) + 1);
    }
  }
  const duplicateCols = [...colCounts.entries()]
    .filter(([, count]) => count > 1)
    .map(([col]) => col);

  return {
    valid: missingFields.length === 0 && duplicateCols.length === 0,
    missingFields,
    duplicateCols,
  };
}

export const FIELD_LABELS: Record<MappableField, string> = {
  reference: "Référence",
  quantite: "Quantité",
  poids: "Poids (kg)",
  longueur: "Longueur (m)",
  largeur: "Largeur (m)",
  hauteur: "Hauteur (m)",
  empilable: "Empilable",
  maxNiveaux: "Niveaux max",
  orientation: "Orientation",
};

export const CATALOGUE_REQUIRED: MappableField[] = [
  "reference",
  "poids",
  "longueur",
  "largeur",
  "hauteur",
];

export const ORDER_WITH_CATALOG_REQUIRED: MappableField[] = [
  "reference",
  "quantite",
];

export const ORDER_WITHOUT_CATALOG_REQUIRED: MappableField[] = [
  "reference",
  "quantite",
  "poids",
  "longueur",
  "largeur",
  "hauteur",
];
