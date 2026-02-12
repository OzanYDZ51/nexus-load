"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { parseExcelFile } from "@/lib/excel-parser";
import { useNexusStore } from "@/lib/store";

export function UploadZone() {
  const setCatalog = useNexusStore((s) => s.setCatalog);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["xlsx", "xls", "csv"].includes(ext)) {
        toast.error("Format non supporté. Utilisez .xlsx, .xls ou .csv");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const products = parseExcelFile(buffer);
          setCatalog(products);
          toast.success(`${products.length} produits importés avec succès`);
        } catch (err) {
          toast.error(
            "Erreur lors de la lecture du fichier: " +
              (err instanceof Error ? err.message : "Erreur inconnue")
          );
        }
      };
      reader.readAsArrayBuffer(file);
    },
    [setCatalog]
  );

  return (
    <div
      className={`border-2 border-dashed rounded-[20px] p-15 text-center cursor-pointer transition-all duration-400 relative overflow-hidden ${
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
      <div className="w-[72px] h-[72px] mx-auto mb-5 rounded-full bg-primary-dim flex items-center justify-center transition-all duration-400 hover:scale-110">
        <Upload className="w-8 h-8 text-primary-cyan" strokeWidth={1.8} />
      </div>
      <div className="font-[family-name:var(--font-display)] text-base font-semibold tracking-wider mb-2">
        GLISSEZ VOTRE FICHIER ICI
      </div>
      <div className="text-text-secondary text-sm">
        ou cliquez pour sélectionner un fichier
      </div>
      <div className="mt-4 flex gap-2 justify-center">
        {[".XLSX", ".XLS", ".CSV"].map((fmt) => (
          <span
            key={fmt}
            className="px-3 py-1 rounded-xl font-[family-name:var(--font-mono)] text-[11px] font-semibold bg-secondary-dim text-secondary-purple border border-[rgba(123,47,255,0.2)]"
          >
            {fmt}
          </span>
        ))}
      </div>
    </div>
  );
}
