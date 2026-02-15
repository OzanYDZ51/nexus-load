import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const catalog = await prisma.catalog.findUnique({
    where: { name: "default" },
  });
  if (!catalog) return NextResponse.json(null);
  return NextResponse.json({ products: catalog.products });
}

export async function PUT(req: Request) {
  const { products } = await req.json();
  const catalog = await prisma.catalog.upsert({
    where: { name: "default" },
    update: { products },
    create: { name: "default", products },
  });
  return NextResponse.json({ id: catalog.id });
}

export async function DELETE() {
  await prisma.catalog.deleteMany({ where: { name: "default" } });
  return NextResponse.json({ ok: true });
}
