"use client";

import { PageHeader } from "@/components/layout/page-header";
import { StatCards } from "@/components/dashboard/stat-cards";
import { FillRateChart } from "@/components/dashboard/fill-rate-chart";
import { VolumeChart } from "@/components/dashboard/volume-chart";
import { HistoryTable } from "@/components/dashboard/history-table";

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Tableau de Bord"
        subtitle="Vue d'ensemble de l'activité logistique et métriques de performance"
      />
      <StatCards />
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-7">
        <FillRateChart />
        <VolumeChart />
      </div>
      <HistoryTable />
    </>
  );
}
