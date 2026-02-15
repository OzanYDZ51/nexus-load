"use client";

import Link from "next/link";
import { Rocket, Download } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ResultStats } from "@/components/optimisation/result-stats";
import { TruckViewer } from "@/components/optimisation/truck-viewer";
import { TruckNav } from "@/components/optimisation/truck-nav";
import { TruckCards } from "@/components/optimisation/truck-cards";
import { useNexusStore } from "@/lib/store";
import { exportTrucksToExcel } from "@/lib/excel-export";

export default function OptimisationPage() {
  const trucks = useNexusStore((s) => s.optimizationResults);

  return (
    <>
      <PageHeader
        title="Résultats d'Optimisation"
        subtitle="Plan de chargement optimisé par l'intelligence artificielle NEXUS"
      />

      {!trucks ? (
        <div className="text-center py-15 text-text-dim">
          <Rocket className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <div className="text-[15px] mb-5">
            Lancez une optimisation depuis l&apos;onglet Commande pour voir les
            résultats
          </div>
          <Link
            href="/commande"
            className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-br from-primary-cyan to-[#00b8d4] text-bg-deep rounded-lg text-sm font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            Aller à Commande
          </Link>
        </div>
      ) : (
        <>
          <ResultStats />
          <div className="flex justify-end mb-4">
            <button
              onClick={() => exportTrucksToExcel(trucks)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-glass-bg border border-glass-border rounded-xl text-sm font-semibold text-primary-cyan transition-all duration-200 hover:border-border-glow hover:shadow-[0_0_20px_rgba(0,240,255,0.15)] hover:-translate-y-0.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Exporter Excel
            </button>
          </div>
          <TruckViewer />
          <TruckNav />
          <TruckCards />
        </>
      )}
    </>
  );
}
