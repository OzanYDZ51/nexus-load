import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const opt = await prisma.optimization.findFirst({
    orderBy: { createdAt: "desc" },
  });
  if (!opt) return NextResponse.json(null);
  return NextResponse.json({ trucks: opt.trucks });
}

export async function POST(req: Request) {
  const { trucks, historyEntry } = await req.json();

  const order = await prisma.order.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!order) {
    return NextResponse.json({ error: "No order found" }, { status: 400 });
  }

  // Delete previous optimization for this order if exists
  await prisma.optimization.deleteMany({
    where: { orderId: order.id },
  });

  // Create history entry
  const history = await prisma.historyEntry.create({
    data: {
      date: historyEntry.date,
      items: historyEntry.items,
      weight: historyEntry.weight,
      volume: historyEntry.volume,
      trucks: historyEntry.trucks,
      efficiency: historyEntry.efficiency,
    },
  });

  // Create optimization linked to order and history
  const opt = await prisma.optimization.create({
    data: {
      trucks,
      orderId: order.id,
      historyId: history.id,
    },
  });

  return NextResponse.json({ id: opt.id });
}

export async function DELETE() {
  await prisma.optimization.deleteMany();
  return NextResponse.json({ ok: true });
}
