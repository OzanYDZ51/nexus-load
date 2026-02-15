import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const entries = await prisma.historyEntry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    entries.map((e) => ({
      id: e.id,
      date: e.date,
      items: e.items,
      weight: e.weight,
      volume: e.volume,
      trucks: e.trucks,
      efficiency: e.efficiency,
    }))
  );
}

export async function DELETE() {
  // Delete optimizations referencing history entries first
  await prisma.optimization.updateMany({
    data: { historyId: null },
  });
  await prisma.historyEntry.deleteMany();
  return NextResponse.json({ ok: true });
}
