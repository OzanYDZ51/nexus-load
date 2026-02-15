import * as XLSX from "xlsx";
import type { Product, OrderItem } from "./types";
import type { ColumnMapping, RawExcelData } from "./column-mapping";

/**
 * Read raw Excel data: headers + rows for preview and mapping.
 */
/** Sanitize XLSX cell values (Date objects, etc.) into primitives */
function sanitizeCell(v: unknown): string | number | boolean {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" || typeof v === "number" || typeof v === "boolean") return v;
  if (v instanceof Date) return v.toISOString().split("T")[0];
  return String(v);
}

export function readRawExcel(buffer: ArrayBuffer, fileName: string): RawExcelData {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: "",
  });

  if (data.length === 0) {
    throw new Error("Le fichier est vide");
  }

  const headers = (data[0] as unknown[]).map((h) => String(h).trim());
  const rows = data.slice(1)
    .map((row) => (row as unknown[]).map(sanitizeCell))
    .filter((r) => r.some((cell) => String(cell).trim() !== ""));
  const previewRows = rows.slice(0, 3);

  return { headers, rows, previewRows, fileName, buffer };
}

// ---------------------
// Helpers to read row values via mapping or positional fallback
// ---------------------

function getString(row: Record<string, unknown>, keys: string[], mapping: ColumnMapping | undefined, field: keyof ColumnMapping, positionalIndex: number): string {
  if (mapping && mapping[field] !== undefined) {
    return String(row[keys[mapping[field]!]] ?? "").trim();
  }
  return String(row[keys[positionalIndex]] ?? "").trim();
}

function getNumber(row: Record<string, unknown>, keys: string[], mapping: ColumnMapping | undefined, field: keyof ColumnMapping, positionalIndex: number, fallback = 0): number {
  if (mapping && mapping[field] !== undefined) {
    return parseFloat(String(row[keys[mapping[field]!]])) || fallback;
  }
  return parseFloat(String(row[keys[positionalIndex]])) || fallback;
}

function getBool(row: Record<string, unknown>, keys: string[], mapping: ColumnMapping | undefined, field: keyof ColumnMapping): boolean | undefined {
  if (!mapping || mapping[field] === undefined) return undefined;
  const val = String(row[keys[mapping[field]!]] ?? "").toLowerCase().trim();
  if (["oui", "yes", "1", "true", "vrai", "x"].includes(val)) return true;
  if (["non", "no", "0", "false", "faux", ""].includes(val)) return false;
  return undefined;
}

function getOptionalInt(row: Record<string, unknown>, keys: string[], mapping: ColumnMapping | undefined, field: keyof ColumnMapping, fallback: number): number | undefined {
  if (!mapping || mapping[field] === undefined) return undefined;
  const val = parseInt(String(row[keys[mapping[field]!]]));
  return isNaN(val) ? fallback : val;
}

function getOrientation(row: Record<string, unknown>, keys: string[], mapping: ColumnMapping | undefined): 'longueur' | 'largeur' | undefined {
  if (!mapping || mapping.orientation === undefined) return undefined;
  const val = String(row[keys[mapping.orientation]] ?? "").toLowerCase().trim();
  if (["longueur", "long", "l", "length"].includes(val)) return "longueur";
  if (["largeur", "larg", "w", "width"].includes(val)) return "largeur";
  return undefined;
}

// ---------------------
// Catalogue import
// ---------------------

export function parseExcelFile(buffer: ArrayBuffer, mapping?: ColumnMapping): Product[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (data.length === 0) {
    throw new Error("Le fichier est vide");
  }

  const products: Product[] = data
    .map((row) => {
      const keys = Object.keys(row);
      const reference = getString(row, keys, mapping, "reference", 0);
      const poids = getNumber(row, keys, mapping, "poids", 1);
      const longueur = getNumber(row, keys, mapping, "longueur", 2);
      const largeur = getNumber(row, keys, mapping, "largeur", 3);
      const hauteur = getNumber(row, keys, mapping, "hauteur", 4, 1);
      const stackable = getBool(row, keys, mapping, "empilable");
      const maxStackLevels = getOptionalInt(row, keys, mapping, "maxNiveaux", 2);
      const orientationConstraint = getOrientation(row, keys, mapping);

      const product: Product = {
        reference,
        poids,
        longueur,
        largeur,
        hauteur,
        volume: +(longueur * largeur * hauteur).toFixed(4),
      };
      if (stackable !== undefined) product.stackable = stackable;
      if (stackable && maxStackLevels !== undefined) product.maxStackLevels = maxStackLevels;
      if (orientationConstraint) product.orientationConstraint = orientationConstraint;

      return product;
    })
    .filter((item) => item.reference.length > 0);

  return products;
}

// ---------------------
// Order import
// ---------------------

export interface OrderParseResult {
  items: OrderItem[];
  matched: number;
  notFound: string[];
}

export function parseOrderFile(
  buffer: ArrayBuffer,
  catalog: Product[],
  mapping?: ColumnMapping
): OrderParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (data.length === 0) {
    throw new Error("Le fichier est vide");
  }

  // With explicit mapping, always use it
  if (mapping) {
    return parseWithMapping(data, catalog, mapping);
  }

  // Fallback: legacy positional logic
  const columnCount = Object.keys(data[0]).length;
  const hasCatalog = catalog.length > 0;
  const hasFullData = columnCount >= 6;

  if (hasFullData) {
    return parseFullOrderFile(data);
  }

  if (columnCount === 5 && !hasCatalog) {
    return parseCatalogAsOrder(data);
  }

  // Simple mode: match against catalog (Reference + Quantity)
  const catalogMap = new Map<string, Product>();
  for (const p of catalog) {
    catalogMap.set(p.reference.toLowerCase(), p);
  }

  const items: OrderItem[] = [];
  const notFound: string[] = [];

  for (const row of data) {
    const keys = Object.keys(row);
    const reference = String(row[keys[0]] || "").trim();
    if (!reference) continue;

    const qty = Math.max(1, parseInt(String(row[keys[1]])) || 1);
    const product = catalogMap.get(reference.toLowerCase());

    if (product) {
      const existing = items.find(
        (i) => i.reference.toLowerCase() === reference.toLowerCase()
      );
      if (existing) {
        existing.qty += qty;
      } else {
        items.push({ ...product, qty });
      }
    } else {
      if (!notFound.includes(reference)) {
        notFound.push(reference);
      }
    }
  }

  return { items, matched: items.length, notFound };
}

/**
 * Parse order data using explicit column mapping.
 */
function parseWithMapping(
  data: Record<string, unknown>[],
  catalog: Product[],
  mapping: ColumnMapping
): OrderParseResult {
  const hasCatalog = catalog.length > 0;
  const hasPhysicalFields =
    mapping.poids !== undefined &&
    mapping.longueur !== undefined &&
    mapping.largeur !== undefined &&
    mapping.hauteur !== undefined;

  // Build catalog lookup
  const catalogMap = new Map<string, Product>();
  for (const p of catalog) {
    catalogMap.set(p.reference.toLowerCase(), p);
  }

  const items: OrderItem[] = [];
  const notFound: string[] = [];

  for (const row of data) {
    const keys = Object.keys(row);
    const reference = getString(row, keys, mapping, "reference", 0);
    if (!reference) continue;

    const qty = mapping.quantite !== undefined
      ? Math.max(1, parseInt(String(row[keys[mapping.quantite]])) || 1)
      : 1;

    // If physical fields are mapped, use them directly
    if (hasPhysicalFields) {
      const poids = getNumber(row, keys, mapping, "poids", -1);
      const longueur = getNumber(row, keys, mapping, "longueur", -1);
      const largeur = getNumber(row, keys, mapping, "largeur", -1);
      const hauteur = getNumber(row, keys, mapping, "hauteur", -1, 1);

      if (poids === 0 && longueur === 0 && largeur === 0) {
        notFound.push(reference);
        continue;
      }

      const stackable = getBool(row, keys, mapping, "empilable");
      const maxStackLevels = getOptionalInt(row, keys, mapping, "maxNiveaux", 2);
      const orientationConstraint = getOrientation(row, keys, mapping);

      const existing = items.find(
        (i) => i.reference.toLowerCase() === reference.toLowerCase()
      );
      if (existing) {
        existing.qty += qty;
      } else {
        const orderItem: OrderItem = {
          reference,
          poids,
          longueur,
          largeur,
          hauteur,
          volume: +(longueur * largeur * hauteur).toFixed(4),
          qty,
        };
        if (stackable !== undefined) orderItem.stackable = stackable;
        if (stackable && maxStackLevels !== undefined) orderItem.maxStackLevels = maxStackLevels;
        if (orientationConstraint) orderItem.orientationConstraint = orientationConstraint;
        items.push(orderItem);
      }
    } else if (hasCatalog) {
      // Match against catalog
      const product = catalogMap.get(reference.toLowerCase());
      if (product) {
        const existing = items.find(
          (i) => i.reference.toLowerCase() === reference.toLowerCase()
        );
        if (existing) {
          existing.qty += qty;
        } else {
          items.push({ ...product, qty });
        }
      } else {
        if (!notFound.includes(reference)) {
          notFound.push(reference);
        }
      }
    }
  }

  return { items, matched: items.length, notFound };
}

// ---------------------
// Legacy positional parsers (kept for backward compatibility without mapping)
// ---------------------

function parseCatalogAsOrder(
  data: Record<string, unknown>[]
): OrderParseResult {
  const items: OrderItem[] = [];

  for (const row of data) {
    const keys = Object.keys(row);
    const reference = String(row[keys[0]] || "").trim();
    if (!reference) continue;

    const poids = parseFloat(String(row[keys[1]])) || 0;
    const longueur = parseFloat(String(row[keys[2]])) || 0;
    const largeur = parseFloat(String(row[keys[3]])) || 0;
    const hauteur = parseFloat(String(row[keys[4]])) || 1;

    if (poids === 0 && longueur === 0 && largeur === 0) continue;

    items.push({
      reference,
      poids,
      longueur,
      largeur,
      hauteur,
      volume: +(longueur * largeur * hauteur).toFixed(4),
      qty: 1,
    });
  }

  return { items, matched: items.length, notFound: [] };
}

function parseFullOrderFile(
  data: Record<string, unknown>[]
): OrderParseResult {
  const items: OrderItem[] = [];
  const notFound: string[] = [];

  for (const row of data) {
    const keys = Object.keys(row);
    const reference = String(row[keys[0]] || "").trim();
    if (!reference) continue;

    const qty = Math.max(1, parseInt(String(row[keys[1]])) || 1);
    const poids = parseFloat(String(row[keys[2]])) || 0;
    const longueur = parseFloat(String(row[keys[3]])) || 0;
    const largeur = parseFloat(String(row[keys[4]])) || 0;
    const hauteur = parseFloat(String(row[keys[5]])) || 1;

    if (poids === 0 && longueur === 0 && largeur === 0) {
      notFound.push(reference);
      continue;
    }

    const existing = items.find(
      (i) => i.reference.toLowerCase() === reference.toLowerCase()
    );
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        reference,
        poids,
        longueur,
        largeur,
        hauteur,
        volume: +(longueur * largeur * hauteur).toFixed(4),
        qty,
      });
    }
  }

  return { items, matched: items.length, notFound };
}
