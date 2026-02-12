import * as XLSX from "xlsx";
import type { Product, OrderItem } from "./types";

export function parseExcelFile(buffer: ArrayBuffer): Product[] {
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
      const reference = String(row[keys[0]] || "").trim();
      const poids = parseFloat(String(row[keys[1]])) || 0;
      const longueur = parseFloat(String(row[keys[2]])) || 0;
      const largeur = parseFloat(String(row[keys[3]])) || 0;
      const hauteur = parseFloat(String(row[keys[4]])) || 1;

      return {
        reference,
        poids,
        longueur,
        largeur,
        hauteur,
        volume: +(longueur * largeur * hauteur).toFixed(4),
      };
    })
    .filter((item) => item.reference.length > 0);

  return products;
}

export interface OrderParseResult {
  items: OrderItem[];
  matched: number;
  notFound: string[];
}

export function parseOrderFile(
  buffer: ArrayBuffer,
  catalog: Product[]
): OrderParseResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  if (data.length === 0) {
    throw new Error("Le fichier est vide");
  }

  const columnCount = Object.keys(data[0]).length;
  const hasCatalog = catalog.length > 0;
  const hasFullData = columnCount >= 6;

  // If no catalog and file has full product data (>=6 columns):
  // Reference, Quantity, Poids, Longueur, Largeur, Hauteur
  if (!hasCatalog && hasFullData) {
    return parseFullOrderFile(data);
  }

  // If file has full data, prefer using it directly (even with catalog)
  if (hasFullData) {
    return parseFullOrderFile(data);
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
