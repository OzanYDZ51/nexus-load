"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Check, AlertTriangle, Columns3 } from "lucide-react";
import type {
  ColumnMapping,
  MappableField,
  RawExcelData,
} from "@/lib/column-mapping";
import {
  autoDetectMapping,
  validateMapping,
  FIELD_LABELS,
} from "@/lib/column-mapping";

interface ColumnMappingModalProps {
  open: boolean;
  rawData: RawExcelData | null;
  mode: "catalogue" | "commande";
  requiredFields: MappableField[];
  onConfirm: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

const ALL_FIELDS: MappableField[] = [
  "reference",
  "quantite",
  "poids",
  "longueur",
  "largeur",
  "hauteur",
];

export function ColumnMappingModal({
  open,
  rawData,
  mode,
  requiredFields,
  onConfirm,
  onCancel,
}: ColumnMappingModalProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({});

  // Auto-detect when rawData changes
  useEffect(() => {
    if (rawData) {
      setMapping(autoDetectMapping(rawData.headers));
    }
  }, [rawData]);

  const validation = useMemo(
    () => validateMapping(mapping, requiredFields),
    [mapping, requiredFields]
  );

  // Fields to show based on mode
  const fieldsToShow = mode === "catalogue"
    ? ALL_FIELDS.filter((f) => f !== "quantite")
    : ALL_FIELDS;

  if (!open || !rawData) return null;

  const { headers, previewRows, fileName } = rawData;

  const handleFieldChange = (field: MappableField, value: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (value === "") {
        delete next[field];
      } else {
        next[field] = parseInt(value);
      }
      return next;
    });
  };

  // Set of mapped column indices for highlighting
  const mappedCols = new Set(
    Object.values(mapping).filter((v): v is number => v !== undefined)
  );

  return (
    <div
      className="fixed inset-0 bg-[rgba(6,6,15,0.92)] backdrop-blur-[10px] z-[1000] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-[640px] max-w-[95vw] max-h-[90vh] bg-bg-surface border border-border-glow rounded-[20px] overflow-hidden flex flex-col animate-[modalAppear_0.3s_ease-out]"
        style={{
          boxShadow:
            "0 0 80px rgba(0, 240, 255, 0.08), 0 0 160px rgba(123, 47, 255, 0.04)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-dim flex items-center justify-center">
              <Columns3 className="w-5 h-5 text-primary-cyan" strokeWidth={1.8} />
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-sm font-bold tracking-wider text-text-primary">
                MAPPING DES COLONNES
              </h2>
              <p className="text-text-secondary text-xs mt-0.5">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-bg-card flex items-center justify-center text-text-dim hover:text-text-primary hover:bg-bg-hover transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          {/* Preview table */}
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-2">
              Aperçu du fichier ({headers.length} colonnes)
            </p>
            <div className="overflow-x-auto rounded-xl border border-border-subtle">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-bg-card">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className={`px-3 py-2.5 text-left font-semibold whitespace-nowrap border-b border-border-subtle transition-colors ${
                          mappedCols.has(i)
                            ? "text-primary-cyan bg-primary-dim"
                            : "text-text-secondary"
                        }`}
                      >
                        {h || `Col ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, ri) => (
                    <tr key={ri} className="border-b border-border-subtle last:border-0">
                      {headers.map((_, ci) => (
                        <td
                          key={ci}
                          className={`px-3 py-2 whitespace-nowrap transition-colors ${
                            mappedCols.has(ci)
                              ? "text-text-primary bg-[rgba(0,240,255,0.05)]"
                              : "text-text-dim"
                          }`}
                        >
                          {String((row as unknown[])[ci] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mapping form */}
          <div>
            <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-3">
              Associer les champs
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {fieldsToShow.map((field) => {
                const isRequired = requiredFields.includes(field);
                const isMapped = mapping[field] !== undefined;
                const isDuplicate = validation.duplicateCols.includes(mapping[field]!);

                return (
                  <div
                    key={field}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all ${
                      isDuplicate
                        ? "border-danger bg-[rgba(255,68,68,0.08)]"
                        : isMapped
                          ? "border-border-glow bg-[rgba(0,240,255,0.04)]"
                          : isRequired
                            ? "border-[rgba(255,170,0,0.3)] bg-[rgba(255,170,0,0.04)]"
                            : "border-border-subtle bg-bg-card"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-text-primary">
                        {FIELD_LABELS[field]}
                      </span>
                      {isRequired && !isMapped && (
                        <span className="text-warning text-[10px] ml-1">*</span>
                      )}
                    </div>
                    <select
                      value={mapping[field] !== undefined ? String(mapping[field]) : ""}
                      onChange={(e) => handleFieldChange(field, e.target.value)}
                      className="bg-bg-deep text-text-primary text-xs rounded-lg border border-border-subtle px-2 py-1.5 min-w-[140px] focus:outline-none focus:border-primary-cyan transition-colors cursor-pointer"
                    >
                      <option value="">— Non mappé —</option>
                      {headers.map((h, i) => (
                        <option key={i} value={String(i)}>
                          {h || `Colonne ${i + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Validation warnings */}
          {!validation.valid && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-[rgba(255,170,0,0.08)] border border-[rgba(255,170,0,0.2)]">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="text-xs text-warning">
                {validation.missingFields.length > 0 && (
                  <p>
                    Champs obligatoires manquants :{" "}
                    {validation.missingFields
                      .map((f) => FIELD_LABELS[f])
                      .join(", ")}
                  </p>
                )}
                {validation.duplicateCols.length > 0 && (
                  <p>Une même colonne ne peut pas être utilisée pour plusieurs champs.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-7 py-4 border-t border-border-subtle">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-text-secondary hover:text-text-primary bg-bg-card hover:bg-bg-hover border border-border-subtle transition-all"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(mapping)}
            disabled={!validation.valid}
            className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              validation.valid
                ? "bg-gradient-to-r from-primary-cyan to-secondary-purple text-bg-deep hover:opacity-90 shadow-[0_4px_20px_rgba(0,240,255,0.2)]"
                : "bg-bg-card text-text-dim border border-border-subtle cursor-not-allowed"
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            Confirmer le mapping
          </button>
        </div>
      </div>
    </div>
  );
}
