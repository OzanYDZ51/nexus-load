"use client";

import { useCallback, useRef, useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { readRawExcel, parseOrderFile } from "@/lib/excel-parser";
import { useNexusStore } from "@/lib/store";
import { ColumnMappingModal } from "@/components/column-mapping-modal";
import {
  ORDER_WITH_CATALOG_REQUIRED,
  ORDER_WITHOUT_CATALOG_REQUIRED,
} from "@/lib/column-mapping";
import type { ColumnMapping, RawExcelData } from "@/lib/column-mapping";

export function OrderUpload() {
  const catalog = useNexusStore((s) => s.catalog);
  const setOrder = useNexusStore((s) => s.setOrder);
  const setCatalog = useNexusStore((s) => s.setCatalog);
  const [dragOver, setDragOver] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState<RawExcelData | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const requiredFields = catalog.length > 0
    ? ORDER_WITH_CATALOG_REQUIRED
    : ORDER_WITHOUT_CATALOG_REQUIRED;

  const processFile = useCallback((file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
      toast.error("Format non supporté. Utilisez .xlsx, .xls ou .csv");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
          toast.error("Impossible de lire le fichier");
          return;
        }
        const rawData = readRawExcel(buffer, file.name);
        setPendingData(rawData);
        setModalOpen(true);
      } catch (err) {
        toast.error(
          "Erreur lors de la lecture du fichier: " +
            (err instanceof Error ? err.message : "Erreur inconnue")
        );
      }
    };
    reader.onerror = () => {
      toast.error("Erreur lors de la lecture du fichier");
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleConfirmMapping = useCallback(
    (mapping: ColumnMapping) => {
      if (!pendingData) return;
      try {
        const result = parseOrderFile(pendingData.buffer, catalog, mapping);

        if (result.items.length === 0) {
          toast.error(
            "Aucune référence trouvée. Vérifiez le mapping des colonnes."
          );
          return;
        }

        // If no catalog loaded, auto-populate it from imported items
        if (catalog.length === 0) {
          const products = result.items.map(({ qty, ...product }) => product);
          setCatalog(products);
        }

        setOrder(result.items);

        const totalQty = result.items.reduce((s, i) => s + i.qty, 0);
        toast.success(
          `${result.matched} référence(s) importée(s) — ${totalQty} article(s) au total`
        );

        if (result.notFound.length > 0) {
          toast.warning(
            `${result.notFound.length} référence(s) ignorée(s) (données incomplètes) : ${result.notFound.slice(0, 5).join(", ")}${result.notFound.length > 5 ? "..." : ""}`
          );
        }
      } catch (err) {
        toast.error(
          "Erreur lors de la lecture du fichier: " +
            (err instanceof Error ? err.message : "Erreur inconnue")
        );
      }
      setModalOpen(false);
      setPendingData(null);
    },
    [pendingData, catalog, setOrder, setCatalog]
  );

  const handleCancel = useCallback(() => {
    setModalOpen(false);
    setPendingData(null);
  }, []);

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-[14px] p-8 text-center cursor-pointer transition-all duration-400 relative overflow-hidden ${
          dragOver
            ? "border-transparent bg-bg-hover -translate-y-0.5"
            : "border-border-glow bg-glass-bg hover:border-transparent hover:bg-bg-hover hover:-translate-y-0.5"
        }`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
          }}
        />
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-secondary-dim flex items-center justify-center transition-all duration-400">
          <FileSpreadsheet className="w-7 h-7 text-secondary-purple" strokeWidth={1.8} />
        </div>
        <div className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-wider mb-1.5">
          IMPORTER UNE COMMANDE
        </div>
        <div className="text-text-secondary text-[13px] mb-3">
          Glissez un fichier ou cliquez — le mapping des colonnes sera proposé automatiquement
        </div>
        <div className="flex gap-2 justify-center">
          {[".XLSX", ".XLS", ".CSV"].map((fmt) => (
            <span
              key={fmt}
              className="px-2.5 py-0.5 rounded-lg font-[family-name:var(--font-mono)] text-[10px] font-semibold bg-secondary-dim text-secondary-purple border border-[rgba(123,47,255,0.2)]"
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      <ColumnMappingModal
        open={modalOpen}
        rawData={pendingData}
        mode="commande"
        requiredFields={requiredFields}
        onConfirm={handleConfirmMapping}
        onCancel={handleCancel}
      />
    </>
  );
}
