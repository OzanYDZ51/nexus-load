import * as XLSX from "xlsx";
import type { Product, TruckLoad } from "./types";
import { TRUCK, TRUCK_VOLUME } from "./constants";

type Row = Record<string, string | number>;

export function exportTrucksToExcel(trucks: TruckLoad[]) {
  const wb = XLSX.utils.book_new();

  // ── Sheet 1: Récapitulatif ──
  const summaryRows: Row[] = trucks.map((truck, i) => {
    const volume = truck.items.reduce((s, it) => s + it.volume, 0);
    const fillPct = +((volume / TRUCK_VOLUME) * 100).toFixed(1);
    const weightPct = +((truck.currentWeight / TRUCK.maxWeight) * 100).toFixed(1);

    // Count unique references
    const refs = new Set(truck.items.map((it) => it.reference));

    return {
      Camion: `Camion ${i + 1}`,
      "Nb références": refs.size,
      "Nb articles": truck.items.length,
      "Poids (kg)": +truck.currentWeight.toFixed(1),
      "Poids max (kg)": TRUCK.maxWeight,
      "Poids (%)": weightPct,
      "Volume (m³)": +volume.toFixed(2),
      "Volume max (m³)": +TRUCK_VOLUME.toFixed(1),
      "Remplissage (%)": fillPct,
    };
  });

  // Totals row
  const totalItems = trucks.reduce((s, t) => s + t.items.length, 0);
  const totalWeight = trucks.reduce((s, t) => s + t.currentWeight, 0);
  const totalVolume = trucks.reduce(
    (s, t) => s + t.items.reduce((ss, it) => ss + it.volume, 0),
    0
  );
  const avgFill =
    trucks.length > 0
      ? +((totalVolume / (trucks.length * TRUCK_VOLUME)) * 100).toFixed(1)
      : 0;

  summaryRows.push({
    Camion: "TOTAL",
    "Nb références": new Set(trucks.flatMap((t) => t.items.map((it) => it.reference))).size,
    "Nb articles": totalItems,
    "Poids (kg)": +totalWeight.toFixed(1),
    "Poids max (kg)": TRUCK.maxWeight * trucks.length,
    "Poids (%)": +((totalWeight / (TRUCK.maxWeight * trucks.length)) * 100).toFixed(1),
    "Volume (m³)": +totalVolume.toFixed(2),
    "Volume max (m³)": +(TRUCK_VOLUME * trucks.length).toFixed(1),
    "Remplissage (%)": avgFill,
  });

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary["!cols"] = [
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 10 }, { wch: 13 }, { wch: 15 }, { wch: 14 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Récapitulatif");

  // ── Sheet 2: Plan de Chargement (grouped by truck + reference) ──
  const detailRows: Row[] = [];

  for (let i = 0; i < trucks.length; i++) {
    const truck = trucks[i];

    // Group items by reference
    const groups: Record<
      string,
      { count: number; name: string; poids: number; longueur: number; largeur: number; hauteur: number; volume: number; totalWeight: number; totalVolume: number; maxStack: number }
    > = {};

    for (const it of truck.items) {
      if (!groups[it.reference]) {
        groups[it.reference] = {
          count: 0,
          name: it.name || "",
          poids: it.poids,
          longueur: it.longueur,
          largeur: it.largeur,
          hauteur: it.hauteur,
          volume: it.volume,
          totalWeight: 0,
          totalVolume: 0,
          maxStack: 0,
        };
      }
      groups[it.reference].count++;
      groups[it.reference].totalWeight += it.poids;
      groups[it.reference].totalVolume += it.volume;
      if (it.stackLevel > groups[it.reference].maxStack) {
        groups[it.reference].maxStack = it.stackLevel;
      }
    }

    for (const [ref, data] of Object.entries(groups)) {
      detailRows.push({
        Camion: `Camion ${i + 1}`,
        Référence: ref,
        Désignation: data.name,
        Quantité: data.count,
        "Poids unit. (kg)": +data.poids.toFixed(1),
        "Poids total (kg)": +data.totalWeight.toFixed(1),
        "L (m)": +data.longueur.toFixed(2),
        "l (m)": +data.largeur.toFixed(2),
        "H (m)": +data.hauteur.toFixed(2),
        "Vol. unit. (m³)": +data.volume.toFixed(4),
        "Vol. total (m³)": +data.totalVolume.toFixed(2),
        "Niveaux empilés": data.maxStack > 0 ? data.maxStack + 1 : 1,
      });
    }
  }

  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  wsDetail["!cols"] = [
    { wch: 12 }, { wch: 16 }, { wch: 22 }, { wch: 10 }, { wch: 15 },
    { wch: 15 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 14 },
    { wch: 14 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDetail, "Plan de Chargement");

  // ── Download ──
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const timeStr = [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");

  XLSX.writeFile(wb, `NEXUS_Chargement_${dateStr}_${timeStr}.xlsx`);
}

export function exportCatalogToExcel(catalog: Product[]) {
  const wb = XLSX.utils.book_new();

  const rows: Row[] = catalog.map((p) => ({
    Référence: p.reference,
    "Poids (kg)": +p.poids.toFixed(2),
    "Longueur (m)": +p.longueur.toFixed(3),
    "Largeur (m)": +p.largeur.toFixed(3),
    "Hauteur (m)": +p.hauteur.toFixed(3),
    "Volume (m³)": +p.volume.toFixed(4),
    Empilable: p.stackable ? "Oui" : "Non",
    "Niveaux max": p.stackable ? (p.maxStackLevels ?? 2) : "",
    Orientation: p.orientationConstraint === "longueur"
      ? "Longueur"
      : p.orientationConstraint === "largeur"
        ? "Largeur"
        : "Libre",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 16 }, { wch: 12 }, { wch: 14 }, { wch: 13 }, { wch: 13 },
    { wch: 14 }, { wch: 12 }, { wch: 13 }, { wch: 13 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Catalogue");

  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  XLSX.writeFile(wb, `NEXUS_Catalogue_${dateStr}.xlsx`);
}
