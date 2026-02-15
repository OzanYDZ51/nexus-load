import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const order = await prisma.order.findFirst({
    orderBy: { updatedAt: "desc" },
  });
  if (!order) return NextResponse.json(null);
  return NextResponse.json({ items: order.items, id: order.id });
}

export async function PUT(req: Request) {
  const { items } = await req.json();

  // Upsert: reuse latest order or create new one
  const existing = await prisma.order.findFirst({
    orderBy: { updatedAt: "desc" },
  });

  const catalog = await prisma.catalog.findUnique({
    where: { name: "default" },
  });

  if (existing) {
    const order = await prisma.order.update({
      where: { id: existing.id },
      data: { items, catalogId: catalog?.id ?? null },
    });
    return NextResponse.json({ id: order.id });
  }

  const order = await prisma.order.create({
    data: { items, catalogId: catalog?.id ?? null },
  });
  return NextResponse.json({ id: order.id });
}

export async function DELETE() {
  await prisma.order.deleteMany();
  return NextResponse.json({ ok: true });
}
